const { Router } = require('express');
const submissionController = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middleware/auth');
const { gradeValidation } = require('../validators/submissions');
const { handleValidation } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = Router();

router.use(authenticate);

router.get('/', submissionController.getAll);
router.get('/:id', submissionController.getById);
router.post('/:assignmentId/submit', authorize('student'), upload.array('files', 5), submissionController.submit);
router.get('/:assignmentId/history', authorize('student'), submissionController.getHistory);
router.post('/:id/grade', authorize('teacher', 'administrator'), gradeValidation, handleValidation, submissionController.grade);
router.post('/:id/finalize', authorize('teacher', 'administrator'), submissionController.finalize);
router.post('/:id/return', authorize('teacher', 'administrator'), submissionController.returnForRevision);

module.exports = router;
