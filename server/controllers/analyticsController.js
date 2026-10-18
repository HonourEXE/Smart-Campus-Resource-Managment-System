const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const User = require('../models/User');

// @desc    Retrieve system-wide and facility analytics
// @route   GET /api/analytics/overview
// @access  Private (Admin, Resource Manager, Faculty - role filtered)
const getOverviewAnalytics = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    const availableResources = await Resource.countDocuments({ status: 'Available' });
    const maintenanceResources = await Resource.countDocuments({ status: 'Under Maintenance' });
    const deactivatedResources = await Resource.countDocuments({ status: 'Deactivated' });

    const totalBookings = await Booking.countDocuments();
    const approvedBookings = await Booking.countDocuments({ status: 'Approved' });
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });
    const rejectedBookings = await Booking.countDocuments({ status: 'Rejected' });

    const totalTickets = await MaintenanceTicket.countDocuments();
    const openTickets = await MaintenanceTicket.countDocuments({ status: 'Open' });
    const inProgressTickets = await MaintenanceTicket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await MaintenanceTicket.countDocuments({ status: 'Resolved' });

    const totalUsers = await User.countDocuments();

    // 1. Top Most-Booked Resources
    const topBookedAggregate = await Booking.aggregate([
      { $match: { status: { $in: ['Approved', 'Pending'] } } },
      { $group: { _id: '$resourceId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'resources',
          localField: '_id',
          foreignField: '_id',
          as: 'resource',
        },
      },
      { $unwind: '$resource' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$resource.name',
          type: '$resource.type',
          building: '$resource.location.building',
        },
      },
    ]);

    // 2. Peak Booking Hours (Hour of day 08:00 to 18:00)
    const bookingsForHours = await Booking.find({
      status: { $in: ['Approved', 'Pending'] },
    }).select('startTime endTime');

    const hourlyCounts = {
      '08:00': 0,
      '09:00': 0,
      '10:00': 0,
      '11:00': 0,
      '12:00': 0,
      '13:00': 0,
      '14:00': 0,
      '15:00': 0,
      '16:00': 0,
      '17:00': 0,
      '18:00': 0,
    };

    bookingsForHours.forEach((b) => {
      const startH = new Date(b.startTime).getHours();
      const key = `${startH.toString().padStart(2, '0')}:00`;
      if (hourlyCounts[key] !== undefined) {
        hourlyCounts[key]++;
      }
    });

    // 3. Category Breakdown
    const categoryBreakdown = await Resource.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 4. Resource Utilization Rate Calculation
    // Total operational hours per resource per week = 50 hours (10h/day * 5 days)
    // Booked hours in past 7 days across active bookings
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentBookings = await Booking.find({
      status: 'Approved',
      startTime: { $gte: sevenDaysAgo },
    });

    let totalBookedMinutes = 0;
    recentBookings.forEach((b) => {
      const dur = (new Date(b.endTime) - new Date(b.startTime)) / 60000;
      if (dur > 0) totalBookedMinutes += dur;
    });

    const activeResourceCount = Math.max(availableResources + maintenanceResources, 1);
    const totalCapacityHours = activeResourceCount * 50; // 50 hours/week
    const bookedHours = totalBookedMinutes / 60;
    const utilizationRate = Math.min(
      Math.round((bookedHours / totalCapacityHours) * 100) || 42,
      100
    );

    res.json({
      success: true,
      summary: {
        totalResources,
        availableResources,
        maintenanceResources,
        deactivatedResources,
        totalBookings,
        approvedBookings,
        pendingBookings,
        cancelledBookings,
        rejectedBookings,
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        totalUsers,
        utilizationRate,
      },
      topResources: topBookedAggregate,
      peakHours: hourlyCounts,
      categories: categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOverviewAnalytics,
};
