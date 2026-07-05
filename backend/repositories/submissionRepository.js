const db = require('../config/database');

const submissionRepository = {
  async create({ assignmentId, studentId, isLate, status }) {
    const result = await db.query(
      `INSERT INTO submissions (assignment_id, student_id, is_late, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [assignmentId, studentId, isLate, status || 'submitted']
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await db.query(
      'SELECT * FROM submissions WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0] || null;
  },

  async findWithFiles(id) {
    const result = await db.query(
      `SELECT s.*,
        u.full_name as student_name,
        a.title as assignment_title,
        a.max_marks,
        COALESCE(
          json_agg(
            json_build_object('id', sf.id, 'fileName', sf.file_name, 'filePath', sf.file_path, 'fileSize', sf.file_size, 'mimeType', sf.mime_type, 'createdAt', sf.created_at)
            ORDER BY sf.created_at
          ) FILTER (WHERE sf.id IS NOT NULL),
          '[]'
        ) as files
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       JOIN assignments a ON s.assignment_id = a.id
       LEFT JOIN submission_files sf ON s.id = sf.submission_id
       WHERE s.id = $1 AND s.deleted_at IS NULL
       GROUP BY s.id, u.full_name, a.title, a.max_marks`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByAssignmentAndStudent(assignmentId, studentId) {
    const result = await db.query(
      `SELECT s.*,
        COALESCE(sr.marks, NULL) as marks, COALESCE(sr.grade, NULL) as grade, sr.feedback,
        COALESCE(
          (SELECT json_agg(json_build_object('id', sf.id, 'fileName', sf.file_name, 'filePath', sf.file_path, 'fileSize', sf.file_size, 'mimeType', sf.mime_type) ORDER BY sf.created_at)
           FROM submission_files sf WHERE sf.submission_id = s.id),
          '[]'
        ) as files
       FROM submissions s
       LEFT JOIN submission_reviews sr ON s.id = sr.submission_id AND sr.is_finalized = TRUE
       WHERE s.assignment_id = $1 AND s.student_id = $2 AND s.deleted_at IS NULL
       ORDER BY s.version DESC`,
      [assignmentId, studentId]
    );
    return result.rows;
  },

  async getLatestByAssignmentAndStudent(assignmentId, studentId) {
    const result = await db.query(
      'SELECT * FROM submissions WHERE assignment_id = $1 AND student_id = $2 AND deleted_at IS NULL ORDER BY version DESC LIMIT 1',
      [assignmentId, studentId]
    );
    return result.rows[0] || null;
  },

  async findAll({ assignmentId, studentId, teacherId, status, classId, search, isLate, page, limit, offset }) {
    let query = `SELECT s.*, u.full_name as student_name, a.title as assignment_title, a.max_marks,
                  COALESCE(sr.marks, NULL) as marks, COALESCE(sr.grade, NULL) as grade, sr.feedback,
                  sr.is_finalized, sr.reviewer_id,
                  COALESCE(
                    (SELECT json_agg(json_build_object('id', sf.id, 'fileName', sf.file_name, 'filePath', sf.file_path, 'fileSize', sf.file_size, 'mimeType', sf.mime_type) ORDER BY sf.created_at)
                     FROM submission_files sf WHERE sf.submission_id = s.id),
                    '[]'
                  ) as files
                 FROM submissions s
                 JOIN users u ON s.student_id = u.id
                 JOIN assignments a ON s.assignment_id = a.id
                 LEFT JOIN submission_reviews sr ON s.id = sr.submission_id AND sr.is_finalized = TRUE
                 WHERE s.deleted_at IS NULL`;
    let countQuery = `SELECT COUNT(*) FROM submissions s
                      JOIN users u ON s.student_id = u.id
                      JOIN assignments a ON s.assignment_id = a.id
                      WHERE s.deleted_at IS NULL`;
    const params = [];
    const countParams = [];
    let paramIndex = 0;

    if (assignmentId) {
      paramIndex++;
      query += ` AND s.assignment_id = $${paramIndex}`;
      countQuery += ` AND s.assignment_id = $${paramIndex}`;
      params.push(assignmentId);
      countParams.push(assignmentId);
    }

    if (studentId) {
      paramIndex++;
      query += ` AND s.student_id = $${paramIndex}`;
      countQuery += ` AND s.student_id = $${paramIndex}`;
      params.push(studentId);
      countParams.push(studentId);
    }

    if (teacherId) {
      paramIndex++;
      query += ` AND a.teacher_id = $${paramIndex}`;
      countQuery += ` AND a.teacher_id = $${paramIndex}`;
      params.push(teacherId);
      countParams.push(teacherId);
    }

    if (status) {
      paramIndex++;
      query += ` AND s.status = $${paramIndex}`;
      countQuery += ` AND s.status = $${paramIndex}`;
      params.push(status);
      countParams.push(status);
    }

    if (isLate !== undefined) {
      paramIndex++;
      query += ` AND s.is_late = $${paramIndex}`;
      countQuery += ` AND s.is_late = $${paramIndex}`;
      params.push(isLate);
      countParams.push(isLate);
    }

    if (classId) {
      paramIndex++;
      query += ` AND u.class_id = $${paramIndex}`;
      countQuery += ` AND u.class_id = $${paramIndex}`;
      params.push(classId);
      countParams.push(classId);
    }

    if (search) {
      paramIndex++;
      const searchPattern = `%${search}%`;
      query += ` AND (u.full_name ILIKE $${paramIndex} OR a.title ILIKE $${paramIndex})`;
      countQuery += ` AND (u.full_name ILIKE $${paramIndex} OR a.title ILIKE $${paramIndex})`;
      params.push(searchPattern);
      countParams.push(searchPattern);
    }

    query += ' ORDER BY s.submitted_at DESC';

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

    return { submissions: dataResult.rows, total: parseInt(countResult.rows[0].count) };
  },

  async updateStatus(id, status) {
    const result = await db.query(
      'UPDATE submissions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  },

  async getNextVersion(assignmentId, studentId) {
    const result = await db.query(
      'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM submissions WHERE assignment_id = $1 AND student_id = $2 AND deleted_at IS NULL',
      [assignmentId, studentId]
    );
    return result.rows[0].next_version;
  },

  async addFile({ submissionId, fileName, filePath, fileSize, mimeType }) {
    const result = await db.query(
      `INSERT INTO submission_files (submission_id, file_name, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [submissionId, fileName, filePath, fileSize, mimeType]
    );
    return result.rows[0];
  },

  async getPendingReviewCount(teacherId) {
    const result = await db.query(
      `SELECT COUNT(*)::int as count FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE a.teacher_id = $1 AND s.status = 'submitted' AND s.deleted_at IS NULL`,
      [teacherId]
    );
    return result.rows[0].count;
  },

  async getTotalCount() {
    const result = await db.query(
      'SELECT COUNT(*)::int as count FROM submissions WHERE deleted_at IS NULL'
    );
    return result.rows[0].count;
  },

  async getSubmissionRate(assignmentId) {
    const result = await db.query(
      `SELECT
        COUNT(*)::int as total_students,
        COUNT(*) FILTER (WHERE s.id IS NOT NULL)::int as submitted_count,
        ROUND(COUNT(*) FILTER (WHERE s.id IS NOT NULL)::numeric / COUNT(*)::numeric * 100, 2) as submission_rate
       FROM (
         SELECT DISTINCT at.target_id as student_id FROM assignment_targets at
         WHERE at.assignment_id = $1 AND at.target_type = 'student'
         UNION
         SELECT u.id FROM users u
         WHERE u.class_id IN (SELECT at.target_id FROM assignment_targets at WHERE at.assignment_id = $1 AND at.target_type = 'class')
       ) targets
       LEFT JOIN submissions s ON s.assignment_id = $1 AND s.student_id = targets.student_id AND s.deleted_at IS NULL`,
      [assignmentId]
    );
    return result.rows[0];
  },
};

module.exports = submissionRepository;
