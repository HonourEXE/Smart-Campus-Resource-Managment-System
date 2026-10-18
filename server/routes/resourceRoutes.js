const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  checkAvailability,
  getRecommendations,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public or Authenticated routes
router.get('/', getResources);
router.get('/recommendations', getRecommendations);
router.get('/:id/availability', checkAvailability);
router.get('/:id', getResourceById);

// Resource Management: Resource Manager and Admin only
router.post('/', protect, authorize('resource_manager', 'admin'), createResource);
router.patch('/:id', protect, authorize('resource_manager', 'admin'), updateResource);

module.exports = router;
