const classRepository = require('../repositories/classRepository');

const classController = {
  async getAll(req, res) {
    try {
      const classes = await classRepository.findAll();
      res.json(classes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const cls = await classRepository.findById(req.params.id);
      if (!cls) return res.status(404).json({ error: 'Class not found' });
      res.json(cls);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const cls = await classRepository.create(req.body);
      res.status(201).json(cls);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const cls = await classRepository.update(parseInt(req.params.id), req.body);
      if (!cls) return res.status(404).json({ error: 'Class not found' });
      res.json(cls);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      await classRepository.softDelete(parseInt(req.params.id));
      res.json({ message: 'Class deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = classController;
