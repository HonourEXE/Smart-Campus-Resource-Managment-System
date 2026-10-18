const MaintenanceTicket = require('../models/MaintenanceTicket');
const Resource = require('../models/Resource');
const { notifyUser, notifyRoles } = require('../services/notificationService');
const { logAction } = require('../middleware/auditLogger');

// @desc    Submit a maintenance ticket
// @route   POST /api/maintenance
// @access  Private (All authenticated roles)
const createTicket = async (req, res) => {
  try {
    const { resourceId, description, priority, markUnavailable } = req.body;

    if (!resourceId || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resourceId and description of the issue.',
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const ticket = await MaintenanceTicket.create({
      resourceId,
      reportedBy: req.user._id,
      description: description.trim(),
      priority: priority || 'Medium',
      status: 'Open',
    });

    // If marked unavailable or urgent priority, update resource status
    if (markUnavailable || priority === 'Urgent') {
      resource.status = 'Under Maintenance';
      resource.maintenanceNote = `Active fault reported: ${description.substring(0, 60)}...`;
      await resource.save();
    }

    const populatedTicket = await MaintenanceTicket.findById(ticket._id)
      .populate('resourceId', 'name type location status')
      .populate('reportedBy', 'name email role');

    // Notify resource managers
    await notifyRoles({
      roles: ['resource_manager', 'admin'],
      message: `[Maintenance] ${resource.name}: New ${priority || 'Medium'} priority issue reported by ${req.user.name}.`,
      type: 'maintenance_update',
      link: '/maintenance',
    });

    await logAction({
      req,
      action: 'MAINTENANCE_TICKET_CREATED',
      entityType: 'MaintenanceTicket',
      entityId: ticket._id,
      details: { resourceName: resource.name, priority, description },
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance ticket submitted successfully.',
      ticket: populatedTicket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get maintenance tickets
// @route   GET /api/maintenance
// @access  Private
const getTickets = async (req, res) => {
  try {
    const { status, priority, resourceId } = req.query;
    const filter = {};

    // Students and faculty only see tickets they reported
    if (req.user.role === 'student' || req.user.role === 'faculty') {
      filter.reportedBy = req.user._id;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (resourceId) {
      filter.resourceId = resourceId;
    }

    const tickets = await MaintenanceTicket.find(filter)
      .populate('resourceId', 'name type location status')
      .populate('reportedBy', 'name email role department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status, technician assignment, or mark resolved
// @route   PATCH /api/maintenance/:id
// @access  Private (Resource Manager, Admin)
const updateTicket = async (req, res) => {
  try {
    const { status, assignedTo, resolutionNotes, setResourceAvailable } = req.body;
    const ticket = await MaintenanceTicket.findById(req.params.id)
      .populate('resourceId')
      .populate('reportedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Maintenance ticket not found.' });
    }

    if (status) ticket.status = status;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
    if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes;

    const resource = await Resource.findById(ticket.resourceId._id);

    // Lifecycle transitions:
    // If ticket set to In Progress and resource was Available, can put under maintenance
    if (status === 'In Progress' && resource && resource.status === 'Available') {
      resource.status = 'Under Maintenance';
      resource.maintenanceNote = `In maintenance by ${ticket.assignedTo || 'technician'}`;
      await resource.save();
    }

    // If ticket is Resolved, set resolved timestamp and restore resource to Available
    if (status === 'Resolved') {
      ticket.resolvedAt = new Date();
      if (resource && (setResourceAvailable !== false || resource.status === 'Under Maintenance')) {
        resource.status = 'Available';
        resource.maintenanceNote = '';
        await resource.save();
      }
    }

    await ticket.save();

    // Notify the user who originally reported the fault
    await notifyUser({
      userId: ticket.reportedBy._id,
      message: `Your maintenance ticket for ${ticket.resourceId.name} is now ${ticket.status}. ${ticket.assignedTo ? `Assigned to: ${ticket.assignedTo}.` : ''}`,
      type: 'maintenance_update',
      link: '/maintenance',
    });

    await logAction({
      req,
      action: 'MAINTENANCE_TICKET_UPDATED',
      entityType: 'MaintenanceTicket',
      entityId: ticket._id,
      details: { status: ticket.status, assignedTo: ticket.assignedTo },
    });

    res.json({
      success: true,
      message: 'Maintenance ticket updated successfully.',
      ticket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
};
