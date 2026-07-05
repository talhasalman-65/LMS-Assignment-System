const { body } = require('express-validator');

const gradeValidation = [
  body('marks').isFloat({ min: 0 }).withMessage('Valid marks are required'),
  body('feedback').optional().isString(),
  body('reviewNotes').optional().isString(),
  body('status').isIn(['graded', 'returned_for_revision', 'rejected']).withMessage('Invalid submission status'),
];

module.exports = { gradeValidation };
