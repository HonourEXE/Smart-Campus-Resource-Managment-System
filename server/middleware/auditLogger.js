const AuditLog = require('../models/AuditLog');

const logAction = async ({ req, action, entityType, entityId, details }) => {
  try {
    const actorId = req && req.user ? req.user._id : null;
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || '' : '';

    await AuditLog.create({
      actorId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('[AuditLog] Failed to record log entry:', error.message);
  }
};

module.exports = { logAction };
