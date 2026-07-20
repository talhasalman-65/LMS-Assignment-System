const { Router } = require('express');
const fileController = require('../controllers/fileController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/:type/:id', fileController.serveFile);

module.exports = router;
