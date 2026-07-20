const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../config/database');

const PASSWORD_CHANGE_WHITELIST = [
  { method: 'POST', path: '/api/auth/change-password' },
  { method: 'POST', path: '/api/auth/logout' },
  { method: 'GET',  path: '/api/auth/me' },
];

function isPasswordChangeWhitelisted(req) {
  const url = req.originalUrl;
  return PASSWORD_CHANGE_WHITELIST.some(
    entry => entry.method === req.method && url.startsWith(entry.path)
  );
}

async function requirePasswordChange(req, res, next) {
  if (!req.user) return next();
  if (isPasswordChangeWhitelisted(req)) return next();

  try {
    const result = await db.query(
      'SELECT must_change_password FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (result.rows.length > 0 && result.rows[0].must_change_password) {
      return res.status(403).json({
        error: 'Password change required',
        code: 'PASSWORD_CHANGE_REQUIRED',
      });
    }
    next();
  } catch {
    next();
  }
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    requirePasswordChange(req, res, next);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid access token' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, authorize, requirePasswordChange };
