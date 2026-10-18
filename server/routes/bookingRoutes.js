const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  cancelBooking,
  decideBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All booking operations require authentication
router.use(protect);

router.get('/', getBookings);
router.post('/', createBooking);
router.patch('/:id/cancel', cancelBooking);

// Approve or reject requests - Resource Manager & Admin only
router.patch('/:id/decision', authorize('resource_manager', 'admin'), decideBooking);

module.exports = router;
