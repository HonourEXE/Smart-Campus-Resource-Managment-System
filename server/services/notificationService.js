const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Creates an in-app notification for a specific user
 */
const notifyUser = async ({ userId, message, type = 'system', link = '' }) => {
  try {
    return await Notification.create({
      userId,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error('[NotificationService] Error notifying user:', error.message);
  }
};

/**
 * Broadcasts a notification to all users of specific roles (e.g., resource_manager, admin)
 */
const notifyRoles = async ({ roles = ['resource_manager', 'admin'], message, type = 'system', link = '' }) => {
  try {
    const targetUsers = await User.find({ role: { $in: roles }, isActive: true }).select('_id');
    const notifications = targetUsers.map((u) => ({
      userId: u._id,
      message,
      type,
      link,
    }));
    if (notifications.length > 0) {
      return await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('[NotificationService] Error notifying roles:', error.message);
  }
};

module.exports = {
  notifyUser,
  notifyRoles,
};
