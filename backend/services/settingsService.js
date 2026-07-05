const db = require('../config/database');
const { auditLog } = require('../utils/logger');

const settingsService = {
  async getAll() {
    const result = await db.query('SELECT key, value, description FROM settings ORDER BY key');
    return result.rows;
  },

  async get(key) {
    const result = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
    return result.rows[0] ? result.rows[0].value : null;
  },

  async update(key, value, actorId) {
    const before = await this.get(key);
    await db.query(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      [key, value]
    );
    await auditLog.log(actorId, 'settings_update', 'settings', null, { key, value: before }, { key, value });
    return { key, value };
  },

  async updateBulk(settings, actorId) {
    for (const { key, value } of settings) {
      await this.update(key, value, actorId);
    }
  },
};

module.exports = settingsService;
