const { Router } = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/teacher/stats', authorize('teacher'), reportController.teacherStats);
router.get('/teacher/performance/:assignmentId', authorize('teacher'), reportController.teacherPerformance);
router.get('/teacher/missing/:assignmentId', authorize('teacher'), reportController.missingAssignments);
router.get('/admin/stats', authorize('administrator'), reportController.adminStats);
router.get('/admin/user-growth', authorize('administrator'), reportController.userGrowth);
router.get('/admin/teacher-activity', authorize('administrator'), reportController.teacherActivity);

module.exports = router;
