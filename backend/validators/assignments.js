const { body } = require('express-validator');

const assignmentValidation = [
  body('title').trim().isLength({ min: 2, max: 255 }).withMessage('Title is required (2-255 chars)'),
  body('description').optional().isString(),
  body('instructions').optional().isString(),
  body('assignmentType').optional().isIn(['homework', 'classwork', 'project', 'quiz', 'other']).withMessage('Invalid assignment type'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('maxMarks').isFloat({ min: 1, max: 1000 }).withMessage('Max marks must be between 1 and 1000'),
  body('allowedFileTypes').optional().isArray(),
  body('maxAttempts').optional().isInt({ min: 1, max: 10 }).withMessage('Max attempts must be between 1 and 10'),
  body('targets').isArray({ min: 1 }).withMessage('At least one target (class or student) is required'),
  body('targets.*.targetType').isIn(['class', 'student']).withMessage('Target type must be class or student'),
  body('targets.*.targetId').isInt({ min: 1 }).withMessage('Valid target ID is required'),
];

const updateAssignmentValidation = [
  body('title').optional().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString(),
  body('instructions').optional().isString(),
  body('assignmentType').optional().isIn(['homework', 'classwork', 'project', 'quiz', 'other']),
  body('dueDate').optional().isISO8601(),
  body('maxMarks').optional().isFloat({ min: 1, max: 1000 }),
  body('allowedFileTypes').optional().isArray(),
  body('maxAttempts').optional().isInt({ min: 1, max: 10 }),
];

module.exports = { assignmentValidation, updateAssignmentValidation };
