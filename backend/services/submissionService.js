const submissionRepository = require('../repositories/submissionRepository');
const assignmentRepository = require('../repositories/assignmentRepository');
const { calculateGrade } = require('../utils/helpers');
const { auditLog, activityLogger } = require('../utils/logger');

const submissionService = {
  async submit(assignmentId, studentId, files) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');
    if (assignment.is_archived) throw new Error('Cannot submit to archived assignment');

    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const isLate = now > dueDate;

    const existingSubmissions = await submissionRepository.findByAssignmentAndStudent(assignmentId, studentId);
    if (existingSubmissions.length >= assignment.max_attempts) {
      throw new Error(`Maximum submission attempts (${assignment.max_attempts}) reached`);
    }

    const nextVersion = existingSubmissions.length + 1;

    const submission = await submissionRepository.create({
      assignmentId,
      studentId,
      isLate,
      status: 'submitted',
    });

    await submissionRepository.updateStatus(submission.id, 'submitted');

    if (files && files.length > 0) {
      for (const file of files) {
        await submissionRepository.addFile({
          submissionId: submission.id,
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
        });
      }
    }

    await activityLogger.log(studentId, 'assignment_submitted', `Submitted assignment: ${assignment.title} (v${nextVersion})`);

    return submissionRepository.findWithFiles(submission.id);
  },

  async getSubmissionHistory(assignmentId, studentId) {
    return await submissionRepository.findByAssignmentAndStudent(assignmentId, studentId);
  },

  async getAll(filters) {
    return await submissionRepository.findAll(filters);
  },

  async getById(id) {
    const submission = await submissionRepository.findWithFiles(id);
    if (!submission) throw new Error('Submission not found');
    return submission;
  },

  async grade(submissionId, reviewerId, { marks, feedback, reviewNotes, status }) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    const assignment = await assignmentRepository.findById(submission.assignment_id);
    if (!assignment) throw new Error('Assignment not found');

    if (marks > assignment.max_marks) {
      throw new Error(`Marks cannot exceed maximum marks (${assignment.max_marks})`);
    }

    if (marks < 0) {
      throw new Error('Marks cannot be negative');
    }

    const grade = calculateGrade(marks, assignment.max_marks);

    const db = require('../config/database');
    const existingReview = await db.query(
      'SELECT * FROM submission_reviews WHERE submission_id = $1',
      [submissionId]
    );

    let review;
    if (existingReview.rows.length > 0) {
      const before = existingReview.rows[0];
      review = await db.query(
        `UPDATE submission_reviews SET marks = $1, grade = $2, feedback = $3, review_notes = $4, status = $5,
         is_finalized = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *`,
        [marks, grade, feedback || null, reviewNotes || null, status, status === 'graded' ? true : false, existingReview.rows[0].id]
      );
      review = review.rows[0];

      await auditLog.log(reviewerId, 'grade_update', 'submissions', submissionId,
        { marks: before.marks, grade: before.grade, status: before.status },
        { marks, grade, status }
      );
    } else {
      review = await db.query(
        `INSERT INTO submission_reviews (submission_id, reviewer_id, marks, grade, feedback, review_notes, status, is_finalized)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [submissionId, reviewerId, marks, grade, feedback || null, reviewNotes || null, status, status === 'graded']
      );
      review = review.rows[0];

      await auditLog.log(reviewerId, 'grade_create', 'submissions', submissionId, null, { marks, grade, status });
    }

    await submissionRepository.updateStatus(submissionId, status);
    await activityLogger.log(reviewerId, 'submission_graded', `Graded submission for assignment: ${assignment.title}`);

    return review;
  },

  async finalizeGrade(submissionId, reviewerId) {
    const db = require('../config/database');
    const result = await db.query(
      `UPDATE submission_reviews SET is_finalized = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE submission_id = $1 RETURNING *`,
      [submissionId]
    );

    if (result.rows.length > 0) {
      await submissionRepository.updateStatus(submissionId, 'graded');
      await activityLogger.log(reviewerId, 'grade_finalized', 'Grade finalized');
    }

    return result.rows[0] || null;
  },

  async returnForRevision(submissionId, reviewerId, feedback) {
    await submissionRepository.updateStatus(submissionId, 'returned_for_revision');

    const db = require('../config/database');
    await db.query(
      `UPDATE submission_reviews SET status = 'returned_for_revision', feedback = COALESCE($1, feedback), updated_at = CURRENT_TIMESTAMP
       WHERE submission_id = $2`,
      [feedback, submissionId]
    );

    await activityLogger.log(reviewerId, 'submission_returned', 'Submission returned for revision');
  },
};

module.exports = submissionService;
