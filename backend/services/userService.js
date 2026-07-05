const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { auditLog, activityLogger } = require('../utils/logger');

const userService = {
  async getAll(filters) {
    return await userRepository.findAll(filters);
  },

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('User not found');
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async create(data, actorId) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new Error('Email already in use');

    const defaultPassword = data.password || 'Password1';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const user = await userRepository.create({
      ...data,
      passwordHash,
    });

    await auditLog.log(actorId, 'user_create', 'users', user.id, null, { fullName: data.fullName, email: data.email, role: data.role });
    await activityLogger.log(actorId, 'user_created', `Created user ${data.fullName}`);

    return user;
  },

  async update(id, data, actorId) {
    const before = await userRepository.findById(id);
    if (!before) throw new Error('User not found');

    const updated = await userRepository.update(id, data);
    if (!updated) throw new Error('No changes detected');

    await auditLog.log(actorId, 'user_update', 'users', id, { fullName: before.full_name, email: before.email, status: before.status }, data);
    await activityLogger.log(actorId, 'user_updated', `Updated user ${before.full_name}`);

    return updated;
  },

  async delete(id, actorId) {
    const before = await userRepository.findById(id);
    if (!before) throw new Error('User not found');

    await userRepository.softDelete(id);
    await auditLog.log(actorId, 'user_delete', 'users', id, { fullName: before.full_name }, null);
    await activityLogger.log(actorId, 'user_deleted', `Deleted user ${before.full_name}`);
  },

  async activate(id, actorId) {
    const result = await userRepository.update(id, { status: 'active' });
    await auditLog.log(actorId, 'user_activate', 'users', id, null, { status: 'active' });
    return result;
  },

  async suspend(id, actorId) {
    const result = await userRepository.update(id, { status: 'suspended' });
    await db.query('UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1', [id]);
    await auditLog.log(actorId, 'user_suspend', 'users', id, null, { status: 'suspended' });
    return result;
  },

  async getProfile(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('User not found');
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async updateProfile(id, data, actorId) {
    const allowed = ['fullName', 'phoneNumber', 'profilePicture'];
    const filtered = {};
    for (const key of allowed) {
      if (data[key] !== undefined) filtered[key] = data[key];
    }

    const result = await userRepository.update(id, filtered);
    await activityLogger.log(actorId, 'profile_updated', 'Profile updated');
    return result;
  },
};

const db = require('../config/database');

module.exports = userService;
