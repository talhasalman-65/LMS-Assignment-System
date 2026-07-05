const db = require('../config/database');

const auditLog = {
  async log(actorId, action, entityType = null, entityId = null, beforeValue = null, afterValue = null, ipAddress = null, userAgent = null) {
    try {
      await db.query(
        `INSERT INTO system_logs (actor_id, action, entity_type, entity_id, before_value, after_value, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [actorId, action, entityType, entityId, beforeValue ? JSON.stringify(beforeValue) : null, afterValue ? JSON.stringify(afterValue) : null, ipAddress, userAgent]
      );
    } catch (err) {
      console.error('Audit log error:', err.message);
    }
  },
};

const activityLogger = {
  async log(userId, activityType, description, metadata = null) {
    try {
      await db.query(
        `INSERT INTO activity_log (user_id, activity_type, description, metadata)
         VALUES ($1, $2, $3, $4)`,
        [userId, activityType, description, metadata ? JSON.stringify(metadata) : null]
      );
    } catch (err) {
      console.error('Activity log error:', err.message);
    }
  },
};

module.exports = { auditLog, activityLogger };
