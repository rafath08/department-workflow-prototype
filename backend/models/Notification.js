const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'SUBMISSION',
      'PENDING_FACULTY',
      'PENDING_HOD',
      'FORWARDED',
      'APPROVED',
      'REJECTED',
      'REMINDER'
    ],
    default: 'SUBMISSION'
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  applicationId: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
