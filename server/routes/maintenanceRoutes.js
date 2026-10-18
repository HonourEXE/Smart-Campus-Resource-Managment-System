const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  updateTicket,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/', createTicket);
router.get('/', getTickets);
router.patch('/:id', authorize('resource_manager', 'admin'), updateTicket);

module.exports = router;
