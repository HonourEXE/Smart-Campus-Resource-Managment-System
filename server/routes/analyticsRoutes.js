const express = require('express');
const router = express.Router();
const { getOverviewAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

// Faculty, Resource Manager, and Admin can view analytics
router.get('/overview', authorize('faculty', 'resource_manager', 'admin'), getOverviewAnalytics);

module.exports = router;
