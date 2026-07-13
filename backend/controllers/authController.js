const authService = require('../services/authService');
const userService = require('../services/userService');

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(email, password, ipAddress, userAgent);

      res.json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  },

  async refresh(req, res) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const result = await authService.refresh(refreshToken);

      res.json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  },

  async logout(req, res) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
      await authService.logout(refreshToken);

      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Logout failed' });
    }
  },

  async changePassword(req, res) {
    try {
      await authService.changePassword(req.user.userId, req.body.currentPassword, req.body.password);
      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async resetPassword(req, res) {
    try {
      await authService.resetPassword(req.body.userId, req.body.password);
      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async me(req, res) {
    try {
      const user = await userService.getProfile(req.user.userId);
      res.json(user);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },
};

module.exports = authController;
