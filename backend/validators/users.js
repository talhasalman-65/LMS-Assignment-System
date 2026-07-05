const { body } = require('express-validator');

const userValidation = [
  body('fullName').trim().isLength({ min: 2, max: 255 }).withMessage('Full name is required (2-255 chars)'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('role').isIn(['student', 'teacher', 'administrator']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('phoneNumber').optional().isString(),
  body('employeeId').optional().isString(),
  body('department').optional().isString(),
  body('rollNumber').optional().isString(),
  body('registrationNumber').optional().isString(),
  body('classId').optional().isInt(),
  body('sectionId').optional().isInt(),
];

const updateUserValidation = [
  body('fullName').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Full name is required (2-255 chars)'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('phoneNumber').optional().isString(),
  body('employeeId').optional().isString(),
  body('department').optional().isString(),
  body('rollNumber').optional().isString(),
  body('registrationNumber').optional().isString(),
  body('classId').optional().isInt(),
  body('sectionId').optional().isInt(),
];

module.exports = { userValidation, updateUserValidation };
