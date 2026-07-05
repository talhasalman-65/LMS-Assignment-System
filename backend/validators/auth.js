const { body } = require('express-validator');

const passwordRules = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least 1 uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least 1 lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least 1 number'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  ...passwordRules.map(r => r.optional()),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  ...passwordRules,
];

const resetPasswordValidation = [
  body('userId').isInt().withMessage('Valid user ID is required'),
  ...passwordRules,
];

module.exports = { loginValidation, changePasswordValidation, resetPasswordValidation, passwordRules };
