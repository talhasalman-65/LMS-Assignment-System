const userService = require('../services/userService');
const { getPaginationParams, buildPaginationMeta } = require('../utils/helpers');

const userController = {
  async getAll(req, res) {
    try {
      const { page, limit, offset } = getPaginationParams(req.query);
      let { role, status, classId, sectionId, search } = req.query;

      if (req.user.role === 'teacher') {
        role = 'student';
      }

      const result = await userService.getAll({
        role, status, classId: classId ? parseInt(classId) : null,
        sectionId: sectionId ? parseInt(sectionId) : null,
        search, page, limit, offset,
      });

      res.json({
        users: result.users,
        pagination: buildPaginationMeta(result.total, page, limit),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const user = await userService.getById(req.params.id);
      res.json(user);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const user = await userService.create(req.body, req.user.userId);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const user = await userService.update(parseInt(req.params.id), req.body, req.user.userId);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      await userService.delete(parseInt(req.params.id), req.user.userId);
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async activate(req, res) {
    try {
      const user = await userService.activate(parseInt(req.params.id), req.user.userId);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async suspend(req, res) {
    try {
      const user = await userService.suspend(parseInt(req.params.id), req.user.userId);
      res.json({ message: 'User suspended' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.userId);
      res.json(user);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const user = await userService.updateProfile(req.user.userId, req.body, req.user.userId);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async uploadProfilePicture(req, res) {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const filePath = req.file.path;
      await userService.updateProfile(req.user.userId, { profilePicture: filePath }, req.user.userId);
      res.json({ profilePicture: filePath });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async getActivity(req, res) {
    try {
      const db = require('../config/database');
      const userId = req.params.id || req.user.userId;
      const result = await db.query(
        'SELECT * FROM activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getCounts(req, res) {
    try {
      const userRepository = require('../repositories/userRepository');
      const roleCounts = await userRepository.getCountByRole();
      const total = await userRepository.getTotalCount();
      const counts = { total };
      roleCounts.forEach(r => { counts[r.role] = r.count; });
      res.json(counts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = userController;
