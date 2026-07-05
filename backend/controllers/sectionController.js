const sectionRepository = require('../repositories/sectionRepository');

const sectionController = {
  async getAll(req, res) {
    try {
      const classId = req.query.classId ? parseInt(req.query.classId) : null;
      const sections = await sectionRepository.findAll(classId);
      res.json(sections);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const section = await sectionRepository.findById(req.params.id);
      if (!section) return res.status(404).json({ error: 'Section not found' });
      res.json(section);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const section = await sectionRepository.create(req.body);
      res.status(201).json(section);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const section = await sectionRepository.update(parseInt(req.params.id), req.body);
      if (!section) return res.status(404).json({ error: 'Section not found' });
      res.json(section);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async delete(req, res) {
    try {
      await sectionRepository.softDelete(parseInt(req.params.id));
      res.json({ message: 'Section deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = sectionController;
