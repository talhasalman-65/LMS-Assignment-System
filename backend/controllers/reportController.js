const reportService = require('../services/reportService');

const reportController = {
  async teacherStats(req, res) {
    try {
      const stats = await reportService.getTeacherStats(req.user.userId);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async teacherPerformance(req, res) {
    try {
      const data = await reportService.getTeacherPerformance(req.user.userId, parseInt(req.params.assignmentId));
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async missingAssignments(req, res) {
    try {
      const data = await reportService.getMissingAssignments(parseInt(req.params.assignmentId));
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async adminStats(req, res) {
    try {
      const stats = await reportService.getAdminStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async userGrowth(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await reportService.getUserGrowth(days);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async teacherActivity(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await reportService.getTeacherActivity(days);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = reportController;
