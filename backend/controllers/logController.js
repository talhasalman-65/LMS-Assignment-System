const db = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/helpers');

const logController = {
  async getLogs(req, res) {
    try {
      const { page, limit, offset } = getPaginationParams(req.query);
      const { actorId, action, entityType, dateFrom, dateTo, search } = req.query;
      const searchTerm = search || action;

      let query = 'SELECT sl.*, u.full_name as actor_name FROM system_logs sl LEFT JOIN users u ON sl.actor_id = u.id WHERE 1=1';
      let countQuery = 'SELECT COUNT(*) FROM system_logs sl WHERE 1=1';
      const params = [];
      const countParams = [];
      let i = 0;

      if (actorId) { i++; query += ` AND sl.actor_id = $${i}`; countQuery += ` AND sl.actor_id = $${i}`; params.push(parseInt(actorId)); countParams.push(parseInt(actorId)); }
      if (searchTerm) { i++; query += ` AND sl.action ILIKE $${i}`; countQuery += ` AND sl.action ILIKE $${i}`; params.push(`%${searchTerm}%`); countParams.push(`%${searchTerm}%`); }
      if (entityType) { i++; query += ` AND sl.entity_type = $${i}`; countQuery += ` AND sl.entity_type = $${i}`; params.push(entityType); countParams.push(entityType); }
      if (dateFrom) { i++; query += ` AND sl.created_at >= $${i}`; countQuery += ` AND sl.created_at >= $${i}`; params.push(dateFrom); countParams.push(dateFrom); }
      if (dateTo) { i++; query += ` AND sl.created_at <= $${i}`; countQuery += ` AND sl.created_at <= $${i}`; params.push(dateTo); countParams.push(dateTo); }

      query += ' ORDER BY sl.created_at DESC';

      if (limit) { i++; query += ` LIMIT $${i}`; params.push(limit); }
      if (offset) { i++; query += ` OFFSET $${i}`; params.push(offset); }

      const [dataResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, countParams),
      ]);

      res.json({
        logs: dataResult.rows,
        pagination: buildPaginationMeta(parseInt(countResult.rows[0].count), page, limit),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = logController;
