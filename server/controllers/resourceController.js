const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const { getRecommendedRooms } = require('../services/recommendationService');
const { logAction } = require('../middleware/auditLogger');

// @desc    Get all resources with optional filtering
// @route   GET /api/resources
// @access  Public or Authenticated
const getResources = async (req, res) => {
  try {
    const { type, building, search, minCapacity, status, equipment } = req.query;

    const filter = {};

    if (type && type !== 'All') {
      filter.type = type;
    }

    if (building && building !== 'All') {
      filter['location.building'] = new RegExp(building, 'i');
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (minCapacity) {
      filter.capacity = { $gte: parseInt(minCapacity, 10) };
    }

    if (equipment) {
      const eqArray = equipment.split(',').map((e) => e.trim());
      filter.equipment = { $all: eqArray };
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { 'location.building': regex },
        { 'location.roomNumber': regex },
        { description: regex },
        { equipment: regex },
      ];
    }

    const resources = await Resource.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single resource by ID with current day bookings
// @route   GET /api/resources/:id
// @access  Public or Authenticated
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Fetch upcoming bookings for this resource
    const upcomingBookings = await Booking.find({
      resourceId: resource._id,
      status: { $in: ['Approved', 'Pending'] },
      endTime: { $gte: new Date() },
    })
      .populate('userId', 'name role department')
      .sort({ startTime: 1 })
      .limit(10);

    res.json({
      success: true,
      resource,
      upcomingBookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new campus resource
// @route   POST /api/resources
// @access  Private (Resource Manager, Admin)
const createResource = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      capacity,
      equipment,
      status,
      approvalRequired,
      description,
      imageUrl,
    } = req.body;

    if (!name || !type || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, location (building & roomNumber), and capacity are required.',
      });
    }

    const newResource = await Resource.create({
      name,
      type,
      location,
      capacity,
      equipment: equipment || [],
      status: status || 'Available',
      approvalRequired: approvalRequired !== undefined ? approvalRequired : true,
      description: description || '',
      imageUrl: imageUrl || '',
    });

    await logAction({
      req,
      action: 'RESOURCE_CREATED',
      entityType: 'Resource',
      entityId: newResource._id,
      details: { name: newResource.name, type: newResource.type },
    });

    res.status(201).json({
      success: true,
      message: 'Resource created successfully.',
      resource: newResource,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update resource details
// @route   PATCH /api/resources/:id
// @access  Private (Resource Manager, Admin)
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const updatableFields = [
      'name',
      'type',
      'location',
      'capacity',
      'equipment',
      'status',
      'approvalRequired',
      'description',
      'imageUrl',
      'maintenanceNote',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    await resource.save();

    await logAction({
      req,
      action: 'RESOURCE_UPDATED',
      entityType: 'Resource',
      entityId: resource._id,
      details: req.body,
    });

    res.json({
      success: true,
      message: 'Resource updated successfully.',
      resource,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check availability for a date range
// @route   GET /api/resources/:id/availability
// @access  Public or Authenticated
const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead

    const bookings = await Booking.find({
      resourceId: id,
      status: { $in: ['Approved', 'Pending'] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    })
      .select('startTime endTime status purpose')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      resourceId: id,
      resourceName: resource.name,
      status: resource.status,
      isOperational: resource.status === 'Available',
      dateRange: { start, end },
      activeBookings: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get intelligent recommendations for rooms
// @route   GET /api/resources/recommendations
// @access  Public or Authenticated
const getRecommendations = async (req, res) => {
  try {
    const { type, capacity, equipment, building, startTime, endTime } = req.query;

    const recommendations = await getRecommendedRooms({
      type,
      capacity,
      equipment,
      building,
      startTime,
      endTime,
    });

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  checkAvailability,
  getRecommendations,
};
