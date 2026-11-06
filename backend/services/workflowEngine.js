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

  let initialStatus = 'Pending Faculty Approval';
  let initialStage = 'FACULTY_REVIEW';
  let currentApproverRole = 'faculty';

  if (!config.requiresFacultyApproval && config.requiresHodApproval) {
    initialStatus = 'Pending HOD Approval';
    initialStage = 'HOD_REVIEW';
    currentApproverRole = 'hod';
  } else if (!config.requiresFacultyApproval && !config.requiresHodApproval) {
    initialStatus = 'Approved';
    initialStage = 'COMPLETED';
    currentApproverRole = 'none';
  }

  // Populate faculty mentor name if available
  if (application.assignedFaculty) {
    const facultyUser = await User.findById(application.assignedFaculty).select('name');
    if (facultyUser) {
      application.currentApproverName = facultyUser.name;
    }
  }

  application.status = initialStatus;
  application.currentStage = initialStage;
  application.currentApproverRole = currentApproverRole;
  await application.save();

  // Create submission approval history record
  await ApprovalHistory.create({
    application: application._id,
    applicationId: application.applicationId,
    actor: studentUser._id,
    actorName: studentUser.name,
    actorRole: 'student',
    action: 'SUBMITTED',
    previousStatus: 'Draft',
    newStatus: initialStatus,
    remarks: `Application submitted for ${application.requestType}: ${application.reason}`,
    timestamp: new Date()
  });

  // Notify student of successful submission
  await createNotification({
    recipientId: studentUser._id,
    title: 'Application Submitted Successfully',
    message: `Your ${application.requestType} application (${application.applicationId}) has been submitted and is currently with ${currentApproverRole === 'faculty' ? 'Faculty Mentor' : 'Department HOD'} for review.`,
    type: 'SUBMISSION',
    applicationId: application.applicationId,
    appRecordId: application._id
  });

  // If pending faculty, notify assigned faculty
  if (initialStatus === 'Pending Faculty Approval' && application.assignedFaculty) {
    await createNotification({
      recipientId: application.assignedFaculty,
      title: 'New Permission Request Awaiting Review',
      message: `Student ${application.studentName} (${application.regNo}) submitted a ${application.requestType} request (${application.applicationId}) awaiting your recommendation.`,
      type: 'PENDING_FACULTY',
      applicationId: application.applicationId,
      appRecordId: application._id
    });
  } else if (initialStatus === 'Pending HOD Approval') {
    await notifyRole({
      role: 'hod',
      department: application.department,
      title: 'New Request Awaiting HOD Approval',
      message: `Application ${application.applicationId} from ${application.studentName} is awaiting HOD approval.`,
      type: 'PENDING_HOD',
      applicationId: application.applicationId,
      appRecordId: application._id
    });
  }

  return application;
};

/**
 * Process approval action by Faculty, HOD, or Admin
 */
const processApproval = async ({ application, approver, remarks }) => {
  const config = await getWorkflowConfig(application.requestType);
  const prevStatus = application.status;

  if (approver.role === 'faculty') {
    // Check faculty assignment authorization
    if (
      application.assignedFaculty.toString() !== approver._id.toString() &&
      approver.role !== 'admin'
    ) {
      throw new Error('You are not the designated faculty mentor for this application');
    }

    application.facultyApproval = {
      approver: approver._id,
      approverName: approver.name,
      status: 'APPROVED',
      remarks: remarks || 'Recommended and endorsed by faculty mentor',
      timestamp: new Date()
    };

    let nextStatus = 'Pending HOD Approval';
    let nextStage = 'HOD_REVIEW';
    let nextRole = 'hod';

    // If HOD approval is not required by workflow configuration
    if (!config.requiresHodApproval) {
      nextStatus = 'Approved';
      nextStage = 'COMPLETED';
      nextRole = 'none';
    }

    application.status = nextStatus;
    application.currentStage = nextStage;
    application.currentApproverRole = nextRole;
    application.currentApproverName = nextRole === 'hod' ? 'Head of Department' : '';
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
      remarks: remarks || 'Endorsed and forwarded by Faculty Mentor',
      timestamp: new Date()
    });

    // Notify student
    await createNotification({
      recipientId: application.student,
      title: nextStatus === 'Approved' ? 'Application Sanctioned & Approved!' : 'Faculty Endorsed – Forwarded to HOD',
      message:
        nextStatus === 'Approved'
          ? `Your application ${application.applicationId} has received final faculty sanction.`
          : `Faculty ${approver.name} approved your request (${application.applicationId}). It has been forwarded to the HOD for final sanction.`,
      type: nextStatus === 'Approved' ? 'APPROVED' : 'FORWARDED',
      applicationId: application.applicationId,
      appRecordId: application._id
    });

    // Notify HOD if forwarded
    if (nextStatus === 'Pending HOD Approval') {
      await notifyRole({
        role: 'hod',
        department: application.department,
        title: 'Application Forwarded for HOD Review',
        message: `Application ${application.applicationId} for student ${application.studentName} was approved by faculty ${approver.name} and is now pending your review.`,
        type: 'PENDING_HOD',
        applicationId: application.applicationId,
        appRecordId: application._id
      });
    }

    return application;
  }

  if (approver.role === 'hod' || approver.role === 'admin') {
    application.hodApproval = {
      approver: approver._id,
      approverName: approver.name,
      status: 'APPROVED',
      remarks: remarks || 'Approved and officially sanctioned by Head of Department',
      timestamp: new Date()
    };

    application.status = 'Approved';
    application.currentStage = 'COMPLETED';
    application.currentApproverRole = 'none';
    application.currentApproverName = '';
    await application.save();

    // Log in history
    await ApprovalHistory.create({
      application: application._id,
      applicationId: application.applicationId,
      actor: approver._id,
      actorName: approver.name,
      actorRole: approver.role,
      action: approver.role === 'admin' ? 'ADMIN_APPROVED' : 'HOD_APPROVED',
      previousStatus: prevStatus,
      newStatus: 'Approved',
      remarks: remarks || `Final institutional approval granted by ${approver.name}`,
      timestamp: new Date()
    });

    // Notify Student
    await createNotification({
      recipientId: application.student,
      title: 'Application Fully Approved 🎉',
      message: `Congratulations! Your ${application.requestType} request (${application.applicationId}) has been granted official institutional approval. Remarks: ${remarks || 'Sanctioned.'}`,
      type: 'APPROVED',
      applicationId: application.applicationId,
      appRecordId: application._id
    });

    // Notify Faculty
    if (application.assignedFaculty) {
      await createNotification({
        recipientId: application.assignedFaculty,
        title: 'Application Approved by HOD',
        message: `Application ${application.applicationId} for ${application.studentName} has received final approval from ${approver.name}.`,
        type: 'APPROVED',
        applicationId: application.applicationId,
        appRecordId: application._id
      });
    }

    return application;
  }

  throw new Error('Unauthorized role for approval action');
};

/**
 * Process rejection by Faculty, HOD, or Admin (MANDATORY REASON)
 */
const processRejection = async ({ application, approver, remarks }) => {
  if (!remarks || !remarks.trim()) {
    throw new Error('A rejection reason is strictly required.');
  }

  const prevStatus = application.status;

  if (
    approver.role === 'faculty' &&
    application.assignedFaculty.toString() !== approver._id.toString() &&
    approver.role !== 'admin'
  ) {
    throw new Error('You are not authorized to reject this application');
  }

  const roleAction =
    approver.role === 'faculty'
      ? 'FACULTY_REJECTED'
      : approver.role === 'hod'
      ? 'HOD_REJECTED'
      : 'ADMIN_REJECTED';

  if (approver.role === 'faculty') {
    application.facultyApproval = {
      approver: approver._id,
      approverName: approver.name,
      status: 'REJECTED',
      remarks: remarks.trim(),
      timestamp: new Date()
    };
  } else if (approver.role === 'hod' || approver.role === 'admin') {
    application.hodApproval = {
      approver: approver._id,
      approverName: approver.name,
      status: 'REJECTED',
      remarks: remarks.trim(),
      timestamp: new Date()
    };
  }

  application.status = 'Rejected';
  application.currentStage = 'COMPLETED';
  application.currentApproverRole = 'none';
  application.rejectionRemarks = remarks.trim();
  application.rejectionBy = {
    user: approver._id,
    role: approver.role,
    name: approver.name,
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
    newStatus: 'Rejected',
    remarks: remarks.trim(),
    timestamp: new Date()
  });

  // Notify student with prominent rejection reason
  await createNotification({
    recipientId: application.student,
    title: 'Application Rejected',
    message: `Your ${application.requestType} application (${application.applicationId}) was rejected by ${approver.name} (${approver.role.toUpperCase()}). Reason: "${remarks.trim()}"`,
    type: 'REJECTED',
    applicationId: application.applicationId,
    appRecordId: application._id
  });

  return application;
};

/**
 * Forward application to next designated authority
 */
const processForward = async ({ application, approver, targetRole = 'hod', remarks = '' }) => {
  const prevStatus = application.status;

  let nextStatus = 'Forwarded to HOD';
  let nextStage = 'HOD_REVIEW';
  let actionName = 'FORWARDED_TO_HOD';

  if (targetRole === 'admin' || targetRole === 'principal') {
    nextStatus = 'Forwarded to Admin';
    nextStage = 'ADMIN_REVIEW';
    actionName = 'FORWARDED_TO_ADMIN';
  } else {
    nextStatus = 'Forwarded to HOD';
    nextStage = 'HOD_REVIEW';
    actionName = 'FORWARDED_TO_HOD';
  }

  // Update approver status record
  if (approver.role === 'faculty') {
    application.facultyApproval = {
      approver: approver._id,
      approverName: approver.name,
      status: 'FORWARDED',
      remarks: remarks || `Forwarded to ${targetRole.toUpperCase()} by faculty mentor`,
      timestamp: new Date()
    };
  } else if (approver.role === 'hod') {
    application.hodApproval = {
      approver: approver._id,
      approverName: approver.name,
      status: 'FORWARDED',
      remarks: remarks || `Escalated to ${targetRole.toUpperCase()} by HOD`,
      timestamp: new Date()
    };
  }

  application.status = nextStatus;
  application.currentStage = nextStage;
  application.currentApproverRole = targetRole;
  application.currentApproverName = targetRole === 'admin' ? 'College Administration' : 'Head of Department';

  // Record into forwarding audit trail
  application.forwardingHistory.push({
    fromRole: approver.role,
    fromName: approver.name,
    toRole: targetRole,
    toName: targetRole.toUpperCase(),
    remarks: remarks || `Application forwarded to ${targetRole.toUpperCase()}`,
    timestamp: new Date()
  });

  await application.save();

  // Log in history
  await ApprovalHistory.create({
    application: application._id,
    applicationId: application.applicationId,
    actor: approver._id,
    actorName: approver.name,
    actorRole: approver.role,
    action: actionName,
    previousStatus: prevStatus,
    newStatus: nextStatus,
    targetRole,
    remarks: remarks || `Application forwarded to ${targetRole.toUpperCase()}`,
    timestamp: new Date()
  });

  // Notify student
  await createNotification({
    recipientId: application.student,
    title: `Application Forwarded to ${targetRole.toUpperCase()}`,
    message: `Your application ${application.applicationId} was forwarded by ${approver.name} to the ${targetRole.toUpperCase()}. Note: ${remarks || 'In review.'}`,
    type: 'FORWARDED',
    applicationId: application.applicationId,
    appRecordId: application._id
  });

  // Notify target authority
  if (targetRole === 'hod') {
    await notifyRole({
      role: 'hod',
      department: application.department,
      title: 'New Forwarded Application in Queue',
      message: `Application ${application.applicationId} for student ${application.studentName} has been forwarded to you by ${approver.name}.`,
      type: 'PENDING_HOD',
      applicationId: application.applicationId,
      appRecordId: application._id
    });
  } else if (targetRole === 'admin') {
    await notifyRole({
      role: 'admin',
      title: 'Application Escalated for Admin Sanction',
      message: `Application ${application.applicationId} from ${application.department} has been escalated for administrative review.`,
      type: 'PENDING_ADMIN',
      applicationId: application.applicationId,
      appRecordId: application._id
    });
  }

  return application;
};

/**
 * Request additional information / clarification from student
 */
const processRequestInfo = async ({ application, approver, query }) => {
  if (!query || !query.trim()) {
    throw new Error('Please specify what additional information is required.');
  }

  const prevStatus = application.status;

  application.infoRequests.push({
    query: query.trim(),
    requestedBy: approver._id,
    requestedByName: approver.name,
    requestedByRole: approver.role,
    requestedAt: new Date()
  });

  application.status = 'Additional Information Required';
  application.currentApproverRole = 'student';
  application.currentApproverName = application.studentName;
  await application.save();

  // Log in history
  await ApprovalHistory.create({
    application: application._id,
    applicationId: application.applicationId,
    actor: approver._id,
    actorName: approver.name,
    actorRole: approver.role,
    action: 'INFO_REQUESTED',
    previousStatus: prevStatus,
    newStatus: 'Additional Information Required',
    remarks: query.trim(),
    timestamp: new Date()
  });

  // Notify student
  await createNotification({
    recipientId: application.student,
    title: 'Additional Information Requested',
    message: `${approver.name} (${approver.role.toUpperCase()}) requested additional details for application ${application.applicationId}: "${query.trim()}"`,
    type: 'INFO_REQUIRED',
    applicationId: application.applicationId,
    appRecordId: application._id
  });

  return application;
};

/**
 * Student provides the requested additional information
 */
const processProvideInfo = async ({ application, studentUser, response }) => {
  if (!response || !response.trim()) {
    throw new Error('Please enter your response to the clarification query.');
  }

  const prevStatus = application.status;

  // Find the latest open info request
  if (application.infoRequests && application.infoRequests.length > 0) {
    const latest = application.infoRequests[application.infoRequests.length - 1];
    latest.response = response.trim();
    latest.respondedAt = new Date();
  }

  // Restore to previous review stage
  let nextStatus = 'Pending Faculty Approval';
  let nextRole = 'faculty';

  if (application.currentStage === 'HOD_REVIEW') {
    nextStatus = 'Pending HOD Approval';
    nextRole = 'hod';
  } else if (application.currentStage === 'ADMIN_REVIEW') {
    nextStatus = 'Forwarded to Admin';
    nextRole = 'admin';
  }

  application.status = nextStatus;
  application.currentApproverRole = nextRole;
  await application.save();

  // Log in history
  await ApprovalHistory.create({
    application: application._id,
    applicationId: application.applicationId,
    actor: studentUser._id,
    actorName: studentUser.name,
    actorRole: 'student',
    action: 'INFO_PROVIDED',
    previousStatus: prevStatus,
    newStatus: nextStatus,
    remarks: response.trim(),
    timestamp: new Date()
  });

  // Notify the assigned approver
  if (nextRole === 'faculty' && application.assignedFaculty) {
    await createNotification({
      recipientId: application.assignedFaculty,
      title: 'Clarification Provided by Student',
      message: `Student ${studentUser.name} submitted additional details for application ${application.applicationId}.`,
      type: 'INFO_PROVIDED',
      applicationId: application.applicationId,
      appRecordId: application._id
    });
  } else if (nextRole === 'hod') {
    await notifyRole({
      role: 'hod',
      department: application.department,
      title: 'Clarification Provided by Student',
      message: `Student ${studentUser.name} provided requested information for ${application.applicationId}.`,
      type: 'INFO_PROVIDED',
      applicationId: application.applicationId,
      appRecordId: application._id
    });
  }

  return application;
};

/**
 * Student cancels their own pending application
 */
const processCancel = async ({ application, studentUser, reason = '' }) => {
  const prevStatus = application.status;

  if (
    application.status === 'Approved' ||
    application.status === 'Rejected' ||
    application.status === 'Cancelled'
  ) {
    throw new Error('Cannot cancel an application that is already completed or cancelled.');
  }

  application.status = 'Cancelled';
  application.currentStage = 'COMPLETED';
  application.currentApproverRole = 'none';
  await application.save();

  await ApprovalHistory.create({
    application: application._id,
    applicationId: application.applicationId,
    actor: studentUser._id,
    actorName: studentUser.name,
    actorRole: 'student',
    action: 'CANCELLED',
    previousStatus: prevStatus,
    newStatus: 'Cancelled',
    remarks: reason || 'Application cancelled by applicant',
    timestamp: new Date()
  });

  return application;
};

module.exports = {
  getWorkflowConfig,
  handleApplicationSubmission,
  processApproval,
  processRejection,
  processForward,
  processRequestInfo,
  processProvideInfo,
  processCancel
};
