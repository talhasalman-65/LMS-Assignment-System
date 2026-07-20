const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');
const db = require('../config/database');
const { activityLogger } = require('../utils/logger');

const authService = {
  async login(email, password, ipAddress, userAgent) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active. Please contact administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    await activityLogger.log(user.id, 'login', 'User logged in');

    const requiresPasswordChange = user.must_change_password || false;

    return {
      accessToken,
      refreshToken,
      requiresPasswordChange,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        profilePicture: user.profile_picture,
      },
    };
  },

  async refresh(refreshTokenStr) {
    let decoded;
    try {
      decoded = jwt.verify(refreshTokenStr, config.jwt.refreshSecret);
    } catch {
      throw new Error('Invalid or expired refresh token');
    }

    const result = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = FALSE AND expires_at > CURRENT_TIMESTAMP',
      [refreshTokenStr]
    );

    if (result.rows.length === 0) {
      throw new Error('Refresh token has been revoked or expired');
    }

    await db.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1',
      [refreshTokenStr]
    );

    const user = await userRepository.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      throw new Error('User not found or inactive');
    }

    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshTokenStr) {
    if (refreshTokenStr) {
      await db.query(
        'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = $1',
        [refreshTokenStr]
      );
    }
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) throw new Error('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(userId, passwordHash);
    await userRepository.update(userId, { mustChangePassword: false });

    await activityLogger.log(userId, 'password_change', 'Password changed');
  },

  async resetPassword(userId, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(userId, passwordHash);

    await db.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = $1',
      [userId]
    );
  },

  generateAccessToken(user) {
    const expiry = config.jwt.accessExpiryByRole[user.role] || config.jwt.accessExpiry;
    return jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      config.jwt.accessSecret,
      { expiresIn: expiry }
    );
  },

  async generateRefreshToken(userId) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const payload = { userId };
    const token = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiry });

    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );

    return token;
  },
};

module.exports = authService;
