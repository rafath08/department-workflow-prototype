const mongoose = require('mongoose');

const departmentEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: 'All Departments'
    },
    eventType: {
      type: String,
      enum: ['Academic', 'Symposium / Conference', 'Workshop', 'OD Event', 'Deadline', 'Exam', 'Holiday'],
      default: 'Academic'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      default: 'Campus'
    },
    organizer: {
      type: String,
      default: 'Department'
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DepartmentEvent', departmentEventSchema);
