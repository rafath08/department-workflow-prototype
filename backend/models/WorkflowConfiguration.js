const mongoose = require('mongoose');

const workflowConfigurationSchema = new mongoose.Schema({
  requestType: {
    type: String,
    required: true,
    unique: true,
    enum: ['On-Duty', 'Leave', 'Event Participation', 'Other Permission']
  },
  requiresFacultyApproval: {
    type: Boolean,
    default: true
  },
  requiresHodApproval: {
    type: Boolean,
    default: true
  },
  autoEscalateHours: {
    type: Number,
    default: 48
  },
  description: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkflowConfiguration', workflowConfigurationSchema);
