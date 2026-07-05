const db = require('../config/database');

const assignmentRepository = {
  async create({ teacherId, title, description, instructions, assignmentType, dueDate, maxMarks, allowedFileTypes, maxAttempts }) {
    const result = await db.query(
      `INSERT INTO assignments (teacher_id, title, description, instructions, assignment_type, due_date, max_marks, allowed_file_types, max_attempts)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [teacherId, title, description || null, instructions || null, assignmentType || 'homework', dueDate, maxMarks, allowedFileTypes || ['pdf', 'docx', 'zip'], maxAttempts || 3]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await db.query(
      'SELECT * FROM assignments WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0] || null;
  },

  async findWithDetails(id) {
    const result = await db.query(
      `SELECT a.*, u.full_name as teacher_name,
        COALESCE(
          json_agg(json_build_object('targetType', at.target_type, 'targetId', at.target_id)) FILTER (WHERE at.id IS NOT NULL),
          '[]'
        ) as targets,
        COALESCE(
          json_agg(json_build_object('id', aa.id, 'fileName', aa.file_name, 'filePath', aa.file_path, 'fileSize', aa.file_size, 'mimeType', aa.mime_type)) FILTER (WHERE aa.id IS NOT NULL),
          '[]'
        ) as attachments
       FROM assignments a
       JOIN users u ON a.teacher_id = u.id
       LEFT JOIN assignment_targets at ON a.id = at.assignment_id
       LEFT JOIN assignment_attachments aa ON a.id = aa.assignment_id
       WHERE a.id = $1 AND a.deleted_at IS NULL
       GROUP BY a.id, u.full_name`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll({ teacherId, type, status, search, classId, studentId, dueDateFrom, dueDateTo, page, limit, offset }) {
    let query = 'SELECT a.*, u.full_name as teacher_name FROM assignments a JOIN users u ON a.teacher_id = u.id WHERE a.deleted_at IS NULL';
    let countQuery = 'SELECT COUNT(*) FROM assignments a JOIN users u ON a.teacher_id = u.id WHERE a.deleted_at IS NULL';
    const params = [];
    const countParams = [];
    let paramIndex = 0;

    if (teacherId) {
      paramIndex++;
      query += ` AND a.teacher_id = $${paramIndex}`;
      countQuery += ` AND a.teacher_id = $${paramIndex}`;
      params.push(teacherId);
      countParams.push(teacherId);
    }

    if (type) {
      paramIndex++;
      query += ` AND a.assignment_type = $${paramIndex}`;
      countQuery += ` AND a.assignment_type = $${paramIndex}`;
      params.push(type);
      countParams.push(type);
    }

    if (status === 'active') {
      query += ' AND a.due_date > CURRENT_TIMESTAMP AND a.is_archived = FALSE';
      countQuery += ' AND a.due_date > CURRENT_TIMESTAMP AND a.is_archived = FALSE';
    } else if (status === 'due_soon') {
      query += " AND a.due_date > CURRENT_TIMESTAMP AND a.due_date <= CURRENT_TIMESTAMP + INTERVAL '48 hours' AND a.is_archived = FALSE";
      countQuery += " AND a.due_date > CURRENT_TIMESTAMP AND a.due_date <= CURRENT_TIMESTAMP + INTERVAL '48 hours' AND a.is_archived = FALSE";
    } else if (status === 'expired') {
      query += ' AND a.due_date < CURRENT_TIMESTAMP AND a.is_archived = FALSE';
      countQuery += ' AND a.due_date < CURRENT_TIMESTAMP AND a.is_archived = FALSE';
    } else if (status === 'archived') {
      query += ' AND a.is_archived = TRUE';
      countQuery += ' AND a.is_archived = TRUE';
    }

    if (search) {
      paramIndex++;
      const searchPattern = `%${search}%`;
      query += ` AND a.title ILIKE $${paramIndex}`;
      countQuery += ` AND a.title ILIKE $${paramIndex}`;
      params.push(searchPattern);
      countParams.push(searchPattern);
    }

    if (classId) {
      paramIndex++;
      query += ` AND EXISTS (SELECT 1 FROM assignment_targets at2 WHERE at2.assignment_id = a.id AND at2.target_type = 'class' AND at2.target_id = $${paramIndex})`;
      countQuery += ` AND EXISTS (SELECT 1 FROM assignment_targets at2 WHERE at2.assignment_id = a.id AND at2.target_type = 'class' AND at2.target_id = $${paramIndex})`;
      params.push(classId);
      countParams.push(classId);
    }

    if (studentId) {
      paramIndex++;
      query += ` AND EXISTS (SELECT 1 FROM assignment_targets at2 WHERE at2.assignment_id = a.id AND ((at2.target_type = 'student' AND at2.target_id = $${paramIndex}) OR (at2.target_type = 'class' AND at2.target_id IN (SELECT class_id FROM users WHERE id = $${paramIndex}))))`;
      countQuery += ` AND EXISTS (SELECT 1 FROM assignment_targets at2 WHERE at2.assignment_id = a.id AND ((at2.target_type = 'student' AND at2.target_id = $${paramIndex}) OR (at2.target_type = 'class' AND at2.target_id IN (SELECT class_id FROM users WHERE id = $${paramIndex}))))`;
      params.push(studentId);
      countParams.push(studentId);
    }

    if (dueDateFrom) {
      paramIndex++;
      query += ` AND a.due_date >= $${paramIndex}`;
      countQuery += ` AND a.due_date >= $${paramIndex}`;
      params.push(dueDateFrom);
      countParams.push(dueDateFrom);
    }

    if (dueDateTo) {
      paramIndex++;
      query += ` AND a.due_date <= $${paramIndex}`;
      countQuery += ` AND a.due_date <= $${paramIndex}`;
      params.push(dueDateTo);
      countParams.push(dueDateTo);
    }

    query += ' ORDER BY a.due_date ASC';

    if (limit) {
      paramIndex++;
      query += ` LIMIT $${paramIndex}`;
      params.push(limit);
    }

    if (offset) {
      paramIndex++;
      query += ` OFFSET $${paramIndex}`;
      params.push(offset);
    }

    const [dataResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams),
    ]);

    return { assignments: dataResult.rows, total: parseInt(countResult.rows[0].count) };
  },

  async update(id, fields) {
    const setClauses = [];
    const params = [];
    let paramIndex = 0;

    const fieldMap = {
      title: 'title',
      description: 'description',
      instructions: 'instructions',
      assignmentType: 'assignment_type',
      dueDate: 'due_date',
      maxMarks: 'max_marks',
      allowedFileTypes: 'allowed_file_types',
      maxAttempts: 'max_attempts',
      isArchived: 'is_archived',
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && fieldMap[key]) {
        paramIndex++;
        setClauses.push(`${fieldMap[key]} = $${paramIndex}`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) return null;

    paramIndex++;
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const result = await db.query(
      `UPDATE assignments SET ${setClauses.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      params
    );
    return result.rows[0] || null;
  },

  async softDelete(id) {
    await db.query(
      'UPDATE assignments SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  },

  async addTargets(assignmentId, targets) {
    if (!targets || targets.length === 0) return;
    const values = targets.map((t, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(', ');
    const params = [assignmentId];
    targets.forEach(t => { params.push(t.targetType); params.push(t.targetId); });
    await db.query(
      `INSERT INTO assignment_targets (assignment_id, target_type, target_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      params
    );
  },

  async removeTargets(assignmentId) {
    await db.query('DELETE FROM assignment_targets WHERE assignment_id = $1', [assignmentId]);
  },

  async addAttachment({ assignmentId, fileName, filePath, fileSize, mimeType }) {
    const result = await db.query(
      `INSERT INTO assignment_attachments (assignment_id, file_name, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [assignmentId, fileName, filePath, fileSize, mimeType]
    );
    return result.rows[0];
  },

  async getTargets(assignmentId) {
    const result = await db.query(
      'SELECT * FROM assignment_targets WHERE assignment_id = $1',
      [assignmentId]
    );
    return result.rows;
  },

  async getCountByTeacher(teacherId) {
    const result = await db.query(
      'SELECT COUNT(*)::int as count FROM assignments WHERE teacher_id = $1 AND deleted_at IS NULL AND is_archived = FALSE',
      [teacherId]
    );
    return result.rows[0].count;
  },

  async getTotalCount() {
    const result = await db.query(
      'SELECT COUNT(*)::int as count FROM assignments WHERE deleted_at IS NULL'
    );
    return result.rows[0].count;
  },
};

module.exports = assignmentRepository;
