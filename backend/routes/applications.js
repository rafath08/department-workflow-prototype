const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const ApprovalHistory = require('../models/ApprovalHistory');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  handleApplicationSubmission,
  processApproval,
  processRejection,
  processForward,
  processRequestInfo,
  processProvideInfo,
  processCancel
} = require('../services/workflowEngine');

// Helper to generate unique Application ID: APP-YYYY-NNNN
const generateApplicationId = async () => {
  const year = new Date().getFullYear();
  const count = await Application.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `APP-${year}-${sequence}`;
};

// Helper for status query matching
const buildStatusFilter = (status) => {
  if (!status || status === 'ALL') return null;
  if (status === 'PENDING') {
    return {
      $in: [
        'Pending Faculty Approval',
        'Pending HOD Approval',
        'Forwarded to HOD',
        'Forwarded to Admin',
        'Additional Information Required',
        'PENDING_FACULTY',
        'PENDING_HOD'
      ]
    };
  }
  if (status === 'APPROVED') {
    return {
      $in: ['Approved', 'APPROVED', 'HOD Approved', 'Faculty Approved']
    };
  }
  if (status === 'REJECTED') {
    return {
      $in: ['Rejected', 'REJECTED']
    };
  }
  return status;
};

// @route   POST /api/applications
// @desc    Submit a new permission or student service request
// @access  Private (student, admin)
router.post(
  '/',
  protect,
  authorizeRoles('student', 'admin'),
  upload.single('document'),
  async (req, res) => {
    try {
      const {
        requestType,
        reason,
        startDate,
        endDate,
        additionalDescription,
        assignedFaculty,
        eventName,
        eventLocation,
        organizingInstitution,
        eventDescription,
        certificateType,
        purpose,
        companyName,
        internshipRole,
        stipend,
        projectTitle,
        projectGuide,
        documentType,
        copiesRequired
      } = req.body;

      if (!requestType || !reason || !startDate || !endDate || !assignedFaculty) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all mandatory fields (Request Type, Reason, Start Date, End Date, Assigned Faculty Mentor)'
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const applicationId = await generateApplicationId();

      const documents = [];
      if (req.file) {
        documents.push({
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: `/uploads/${req.file.filename}`,
          size: req.file.size,
          mimetype: req.file.mimetype
        });
      }

      const application = new Application({
        applicationId,
        student: req.user._id,
        studentName: req.user.name,
        regNo: req.user.regNo || 'N/A',
        department: req.user.department || 'Computer Science & Engineering',
        year: req.user.year || 'III',
        section: req.user.section || 'A',
        requestType,
        reason,
        startDate: start,
        endDate: end,
        totalDays,
        additionalDescription: additionalDescription || '',
        eventDetails: {
          eventName: eventName || '',
          eventLocation: eventLocation || '',
          organizingInstitution: organizingInstitution || '',
          eventDescription: eventDescription || ''
        },
        serviceDetails: {
          certificateType: certificateType || '',
          purpose: purpose || '',
          companyName: companyName || '',
          internshipRole: internshipRole || '',
          stipend: stipend || '',
          projectTitle: projectTitle || '',
          projectGuide: projectGuide || '',
          documentType: documentType || '',
          copiesRequired: Number(copiesRequired) || 1
        },
        documents,
        assignedFaculty
      });

      // Pass through workflow engine for dynamic routing & notifications
      await handleApplicationSubmission(application, req.user);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully and routed to your faculty mentor',
        data: application
      });
    } catch (error) {
      console.error('Submit application error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   GET /api/applications
// @desc    Get applications filtered by user role & query
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { role } = req.user;
    const { status, requestType, department, search, scope } = req.query;

    const query = {};

    if (role === 'student') {
      query.student = req.user._id;
    } else if (role === 'faculty') {
      // If scope === 'all', faculty can view department applications for reference
      if (scope === 'department') {
        query.department = req.user.department;
      } else {
        query.assignedFaculty = req.user._id;
      }
    } else if (role === 'hod') {
      // HOD views applications for their department
      query.department = req.user.department;
    }

    if (status && status !== 'ALL') {
      const statusFilter = buildStatusFilter(status);
      if (statusFilter) query.status = statusFilter;
    }

    if (requestType && requestType !== 'ALL') {
      query.requestType = requestType;
    }

    if (department && department !== 'ALL' && role === 'admin') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { applicationId: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { requestType: { $regex: search, $options: 'i' } }
      ];
    }

    const applications = await Application.find(query)
      .populate('student', 'name email regNo department year section phone')
      .populate('assignedFaculty', 'name email department')
      .populate('facultyApproval.approver', 'name email')
      .populate('hodApproval.approver', 'name email')
      .populate('rejectionBy.user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/applications/statistics
// @desc    Get dashboard metrics & department breakdown statistics
// @access  Private
router.get('/statistics', protect, async (req, res) => {
  try {
    const { role } = req.user;
    const query = {};

    if (role === 'student') {
      query.student = req.user._id;
    } else if (role === 'faculty') {
      query.assignedFaculty = req.user._id;
    } else if (role === 'hod') {
      query.department = req.user.department;
    }

    const total = await Application.countDocuments(query);
    const pendingFaculty = await Application.countDocuments({
      ...query,
      status: { $in: ['Pending Faculty Approval', 'PENDING_FACULTY'] }
    });
    const pendingHod = await Application.countDocuments({
      ...query,
      status: { $in: ['Pending HOD Approval', 'Forwarded to HOD', 'PENDING_HOD'] }
    });
    const pendingAdmin = await Application.countDocuments({
      ...query,
      status: 'Forwarded to Admin'
    });
    const infoRequired = await Application.countDocuments({
      ...query,
      status: 'Additional Information Required'
    });
    const approved = await Application.countDocuments({
      ...query,
      status: { $in: ['Approved', 'APPROVED', 'HOD Approved', 'Faculty Approved'] }
    });
    const rejected = await Application.countDocuments({
      ...query,
      status: { $in: ['Rejected', 'REJECTED'] }
    });

    // Approval performance / SLA metrics
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    // Department-wise distribution (for HOD / Admin)
    const departmentStats = await Application.aggregate([
      { $match: role === 'hod' ? { department: req.user.department } : {} },
      { $group: { _id: '$department', total: { $sum: 1 }, approved: { $sum: { $cond: [{ $in: ['$status', ['Approved', 'APPROVED']] }, 1, 0] } } } },
      { $sort: { total: -1 } }
    ]);

    // Request Type distribution
    const categoryStats = await Application.aggregate([
      { $match: query },
      { $group: { _id: '$requestType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        pendingFaculty,
        pendingHod,
        pendingAdmin,
        pendingTotal: pendingFaculty + pendingHod + pendingAdmin + infoRequired,
        infoRequired,
        approved,
        rejected,
        approvalRate,
        rejectionRate,
        departmentStats,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/applications/history
// @desc    Get paginated application history with advanced filtering
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { role } = req.user;
    const {
      page = 1,
      limit = 10,
      status,
      requestType,
      department,
      regNo,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (role === 'student') {
      query.student = req.user._id;
    } else if (role === 'faculty') {
      query.assignedFaculty = req.user._id;
    } else if (role === 'hod') {
      query.department = req.user.department;
    }

    if (status && status !== 'ALL') {
      const statusFilter = buildStatusFilter(status);
      if (statusFilter) query.status = statusFilter;
    }
    if (requestType && requestType !== 'ALL') query.requestType = requestType;
    if (department && department !== 'ALL' && role === 'admin') query.department = department;
    if (regNo) query.regNo = { $regex: regNo, $options: 'i' };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { applicationId: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('student', 'name email regNo department year section')
      .populate('assignedFaculty', 'name email')
      .populate('facultyApproval.approver', 'name email')
      .populate('hodApproval.approver', 'name email')
      .populate('rejectionBy.user', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/applications/tracking/:id
// @desc    Dedicated application tracking endpoint (returns full stage details, approvers, remarks)
// @access  Private
router.get('/tracking/:id', protect, async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { applicationId: req.params.id };

    const application = await Application.findOne(query)
      .populate('student', 'name email regNo department year section')
      .populate('assignedFaculty', 'name email department')
      .populate('facultyApproval.approver', 'name email role')
      .populate('hodApproval.approver', 'name email role')
      .populate('rejectionBy.user', 'name email role');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found with that identifier' });
    }

    // Role check: students can only track their own
    if (req.user.role === 'student' && application.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to track this application' });
    }

    const history = await ApprovalHistory.find({ application: application._id })
      .populate('actor', 'name email role')
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      data: {
        applicationId: application.applicationId,
        requestType: application.requestType,
        reason: application.reason,
        submissionDate: application.createdAt,
        currentStatus: application.status,
        currentApproverRole: application.currentApproverRole,
        currentApproverName: application.currentApproverName || application.assignedFaculty?.name,
        facultyRemarks: application.facultyApproval?.remarks || '',
        hodRemarks: application.hodApproval?.remarks || '',
        rejectionReason: application.rejectionRemarks || '',
        rejectedBy: application.rejectionBy,
        finalDecision:
          application.status === 'Approved' || application.status === 'APPROVED'
            ? 'APPROVED'
            : application.status === 'Rejected' || application.status === 'REJECTED'
            ? 'REJECTED'
            : 'PENDING',
        application,
        history
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application by ID or ApplicationId with timeline history
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { applicationId: req.params.id };

    const application = await Application.findOne(query)
      .populate('student', 'name email regNo department year section phone')
      .populate('assignedFaculty', 'name email department')
      .populate('facultyApproval.approver', 'name email role')
      .populate('hodApproval.approver', 'name email role')
      .populate('adminApproval.approver', 'name email role')
      .populate('rejectionBy.user', 'name email role');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const { role } = req.user;
    if (role === 'student' && application.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this application' });
    }
    if (
      role === 'faculty' &&
      application.assignedFaculty._id.toString() !== req.user._id.toString() &&
      role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this application' });
    }
    if (role === 'hod' && application.department !== req.user.department && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view another department application' });
    }

    const history = await ApprovalHistory.find({ application: application._id })
      .populate('actor', 'name email role')
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      data: {
        application,
        history
      }
    });
  } catch (error) {
    console.error('Get single application error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/applications/:id/approve
// @desc    Approve application (Faculty, HOD, Admin)
// @access  Private
router.put('/:id/approve', protect, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { applicationId: req.params.id };

    const application = await Application.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updatedApp = await processApproval({
      application,
      approver: req.user,
      remarks: remarks || ''
    });

    res.json({
      success: true,
      message: 'Application approved successfully',
      data: updatedApp
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/applications/:id/reject
// @desc    Reject application (Requires non-empty rejection remarks)
// @access  Private (faculty, hod, admin)
router.put('/:id/reject', protect, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is strictly required before an application can be rejected.'
      });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { applicationId: req.params.id };

    const application = await Application.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updatedApp = await processRejection({
      application,
      approver: req.user,
      remarks: remarks.trim()
    });

    res.json({
      success: true,
      message: 'Application rejected. The rejection reason has been recorded and notified to the student.',
      data: updatedApp
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/applications/:id/forward
// @desc    Forward application to next authority (HOD or Admin)
// @access  Private (faculty, hod, admin)
router.put('/:id/forward', protect, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { targetRole = 'hod', remarks = '' } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { applicationId: req.params.id };

    const application = await Application.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updatedApp = await processForward({
      application,
      approver: req.user,
      targetRole,
      remarks
    });

    res.json({
      success: true,
      message: `Application forwarded successfully to ${targetRole.toUpperCase()}`,
      data: updatedApp
    });
  } catch (error) {
    console.error('Forward application error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/applications/:id/request-info
// @desc    Request additional info / clarification from applicant
// @access  Private (faculty, hod, admin)
router.put('/:id/request-info', protect, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { query: clarificationQuery } = req.body;

    if (!clarificationQuery || !clarificationQuery.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please specify what additional clarification or document is required.'
      });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { applicationId: req.params.id };

    const application = await Application.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updatedApp = await processRequestInfo({
      application,
      approver: req.user,
      query: clarificationQuery.trim()
    });

    res.json({
      success: true,
      message: 'Information request sent to student',
      data: updatedApp
    });
  } catch (error) {
    console.error('Request info error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/applications/:id/provide-info
// @desc    Student responds to additional information request
// @access  Private (student)
router.put('/:id/provide-info', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your explanation or clarification before submitting.'
      });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { applicationId: req.params.id };

    const application = await Application.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this application' });
    }

    const updatedApp = await processProvideInfo({
      application,
      studentUser: req.user,
      response: response.trim()
    });

    res.json({
      success: true,
      message: 'Clarification submitted successfully. Application returned to review queue.',
      data: updatedApp
    });
  } catch (error) {
    console.error('Provide info error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/applications/:id/cancel
// @desc    Student cancels application
// @access  Private (student)
router.put('/:id/cancel', protect, authorizeRoles('student'), async (req, res) => {
  try {
    const { reason } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { applicationId: req.params.id };

    const application = await Application.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this application' });
    }

    const updatedApp = await processCancel({
      application,
      studentUser: req.user,
      reason
    });

    res.json({
      success: true,
      message: 'Application cancelled',
      data: updatedApp
    });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
