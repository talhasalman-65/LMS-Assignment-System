const { Router } = require('express');
const logController = require('../controllers/logController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);
router.get('/', authorize('administrator'), logController.getLogs);

module.exports = router;
