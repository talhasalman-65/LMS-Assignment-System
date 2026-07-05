const settingsService = require('../services/settingsService');

const settingsController = {
  async getAll(req, res) {
    try {
      const settings = await settingsService.getAll();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const result = await settingsService.update(req.body.key, req.body.value, req.user.userId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async updateBulk(req, res) {
    try {
      await settingsService.updateBulk(req.body.settings, req.user.userId);
      res.json({ message: 'Settings updated' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};

module.exports = settingsController;
