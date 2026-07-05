const { Router } = require('express');
const classController = require('../controllers/classController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', classController.getAll);
router.get('/:id', classController.getById);
router.post('/', authorize('administrator'), classController.create);
router.put('/:id', authorize('administrator'), classController.update);
router.delete('/:id', authorize('administrator'), classController.delete);

module.exports = router;
