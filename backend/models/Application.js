const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    regNo: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    year: {
      type: String,
      default: 'III'
    },
    section: {
      type: String,
      default: 'A'
    },
    requestType: {
      type: String,
      required: true,
      enum: ['On-Duty', 'Leave', 'Event Participation', 'Other Permission']
    },
    reason: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalDays: {
      type: Number,
      default: 1
    },
    additionalDescription: {
      type: String,
      default: ''
    },
    eventDetails: {
      eventName: { type: String, default: '' },
      eventLocation: { type: String, default: '' },
      organizingInstitution: { type: String, default: '' },
      eventDescription: { type: String, default: '' }
    },
    documents: [
      {
        originalName: String,
        filename: String,
        path: String,
        size: Number,
        mimetype: String
      }
    ],
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'PENDING_FACULTY', 'PENDING_HOD', 'APPROVED', 'REJECTED'],
      default: 'PENDING_FACULTY'
    },
    currentStage: {
      type: String,
      enum: ['FACULTY_REVIEW', 'HOD_REVIEW', 'COMPLETED'],
      default: 'FACULTY_REVIEW'
    },
    facultyApproval: {
      approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'SKIPPED'],
        default: 'PENDING'
      },
      remarks: { type: String, default: '' },
      timestamp: { type: Date }
    },
    hodApproval: {
      approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'SKIPPED'],
        default: 'PENDING'
      },
      remarks: { type: String, default: '' },
      timestamp: { type: Date }
    },
    rejectionRemarks: {
      type: String,
      default: ''
    },
    rejectionBy: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String },
      timestamp: { type: Date }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Application', applicationSchema);
