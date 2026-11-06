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
      enum: [
        'On-Duty',
        'Leave',
        'General Permission',
        'Bonafide Certificate',
        'No Objection Certificate (NOC)',
        'Event Participation',
        'Internship Permission',
        'Project Permission',
        'Academic Document Request',
        'Other Department Request',
        'Other Permission' // for backward compatibility
      ]
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
    // Event/Activity details
    eventDetails: {
      eventName: { type: String, default: '' },
      eventLocation: { type: String, default: '' },
      organizingInstitution: { type: String, default: '' },
      eventDescription: { type: String, default: '' }
    },
    // Extended fields for diverse student services
    serviceDetails: {
      certificateType: { type: String, default: '' },
      purpose: { type: String, default: '' },
      companyName: { type: String, default: '' },
      internshipRole: { type: String, default: '' },
      stipend: { type: String, default: '' },
      projectTitle: { type: String, default: '' },
      projectGuide: { type: String, default: '' },
      documentType: { type: String, default: '' },
      copiesRequired: { type: Number, default: 1 }
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
    // Status management: supports both the new human-friendly statuses and legacy codes
    status: {
      type: String,
      enum: [
        'Submitted',
        'Pending Faculty Approval',
        'Faculty Approved',
        'Forwarded to HOD',
        'Pending HOD Approval',
        'HOD Approved',
        'Forwarded to Admin',
        'Approved',
        'Rejected',
        'Additional Information Required',
        'Cancelled',
        // Legacy uppercase enum codes for backward compatibility
        'SUBMITTED',
        'PENDING_FACULTY',
        'PENDING_HOD',
        'APPROVED',
        'REJECTED',
        'CANCELLED'
      ],
      default: 'Pending Faculty Approval'
    },
    currentStage: {
      type: String,
      enum: ['FACULTY_REVIEW', 'HOD_REVIEW', 'ADMIN_REVIEW', 'COMPLETED', 'INFO_PENDING'],
      default: 'FACULTY_REVIEW'
    },
    currentApproverRole: {
      type: String,
      enum: ['faculty', 'hod', 'admin', 'student', 'none'],
      default: 'faculty'
    },
    currentApproverName: {
      type: String,
      default: ''
    },
    facultyApproval: {
      approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approverName: { type: String, default: '' },
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'FORWARDED', 'SKIPPED'],
        default: 'PENDING'
      },
      remarks: { type: String, default: '' },
      timestamp: { type: Date }
    },
    hodApproval: {
      approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approverName: { type: String, default: '' },
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'FORWARDED', 'SKIPPED'],
        default: 'PENDING'
      },
      remarks: { type: String, default: '' },
      timestamp: { type: Date }
    },
    adminApproval: {
      approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approverName: { type: String, default: '' },
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'SKIPPED'],
        default: 'PENDING'
      },
      remarks: { type: String, default: '' },
      timestamp: { type: Date }
    },
    // Explicit rejection tracking
    rejectionRemarks: {
      type: String,
      default: ''
    },
    rejectionBy: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, default: '' },
      name: { type: String, default: '' },
      timestamp: { type: Date }
    },
    // Multi-level forwarding audit trail
    forwardingHistory: [
      {
        fromRole: { type: String, required: true },
        fromName: { type: String, required: true },
        toRole: { type: String, required: true },
        toName: { type: String, default: '' },
        remarks: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    // Request additional information loop
    infoRequests: [
      {
        query: { type: String, required: true },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        requestedByName: { type: String, default: '' },
        requestedByRole: { type: String, default: '' },
        requestedAt: { type: Date, default: Date.now },
        response: { type: String, default: '' },
        respondedAt: { type: Date }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Application', applicationSchema);
