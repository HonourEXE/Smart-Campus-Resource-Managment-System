const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res) => {
  try {
    const { entityType, limit = 100 } = req.query;
    const filter = {};

    if (entityType) {
      filter.entityType = entityType;
    }

    const logs = await AuditLog.find(filter)
      .populate('actorId', 'name email role department')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAuditLogs,
};
