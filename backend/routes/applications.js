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
  processRejection
} = require('../services/workflowEngine');

// Helper to generate unique Application ID
const generateApplicationId = async () => {
  const year = new Date().getFullYear();
  const count = await Application.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `APP-${year}-${sequence}`;
};

// @route   POST /api/applications
// @desc    Submit a new permission request (Student)
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
        eventDescription
      } = req.body;

      if (!requestType || !reason || !startDate || !endDate || !assignedFaculty) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields (requestType, reason, startDate, endDate, assignedFaculty)'
        });
      }

      if (
        (requestType === 'On-Duty' || requestType === 'Event Participation') &&
        (!eventName || !eventLocation || !organizingInstitution)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Please fill out all event details (Event Name, Location, Organizing Institution)'
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
        documents,
        assignedFaculty
      });

      // Pass through workflow engine for dynamic routing & notification
      await handleApplicationSubmission(application, req.user);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
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
    const { status, requestType, department, search } = req.query;

    const query = {};

    if (role === 'student') {
      query.student = req.user._id;
    } else if (role === 'faculty') {
      // Faculty views applications assigned to them
      query.assignedFaculty = req.user._id;
    } else if (role === 'hod') {
      // HOD views applications for their department
      query.department = req.user.department;
    }

    if (status && status !== 'ALL') {
      query.status = status;
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
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    const applications = await Application.find(query)
      .populate('student', 'name email regNo department year section')
      .populate('assignedFaculty', 'name email')
      .populate('facultyApproval.approver', 'name email')
      .populate('hodApproval.approver', 'name email')
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
// @desc    Get dashboard metrics & quick statistics
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
    const pendingFaculty = await Application.countDocuments({ ...query, status: 'PENDING_FACULTY' });
    const pendingHod = await Application.countDocuments({ ...query, status: 'PENDING_HOD' });
    const approved = await Application.countDocuments({ ...query, status: 'APPROVED' });
    const rejected = await Application.countDocuments({ ...query, status: 'REJECTED' });

    res.json({
      success: true,
      data: {
        total,
        pendingFaculty,
        pendingHod,
        pendingTotal: pendingFaculty + pendingHod,
        approved,
        rejected
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/applications/history
// @desc    Get paginated application history with advanced filters
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

    if (status && status !== 'ALL') query.status = status;
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
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
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
      .populate('rejectionBy.user', 'name email role');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Role access authorization check
    const { role } = req.user;
    if (role === 'student' && application.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this application' });
    }
    if (role === 'faculty' && application.assignedFaculty._id.toString() !== req.user._id.toString() && role !== 'admin') {
      // Faculty can view if it was assigned to them
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
// @desc    Approve application (Faculty or HOD or Admin)
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
// @desc    Reject application (Faculty or HOD or Admin)
// @access  Private
router.put('/:id/reject', protect, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { applicationId: req.params.id };

    const application = await Application.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const updatedApp = await processRejection({
      application,
      approver: req.user,
      remarks: remarks || 'Rejected by approver'
    });

    res.json({
      success: true,
      message: 'Application rejected',
      data: updatedApp
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
