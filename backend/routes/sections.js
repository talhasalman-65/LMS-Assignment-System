const { Router } = require('express');
const sectionController = require('../controllers/sectionController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', sectionController.getAll);
router.get('/:id', sectionController.getById);
router.post('/', authorize('administrator'), sectionController.create);
router.put('/:id', authorize('administrator'), sectionController.update);
router.delete('/:id', authorize('administrator'), sectionController.delete);

module.exports = router;
