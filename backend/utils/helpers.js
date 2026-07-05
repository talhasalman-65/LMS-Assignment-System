const crypto = require('crypto');

function calculateGrade(marks, maxMarks) {
  if (marks == null || maxMarks <= 0) return null;
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  return 'F';
}

function generateTokenId() {
  return crypto.randomBytes(32).toString('hex');
}

function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildPaginationMeta(total, page, limit) {
  return {
    total: parseInt(total),
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = {
  calculateGrade,
  generateTokenId,
  sanitizeFilename,
  getPaginationParams,
  buildPaginationMeta,
};
