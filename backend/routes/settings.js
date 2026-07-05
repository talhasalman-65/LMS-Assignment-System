const { Router } = require('express');
const settingsController = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', settingsController.getAll);
router.put('/', authorize('administrator'), settingsController.update);
router.put('/bulk', authorize('administrator'), settingsController.updateBulk);

module.exports = router;
