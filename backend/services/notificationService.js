const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a single in-app notification
 */
const createNotification = async ({
  recipientId,
  title,
  message,
  type = 'SUBMISSION',
  applicationId = null,
  appRecordId = null
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      application: appRecordId,
      applicationId: applicationId
    });
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
};

/**
 * Notify all users with a specific role, optionally filtered by department
 */
const notifyRole = async ({
  role,
  department = null,
  title,
  message,
  type = 'SUBMISSION',
  applicationId = null,
  appRecordId = null
}) => {
  try {
    const filter = { role, isActive: true };
    if (department) {
      filter.department = department;
    }
    const recipients = await User.find(filter).select('_id');
    const notifications = recipients.map((r) => ({
      recipient: r._id,
      title,
      message,
      type,
      application: appRecordId,
      applicationId: applicationId
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    return notifications.length;
  } catch (err) {
    console.error('Error broadcasting notification to role:', err.message);
    return 0;
  }
};

module.exports = {
  createNotification,
  notifyRole
};
