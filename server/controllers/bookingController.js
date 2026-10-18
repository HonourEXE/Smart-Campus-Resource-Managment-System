const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const {
  checkBookingConflict,
  findAlternativeSlots,
  findAlternativeRooms,
} = require('../services/conflictService');
const { notifyUser, notifyRoles } = require('../services/notificationService');
const { logAction } = require('../middleware/auditLogger');

// @desc    Create a new booking request with conflict detection
// @route   POST /api/bookings
// @access  Private (Student, Faculty, Resource Manager, Admin)
const createBooking = async (req, res) => {
  try {
    const { resourceId, startTime, endTime, purpose, attendeesCount } = req.body;

    if (!resourceId || !startTime || !endTime || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: resourceId, startTime, endTime, and purpose are mandatory.',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for startTime or endTime.',
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End time must be strictly after start time.',
      });
    }

    if (end < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create bookings in the past.',
      });
    }

    // Verify Resource exists and is operational
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'The requested resource does not exist.',
      });
    }

    if (resource.status === 'Deactivated') {
      return res.status(400).json({
        success: false,
        message: 'This resource is deactivated and unavailable for booking.',
      });
    }

    if (resource.status === 'Under Maintenance') {
      return res.status(400).json({
        success: false,
        message: 'This resource is currently under maintenance. Please select another resource.',
      });
    }

    // Core Conflict Check:
    // existing.startTime < requested.endTime && existing.endTime > requested.startTime
    const conflictResult = await checkBookingConflict({
      resourceId,
      startTime: start,
      endTime: end,
    });

    if (conflictResult.hasConflict) {
      // Innovation: Smart Alternative Suggestions upon Conflict
      const alternativeSlots = await findAlternativeSlots({
        resourceId,
        requestedDate: start,
        durationMinutes: Math.round((end - start) / 60000),
      });

      const alternativeRooms = await findAlternativeRooms({
        resourceType: resource.type,
        minCapacity: attendeesCount || resource.capacity,
        startTime: start,
        endTime: end,
        excludeResourceId: resource._id,
      });

      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Booking conflict: ${resource.name} is already reserved or pending during this time slot.`,
        conflicts: conflictResult.conflicts.map((c) => ({
          _id: c._id,
          startTime: c.startTime,
          endTime: c.endTime,
          purpose: c.purpose,
        })),
        suggestions: {
          alternativeSlots,
          alternativeRooms: alternativeRooms.map((r) => ({
            _id: r._id,
            name: r.name,
            type: r.type,
            capacity: r.capacity,
            location: r.fullLocation || `${r.location.building} - ${r.location.roomNumber}`,
            equipment: r.equipment,
          })),
        },
      });
    }

    // Policy Check: Auto-approval vs Approval required
    // If resource does not require approval or user is Admin/Resource Manager, auto-approve
    const isAutoApproved =
      !resource.approvalRequired ||
      req.user.role === 'admin' ||
      req.user.role === 'resource_manager';

    const initialStatus = isAutoApproved ? 'Approved' : 'Pending';

    const booking = await Booking.create({
      userId: req.user._id,
      resourceId,
      startTime: start,
      endTime: end,
      purpose: purpose.trim(),
      attendeesCount: attendeesCount || 1,
      status: initialStatus,
      decisionBy: isAutoApproved ? req.user._id : undefined,
      decisionReason: isAutoApproved ? 'Automatically approved by system policy' : '',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('resourceId', 'name type location capacity equipment')
      .populate('userId', 'name email role department');

    // Send notifications
    if (isAutoApproved) {
      await notifyUser({
        userId: req.user._id,
        message: `Your reservation for ${resource.name} has been automatically confirmed!`,
        type: 'booking_update',
        link: '/bookings',
      });
    } else {
      await notifyRoles({
        roles: ['resource_manager', 'admin'],
        message: `New booking request: ${req.user.name} requested ${resource.name} for "${purpose}".`,
        type: 'booking_update',
        link: '/approvals',
      });
      await notifyUser({
        userId: req.user._id,
        message: `Booking request for ${resource.name} submitted successfully (Pending Approval).`,
        type: 'booking_update',
        link: '/bookings',
      });
    }

    await logAction({
      req,
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: booking._id,
      details: {
        resourceName: resource.name,
        startTime: start,
        endTime: end,
        status: initialStatus,
      },
    });

    res.status(201).json({
      success: true,
      message: isAutoApproved
        ? 'Booking confirmed and approved automatically.'
        : 'Booking request submitted and awaiting approval.',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings (role-aware: students/faculty see own, managers/admins see all)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const { status, resourceId, date } = req.query;
    const filter = {};

    // Role-based visibility
    if (req.user.role === 'student' || req.user.role === 'faculty') {
      filter.userId = req.user._id;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (resourceId) {
      filter.resourceId = resourceId;
    }

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      filter.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const bookings = await Booking.find(filter)
      .populate('resourceId', 'name type location capacity equipment status')
      .populate('userId', 'name email role department')
      .populate('decisionBy', 'name role')
      .sort({ startTime: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an eligible booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('resourceId', 'name');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Authorization check: Only booking owner, manager, or admin can cancel
    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isManagerOrAdmin = ['resource_manager', 'admin'].includes(req.user.role);

    if (!isOwner && !isManagerOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to cancel this booking.',
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    await notifyUser({
      userId: booking.userId,
      message: `Your booking for ${booking.resourceId.name} has been cancelled.`,
      type: 'booking_update',
      link: '/bookings',
    });

    await logAction({
      req,
      action: 'BOOKING_CANCELLED',
      entityType: 'Booking',
      entityId: booking._id,
      details: { resourceName: booking.resourceId.name },
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject a booking request
// @route   PATCH /api/bookings/:id/decision
// @access  Private (Resource Manager, Admin)
const decideBooking = async (req, res) => {
  try {
    const { decision, reason } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision. Must be 'Approved' or 'Rejected'.",
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('resourceId', 'name')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Booking has already been ${booking.status.toLowerCase()}.`,
      });
    }

    // If approving, re-check conflict in case another booking was approved in the meantime
    if (decision === 'Approved') {
      const conflict = await checkBookingConflict({
        resourceId: booking.resourceId._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        excludeBookingId: booking._id,
      });

      if (conflict.hasConflict) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: 'Cannot approve: Another confirmed booking now overlaps with this requested slot.',
        });
      }
    }

    booking.status = decision;
    booking.decisionBy = req.user._id;
    booking.decisionReason = reason || (decision === 'Approved' ? 'Approved by facility manager' : 'Rejected by facility manager');
    await booking.save();

    // Notify user
    await notifyUser({
      userId: booking.userId._id,
      message: `Your booking for ${booking.resourceId.name} has been ${decision.toUpperCase()}! ${reason ? `Note: "${reason}"` : ''}`,
      type: 'booking_update',
      link: '/bookings',
    });

    await logAction({
      req,
      action: `BOOKING_${decision.toUpperCase()}`,
      entityType: 'Booking',
      entityId: booking._id,
      details: { decision, reason, targetUser: booking.userId.email },
    });

    res.json({
      success: true,
      message: `Booking request ${decision.toLowerCase()} successfully.`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  cancelBooking,
  decideBooking,
};
