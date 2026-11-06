const mongoose = require('mongoose');

const approvalHistorySchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  applicationId: {
    type: String,
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actorName: {
    type: String,
    required: true
  },
  actorRole: {
    type: String,
    required: true,
    enum: ['student', 'faculty', 'hod', 'admin', 'system']
  },
  action: {
    type: String,
    required: true,
    enum: [
      'SUBMITTED',
      'FACULTY_APPROVED',
      'FACULTY_REJECTED',
      'FORWARDED_TO_HOD',
      'HOD_APPROVED',
      'HOD_REJECTED',
      'FORWARDED_TO_ADMIN',
      'ADMIN_APPROVED',
      'ADMIN_REJECTED',
      'INFO_REQUESTED',
      'INFO_PROVIDED',
      'CANCELLED',
      'ADMIN_OVERRIDE'
    ]
  },
  previousStatus: {
    type: String,
    required: true
  },
  newStatus: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  targetRole: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ApprovalHistory', approvalHistorySchema);
