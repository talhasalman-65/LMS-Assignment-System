const db = require('../config/database');

const userRepository = {
  async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll({ role, status, classId, sectionId, search, page, limit, offset }) {
    let query = 'SELECT * FROM users WHERE deleted_at IS NULL';
    let countQuery = 'SELECT COUNT(*) FROM users WHERE deleted_at IS NULL';
    const params = [];
    const countParams = [];
    let paramIndex = 0;

    if (role) {
      paramIndex++;
      query += ` AND role = $${paramIndex}`;
      countQuery += ` AND role = $${paramIndex}`;
      params.push(role);
      countParams.push(role);
    }

    if (status) {
      paramIndex++;
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      countParams.push(status);
    }

    if (classId) {
      paramIndex++;
      query += ` AND class_id = $${paramIndex}`;
      countQuery += ` AND class_id = $${paramIndex}`;
      params.push(classId);
      countParams.push(classId);
    }

    if (sectionId) {
      paramIndex++;
      query += ` AND section_id = $${paramIndex}`;
      countQuery += ` AND section_id = $${paramIndex}`;
      params.push(sectionId);
      countParams.push(sectionId);
    }

    if (search) {
      paramIndex++;
      const searchPattern = `%${search}%`;
      query += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      countQuery += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(searchPattern);
      countParams.push(searchPattern);
    }

    query += ' ORDER BY created_at DESC';

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

    return { users: dataResult.rows, total: parseInt(countResult.rows[0].count) };
  },

  async create({ fullName, email, passwordHash, role, status, phoneNumber, employeeId, department, rollNumber, registrationNumber, classId, sectionId }) {
    const result = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, status, phone_number, employee_id, department, roll_number, registration_number, class_id, section_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, full_name, email, role, status, created_at`,
      [fullName, email, passwordHash, role, status || 'active', phoneNumber || null, employeeId || null, department || null, rollNumber || null, registrationNumber || null, classId || null, sectionId || null]
    );
    return result.rows[0];
  },

  async update(id, fields) {
    const setClauses = [];
    const params = [];
    let paramIndex = 0;

    const fieldMap = {
      fullName: 'full_name',
      email: 'email',
      status: 'status',
      phoneNumber: 'phone_number',
      employeeId: 'employee_id',
      department: 'department',
      rollNumber: 'roll_number',
      registrationNumber: 'registration_number',
      classId: 'class_id',
      sectionId: 'section_id',
      profilePicture: 'profile_picture',
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
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await db.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING id, full_name, email, role, status, created_at`,
      params
    );
    return result.rows[0] || null;
  },

  async updatePassword(id, passwordHash) {
    const result = await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND deleted_at IS NULL RETURNING id',
      [passwordHash, id]
    );
    return result.rows[0] || null;
  },

  async softDelete(id) {
    const result = await db.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, status = \'inactive\', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  },

  async getCountByRole() {
    const result = await db.query(
      `SELECT role, COUNT(*)::int as count FROM users WHERE deleted_at IS NULL GROUP BY role`
    );
    return result.rows;
  },

  async getTotalCount() {
    const result = await db.query(
      'SELECT COUNT(*)::int as count FROM users WHERE deleted_at IS NULL'
    );
    return result.rows[0].count;
  },
};

module.exports = userRepository;
