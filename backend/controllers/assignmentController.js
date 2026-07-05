const assignmentService = require('../services/assignmentService');
const { getPaginationParams, buildPaginationMeta } = require('../utils/helpers');

const assignmentController = {
  async create(req, res) {
    try {
      const assignment = await assignmentService.create(req.body, req.user.userId, req.user.userId);

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await assignmentService.addAttachment(assignment.id, file);
        }
      }

      res.status(201).json(assignment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const assignment = await assignmentService.getById(req.params.id);
      assignment.status = await assignmentService.getAssignmentStatus(assignment);
      res.json(assignment);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPaginationParams(req.query);
      const { type, status, search, classId, studentId, dueDateFrom, dueDateTo } = req.query;

      const filters = {
        type, status, search,
        classId: classId ? parseInt(classId) : null,
        studentId: studentId ? parseInt(studentId) : null,
        dueDateFrom, dueDateTo,
        page, limit, offset,
      };

      if (req.user.role === 'teacher') {
        filters.teacherId = req.user.userId;
      }

      const result = await assignmentService.getAll(filters);

      const assignmentsWithStatus = await Promise.all(
        result.assignments.map(async (a) => ({
          ...a,
          status: await assignmentService.getAssignmentStatus(a),
        }))
      );

      res.json({
        assignments: assignmentsWithStatus,
        pagination: buildPaginationMeta(result.total, page, limit),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const assignment = await assignmentService.update(parseInt(req.params.id), req.body, req.user.userId);
      res.json(assignment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      await assignmentService.delete(parseInt(req.params.id), req.user.userId);
      res.json({ message: 'Assignment deleted successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async archive(req, res) {
    try {
      const assignment = await assignmentService.archive(parseInt(req.params.id), req.user.userId);
      res.json(assignment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};

module.exports = assignmentController;
