const db = require('../config/database');

const classRepository = {
  async findAll() {
    const result = await db.query(
      'SELECT * FROM classes WHERE deleted_at IS NULL ORDER BY name'
    );
    return result.rows;
  },

  async findById(id) {
    const result = await db.query(
      'SELECT * FROM classes WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ name, description }) {
    const result = await db.query(
      'INSERT INTO classes (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    return result.rows[0];
  },

  async update(id, fields) {
    const sets = [];
    const params = [];
    let i = 0;
    if (fields.name !== undefined) { i++; sets.push(`name = $${i}`); params.push(fields.name); }
    if (fields.description !== undefined) { i++; sets.push(`description = $${i}`); params.push(fields.description); }
    if (sets.length === 0) return null;
    i++; sets.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    const result = await db.query(
      `UPDATE classes SET ${sets.join(', ')} WHERE id = $${i} AND deleted_at IS NULL RETURNING *`,
      params
    );
    return result.rows[0] || null;
  },

  async softDelete(id) {
    await db.query('UPDATE classes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  },
};

module.exports = classRepository;
