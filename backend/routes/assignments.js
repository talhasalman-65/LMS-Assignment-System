const { Router } = require('express');
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { assignmentValidation, updateAssignmentValidation } = require('../validators/assignments');
const { handleValidation } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = Router();

router.use(authenticate);

router.get('/', assignmentController.getAll);
router.get('/:id', assignmentController.getById);
function parseJsonFields(req, res, next) {
  if (req.body && typeof req.body.targets === 'string') {
    try { req.body.targets = JSON.parse(req.body.targets); } catch { return res.status(400).json({ error: 'Invalid targets format' }); }
  }
  next();
}

router.post('/', authorize('teacher', 'administrator'), upload.array('attachments', 5), parseJsonFields, assignmentValidation, handleValidation, assignmentController.create);
router.put('/:id', authorize('teacher', 'administrator'), updateAssignmentValidation, handleValidation, assignmentController.update);
router.delete('/:id', authorize('teacher', 'administrator'), assignmentController.delete);
router.post('/:id/archive', authorize('teacher', 'administrator'), assignmentController.archive);

module.exports = router;
