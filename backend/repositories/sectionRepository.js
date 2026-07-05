const db = require('../config/database');

const sectionRepository = {
  async findAll(classId) {
    let query = 'SELECT * FROM sections WHERE deleted_at IS NULL';
    const params = [];
    if (classId) {
      query += ' AND class_id = $1';
      params.push(classId);
    }
    query += ' ORDER BY name';
    const result = await db.query(query, params);
    return result.rows;
  },

  async findById(id) {
    const result = await db.query(
      'SELECT * FROM sections WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ classId, name, description }) {
    const result = await db.query(
      'INSERT INTO sections (class_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [classId, name, description || null]
    );
    return result.rows[0];
  },

  async update(id, fields) {
    const sets = [];
    const params = [];
    let i = 0;
    if (fields.name !== undefined) { i++; sets.push(`name = $${i}`); params.push(fields.name); }
    if (fields.description !== undefined) { i++; sets.push(`description = $${i}`); params.push(fields.description); }
    if (fields.classId !== undefined) { i++; sets.push(`class_id = $${i}`); params.push(fields.classId); }
    if (sets.length === 0) return null;
    i++; sets.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const result = await db.query(
      `UPDATE sections SET ${sets.join(', ')} WHERE id = $${i} AND deleted_at IS NULL RETURNING *`,
      params
    );
    return result.rows[0] || null;
  },

  async softDelete(id) {
    await db.query('UPDATE sections SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  },
};

module.exports = sectionRepository;
