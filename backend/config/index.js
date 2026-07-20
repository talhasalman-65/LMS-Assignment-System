require('dotenv').config();

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET environment variable is required');
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET environment variable is required');
}

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
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
