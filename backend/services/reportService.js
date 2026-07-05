const db = require('../config/database');

const reportService = {
  async getTeacherStats(teacherId) {
    const stats = await db.query(
      `SELECT
        COUNT(DISTINCT a.id)::int as total_assignments,
        COUNT(DISTINCT s.id)::int as total_submissions,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'submitted')::int as pending_reviews,
        COUNT(DISTINCT s.id) FILTER (WHERE s.is_late = TRUE)::int as late_submissions,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graded')::int as graded_submissions
       FROM assignments a
       LEFT JOIN submissions s ON a.id = s.assignment_id AND s.deleted_at IS NULL
       WHERE a.teacher_id = $1 AND a.deleted_at IS NULL`,
      [teacherId]
    );
    return stats.rows[0];
  },

  async getTeacherPerformance(teacherId, assignmentId) {
    const results = await db.query(
      `SELECT u.id, u.full_name, u.roll_number,
        MAX(s.version) as attempts,
        s.status,
        COALESCE(sr.marks, NULL) as marks,
        COALESCE(sr.grade, NULL) as grade,
        s.is_late,
        s.submitted_at
       FROM users u
       JOIN assignment_targets at ON (
         (at.target_type = 'student' AND at.target_id = u.id) OR
         (at.target_type = 'class' AND at.target_id = u.class_id)
       )
       LEFT JOIN submissions s ON s.assignment_id = at.assignment_id AND s.student_id = u.id AND s.deleted_at IS NULL
       LEFT JOIN submission_reviews sr ON s.id = sr.submission_id AND sr.is_finalized = TRUE
       WHERE at.assignment_id = $1 AND u.deleted_at IS NULL
       GROUP BY u.id, u.full_name, u.roll_number, s.status, sr.marks, sr.grade, s.is_late, s.submitted_at
       ORDER BY u.full_name`,
      [assignmentId]
    );
    return results.rows;
  },

  async getAdminStats() {
    const stats = await db.query(
      `SELECT
        (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL AND role = 'student') as total_students,
        (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL AND role = 'teacher') as total_teachers,
        (SELECT COUNT(*)::int FROM users WHERE deleted_at IS NULL AND role = 'administrator') as total_admins,
        (SELECT COUNT(*)::int FROM assignments WHERE deleted_at IS NULL) as total_assignments,
        (SELECT COUNT(*)::int FROM submissions WHERE deleted_at IS NULL) as total_submissions,
        (SELECT COUNT(*)::int FROM submissions WHERE deleted_at IS NULL AND status = 'submitted') as pending_submissions,
        (SELECT COUNT(*)::int FROM submissions WHERE deleted_at IS NULL AND is_late = TRUE) as late_submissions,
        (SELECT ROUND(COUNT(*)::numeric * 100.0 / NULLIF((SELECT COUNT(*)::numeric FROM assignments WHERE deleted_at IS NULL), 0), 2) FROM assignments WHERE deleted_at IS NULL AND due_date < CURRENT_TIMESTAMP) as completion_rate`
    );
    return stats.rows[0];
  },

  async getUserGrowth(days = 30) {
    const result = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*)::int as count, role
       FROM users
       WHERE created_at >= CURRENT_DATE - $1::interval AND deleted_at IS NULL
       GROUP BY DATE(created_at), role
       ORDER BY date`,
      [`${days} days`]
    );
    return result.rows;
  },

  async getTeacherActivity(days = 30) {
    const result = await db.query(
      `SELECT u.id, u.full_name,
        COUNT(a.id)::int as assignments_created,
        COUNT(sr.id)::int as submissions_reviewed
       FROM users u
       LEFT JOIN assignments a ON u.id = a.teacher_id AND a.created_at >= CURRENT_DATE - $1::interval AND a.deleted_at IS NULL
       LEFT JOIN submission_reviews sr ON u.id = sr.reviewer_id AND sr.created_at >= CURRENT_DATE - $1::interval
       WHERE u.role = 'teacher' AND u.deleted_at IS NULL
       GROUP BY u.id, u.full_name
       ORDER BY assignments_created DESC`,
      [`${days} days`]
    );
    return result.rows;
  },

  async getMissingAssignments(assignmentId) {
    const result = await db.query(
      `SELECT u.id, u.full_name, u.roll_number, u.email
       FROM users u
       WHERE u.deleted_at IS NULL AND u.role = 'student'
       AND (
         u.id IN (SELECT target_id FROM assignment_targets WHERE assignment_id = $1 AND target_type = 'student')
         OR u.class_id IN (SELECT target_id FROM assignment_targets WHERE assignment_id = $1 AND target_type = 'class')
       )
       AND u.id NOT IN (SELECT student_id FROM submissions WHERE assignment_id = $1 AND deleted_at IS NULL)
       ORDER BY u.full_name`,
      [assignmentId]
    );
    return result.rows;
  },
};

module.exports = reportService;
