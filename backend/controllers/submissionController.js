const submissionService = require('../services/submissionService');
const { getPaginationParams, buildPaginationMeta } = require('../utils/helpers');

const submissionController = {
  async submit(req, res) {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      const submission = await submissionService.submit(assignmentId, req.user.userId, req.files);
      res.status(201).json(submission);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async getHistory(req, res) {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      const submissions = await submissionService.getSubmissionHistory(assignmentId, req.user.userId);
      res.json(submissions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPaginationParams(req.query);
      const { assignmentId, studentId, status, classId, search, isLate } = req.query;

      const filters = {
        assignmentId: assignmentId ? parseInt(assignmentId) : null,
        studentId: studentId ? parseInt(studentId) : null,
        status, classId: classId ? parseInt(classId) : null,
        search, isLate: isLate !== undefined ? isLate === 'true' : undefined,
        page, limit, offset,
      };

      if (req.user.role === 'teacher') {
        filters.teacherId = req.user.userId;
      } else if (req.user.role === 'student') {
        filters.studentId = req.user.userId;
      }

      const result = await submissionService.getAll(filters);
      res.json({
        submissions: result.submissions,
        pagination: buildPaginationMeta(result.total, page, limit),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const submission = await submissionService.getById(req.params.id, req.user);
      res.json(submission);
    } catch (err) {
      const status = err.statusCode || 404;
      res.status(status).json({ error: err.message });
    }
  },

  async grade(req, res) {
    try {
      const result = await submissionService.grade(parseInt(req.params.id), req.user, req.body);
      res.json(result);
    } catch (err) {
      const status = err.statusCode || 400;
      res.status(status).json({ error: err.message });
    }
  },

  async finalize(req, res) {
    try {
      const result = await submissionService.finalizeGrade(parseInt(req.params.id), req.user);
      res.json(result);
    } catch (err) {
      const status = err.statusCode || 400;
      res.status(status).json({ error: err.message });
    }
  },

  async returnForRevision(req, res) {
    try {
      await submissionService.returnForRevision(parseInt(req.params.id), req.user, req.body.feedback);
      res.json({ message: 'Submission returned for revision' });
    } catch (err) {
      const status = err.statusCode || 400;
      res.status(status).json({ error: err.message });
    }
  },
};

module.exports = submissionController;
