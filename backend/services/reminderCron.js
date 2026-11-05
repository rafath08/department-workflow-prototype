const cron = require('node-cron');
const Application = require('../models/Application');
const { createNotification, notifyRole } = require('./notificationService');

/**
 * Scheduled job to check for pending applications and send reminder notifications
 * Runs every hour (and testable on startup)
 */
const initReminderCron = () => {
  // Run once every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running pending approval reminder check...');
    await checkAndSendReminders();
  });
  console.log('[CRON] Pending approval reminder task scheduled (runs hourly).');
};

const checkAndSendReminders = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Applications pending faculty > 24 hours
    const pendingFacultyApps = await Application.find({
      status: 'PENDING_FACULTY',
      createdAt: { $lte: oneDayAgo }
    }).populate('assignedFaculty', 'name email');

    for (const app of pendingFacultyApps) {
      if (app.assignedFaculty) {
        await createNotification({
          recipientId: app.assignedFaculty._id,
          title: 'Reminder: Pending Approval Awaiting Action',
          message: `Application ${app.applicationId} for student ${app.studentName} has been pending your review for over 24 hours.`,
          type: 'REMINDER',
          applicationId: app.applicationId,
          appRecordId: app._id
        });
      }
    }

    // 2. Applications pending HOD > 24 hours
    const pendingHodApps = await Application.find({
      status: 'PENDING_HOD',
      updatedAt: { $lte: oneDayAgo }
    });

    for (const app of pendingHodApps) {
      await notifyRole({
        role: 'hod',
        department: app.department,
        title: 'Reminder: Application Awaiting HOD Approval',
        message: `Application ${app.applicationId} (${app.studentName}) forwarded by faculty is still awaiting HOD review.`,
        type: 'REMINDER',
        applicationId: app.applicationId,
        appRecordId: app._id
      });
    }

    console.log(`[CRON] Reminders sent: ${pendingFacultyApps.length} faculty reminders, ${pendingHodApps.length} HOD reminders.`);
  } catch (err) {
    console.error('[CRON] Error sending pending reminders:', err.message);
  }
};

module.exports = {
  initReminderCron,
  checkAndSendReminders
};
