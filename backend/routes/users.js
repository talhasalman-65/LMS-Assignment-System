const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { userValidation, updateUserValidation } = require('../validators/users');
const { handleValidation } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/profile/picture', upload.single('profilePicture'), userController.uploadProfilePicture);
router.get('/counts', authorize('administrator'), userController.getCounts);
router.get('/activity', userController.getActivity);
router.get('/activity/:id', authorize('administrator', 'teacher'), userController.getActivity);

router.get('/', authorize('administrator', 'teacher'), userController.getAll);
router.get('/:id', authorize('administrator', 'teacher'), userController.getById);
router.post('/', authorize('administrator'), userValidation, handleValidation, userController.create);
router.put('/:id', authorize('administrator'), updateUserValidation, handleValidation, userController.update);
router.delete('/:id', authorize('administrator'), userController.delete);
router.post('/:id/activate', authorize('administrator'), userController.activate);
router.post('/:id/suspend', authorize('administrator'), userController.suspend);

module.exports = router;
