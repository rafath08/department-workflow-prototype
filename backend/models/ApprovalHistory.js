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
      'HOD_APPROVED',
      'HOD_REJECTED',
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
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ApprovalHistory', approvalHistorySchema);
