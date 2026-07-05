require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    accessExpiryByRole: {
      admin: process.env.JWT_ACCESS_EXPIRY_ADMIN || process.env.JWT_ACCESS_EXPIRY || '15m',
      teacher: process.env.JWT_ACCESS_EXPIRY_TEACHER || process.env.JWT_ACCESS_EXPIRY || '15m',
      student: process.env.JWT_ACCESS_EXPIRY_STUDENT || process.env.JWT_ACCESS_EXPIRY || '15m',
    },
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    allowedTypes: ['pdf', 'docx', 'zip'],
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
    ],
  },
};
