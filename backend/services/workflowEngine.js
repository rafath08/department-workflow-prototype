const WorkflowConfiguration = require('../models/WorkflowConfiguration');
const ApprovalHistory = require('../models/ApprovalHistory');
const { createNotification, notifyRole } = require('./notificationService');
const User = require('../models/User');

/**
 * Get workflow configuration for request type, falling back to default
 */
const getWorkflowConfig = async (requestType) => {
  let config = await WorkflowConfiguration.findOne({ requestType });
  if (!config) {
    config = {
      requestType,
      requiresFacultyApproval: true,
      requiresHodApproval: true,
      autoEscalateHours: 48
    };
  }
  return config;
};

/**
 * Handle initial application state upon submission
 */
const handleApplicationSubmission = async (application, studentUser) => {
  const config = await getWorkflowConfig(application.requestType);
  const prevStatus = 'SUBMITTED';

  let initialStatus = 'PENDING_FACULTY';
  let initialStage = 'FACULTY_REVIEW';

  if (!config.requiresFacultyApproval && config.requiresHodApproval) {
    initialStatus = 'PENDING_HOD';
    initialStage = 'HOD_REVIEW';
  } else if (!config.requiresFacultyApproval && !config.requiresHodApproval) {
    initialStatus = 'APPROVED';
    initialStage = 'COMPLETED';
  }

  application.status = initialStatus;
  application.currentStage = initialStage;
  await application.save();

  // Create submission approval history record
  await ApprovalHistory.create({
    application: application._id,
    applicationId: application.applicationId,
    actor: studentUser._id,
    actorName: studentUser.name,
    actorRole: 'student',
    action: 'SUBMITTED',
    previousStatus: 'DRAFT',
    newStatus: initialStatus,
    remarks: `Application submitted for ${application.requestType}`,
    timestamp: new Date()
  });

  // Notify student of successful submission
  await createNotification({
    recipientId: studentUser._id,
    title: 'Application Submitted Successfully',
    message: `Your ${application.requestType} request (${application.applicationId}) has been submitted and is currently in review.`,
    type: 'SUBMISSION',
    applicationId: application.applicationId,
    appRecordId: application._id
  });

  // If pending faculty, notify assigned faculty
  if (initialStatus === 'PENDING_FACULTY' && application.assignedFaculty) {
    await createNotification({
      recipientId: application.assignedFaculty,
      title: 'New Permission Request Awaiting Review',
      message: `Student ${application.studentName} (${application.regNo}) submitted a ${application.requestType} request (${application.applicationId}) awaiting your review.`,
      type: 'PENDING_FACULTY',
      applicationId: application.applicationId,
      appRecordId: application._id
    });
  } else if (initialStatus === 'PENDING_HOD') {
    // Notify HOD directly if faculty approval is skipped
    await notifyRole({
      role: 'hod',
      department: application.department,
      title: 'New Request Forwarded for HOD Approval',
      message: `Application ${application.applicationId} from ${application.studentName} is awaiting HOD approval.`,
      type: 'PENDING_HOD',
      applicationId: application.applicationId,
      appRecordId: application._id
    });
  }

  return application;
};

/**
 * Process approval action by Faculty or HOD
 */
const processApproval = async ({ application, approver, remarks }) => {
  const config = await getWorkflowConfig(application.requestType);
  const prevStatus = application.status;

  if (approver.role === 'faculty') {
    // Check if faculty is allowed to approve
    if (
      application.assignedFaculty.toString() !== approver._id.toString() &&
      approver.role !== 'admin'
    ) {
      throw new Error('You are not the designated faculty mentor for this application');
    }

    if (application.status !== 'PENDING_FACULTY') {
      throw new Error(`Application is not currently awaiting faculty approval (status: ${application.status})`);
    }

    application.facultyApproval = {
      approver: approver._id,
      status: 'APPROVED',
      remarks: remarks || 'Recommended and forwarded by faculty',
      timestamp: new Date()
    };

    let nextStatus = 'PENDING_HOD';
    let nextStage = 'HOD_REVIEW';

    // If HOD approval is not required by workflow configuration
    if (!config.requiresHodApproval) {
      nextStatus = 'APPROVED';
      nextStage = 'COMPLETED';
    }

    application.status = nextStatus;
    application.currentStage = nextStage;
    await application.save();

    // Log in history
    await ApprovalHistory.create({
      application: application._id,
      applicationId: application.applicationId,
      actor: approver._id,
      actorName: approver.name,
      actorRole: 'faculty',
      action: 'FACULTY_APPROVED',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      remarks: remarks || 'Approved by Faculty',
      timestamp: new Date()
    });

    // Notify student
    await createNotification({
      recipientId: application.student,
      title: nextStatus === 'APPROVED' ? 'Application Approved!' : 'Faculty Approved & Forwarded',
      message:
        nextStatus === 'APPROVED'
          ? `Your application ${application.applicationId} has been approved by ${approver.name}.`
          : `Faculty ${approver.name} approved your request (${application.applicationId}). It has been forwarded to the Head of Department.`,
      type: nextStatus === 'APPROVED' ? 'APPROVED' : 'FORWARDED',
      applicationId: application.applicationId,
      appRecordId: application._id
    });

    // Notify HOD if forwarded
    if (nextStatus === 'PENDING_HOD') {
      await notifyRole({
        role: 'hod',
        department: application.department,
        title: 'Application Forwarded for HOD Review',
        message: `Application ${application.applicationId} for student ${application.studentName} was approved by faculty and is now pending your review.`,
        type: 'PENDING_HOD',
        applicationId: application.applicationId,
        appRecordId: application._id
      });
    }

    return application;
  }

  if (approver.role === 'hod' || approver.role === 'admin') {
    if (application.status !== 'PENDING_HOD' && approver.role !== 'admin') {
      throw new Error(`Application is not currently awaiting HOD approval (status: ${application.status})`);
    }

    application.hodApproval = {
      approver: approver._id,
      status: 'APPROVED',
      remarks: remarks || 'Approved by Head of Department',
      timestamp: new Date()
    };

    application.status = 'APPROVED';
    application.currentStage = 'COMPLETED';
    await application.save();

    // Log in history
    await ApprovalHistory.create({
      application: application._id,
      applicationId: application.applicationId,
      actor: approver._id,
      actorName: approver.name,
      actorRole: approver.role,
      action: 'HOD_APPROVED',
      previousStatus: prevStatus,
      newStatus: 'APPROVED',
      remarks: remarks || 'Final approval granted by HOD',
      timestamp: new Date()
    });

    // Notify Student
    await createNotification({
      recipientId: application.student,
      title: 'Application Fully Approved 🎉',
      message: `Congratulations! Your ${application.requestType} application (${application.applicationId}) has been granted final approval.`,
      type: 'APPROVED',
      applicationId: application.applicationId,
      appRecordId: application._id
    });

    // Notify Faculty
    if (application.assignedFaculty) {
      await createNotification({
        recipientId: application.assignedFaculty,
        title: 'Application Approved by HOD',
        message: `Application ${application.applicationId} for ${application.studentName} has received final HOD approval.`,
        type: 'APPROVED',
        applicationId: application.applicationId,
        appRecordId: application._id
      });
    }

    return application;
  }

  throw new Error('Unauthorized role for approval');
};

/**
 * Process rejection by Faculty or HOD
 */
const processRejection = async ({ application, approver, remarks }) => {
  const prevStatus = application.status;

  if (
    approver.role === 'faculty' &&
    application.assignedFaculty.toString() !== approver._id.toString() &&
    approver.role !== 'admin'
  ) {
    throw new Error('You are not authorized to reject this application');
  }

  const roleAction = approver.role === 'faculty' ? 'FACULTY_REJECTED' : 'HOD_REJECTED';

  if (approver.role === 'faculty') {
    application.facultyApproval = {
      approver: approver._id,
      status: 'REJECTED',
      remarks: remarks || 'Rejected by Faculty',
      timestamp: new Date()
    };
  } else if (approver.role === 'hod' || approver.role === 'admin') {
    application.hodApproval = {
      approver: approver._id,
      status: 'REJECTED',
      remarks: remarks || 'Rejected by HOD',
      timestamp: new Date()
    };
  }

  application.status = 'REJECTED';
  application.currentStage = 'COMPLETED';
  application.rejectionRemarks = remarks || 'Request was rejected';
  application.rejectionBy = {
    user: approver._id,
    role: approver.role,
    timestamp: new Date()
  };

  await application.save();

  // Log in history
  await ApprovalHistory.create({
    application: application._id,
    applicationId: application.applicationId,
    actor: approver._id,
    actorName: approver.name,
    actorRole: approver.role,
    action: roleAction,
    previousStatus: prevStatus,
    newStatus: 'REJECTED',
    remarks: remarks || 'Application was rejected',
    timestamp: new Date()
  });

  // Notify student
  await createNotification({
    recipientId: application.student,
    title: 'Application Rejected',
    message: `Your ${application.requestType} application (${application.applicationId}) was rejected by ${approver.name}. Reason: ${remarks || 'No remarks provided.'}`,
    type: 'REJECTED',
    applicationId: application.applicationId,
    appRecordId: application._id
  });

  return application;
};

module.exports = {
  getWorkflowConfig,
  handleApplicationSubmission,
  processApproval,
  processRejection
};
