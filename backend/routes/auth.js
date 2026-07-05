const { Router } = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { loginValidation, changePasswordValidation, resetPasswordValidation } = require('../validators/auth');
const { handleValidation } = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post('/login', loginLimiter, loginValidation, handleValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, changePasswordValidation, handleValidation, authController.changePassword);
router.post('/reset-password', authenticate, authorize('administrator'), resetPasswordValidation, handleValidation, authController.resetPassword);

module.exports = router;
