const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Department = require('../models/Department');
const Application = require('../models/Application');
const WorkflowConfiguration = require('../models/WorkflowConfiguration');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// All admin routes require admin privileges
router.use(protect, authorizeRoles('admin'));

// @route   GET /api/admin/users
// @desc    Get all users with search, role, department filter
router.get('/users', async (req, res) => {
  try {
    const { role, department, search } = req.query;
    const query = {};

    if (role && role !== 'ALL') query.role = role;
    if (department && department !== 'ALL') query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('mentor', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, regNo, department, year, section, mentorId, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Default@123',
      role: role || 'student',
      regNo,
      department: department || 'Computer Science & Engineering',
      year: year || 'III',
      section: section || 'A',
      mentor: mentorId || null,
      phone: phone || ''
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details
router.put('/users/:id', async (req, res) => {
  try {
    const { name, role, department, regNo, year, section, isActive, phone, mentor } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (role) updateFields.role = role;
    if (department) updateFields.department = department;
    if (regNo) updateFields.regNo = regNo;
    if (year) updateFields.year = year;
    if (section) updateFields.section = section;
    if (typeof isActive === 'boolean') updateFields.isActive = isActive;
    if (phone !== undefined) updateFields.phone = phone;
    if (mentor !== undefined) updateFields.mentor = mentor || null;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/departments
// @desc    Get all departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find().populate('hod', 'name email');
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/departments
// @desc    Create department
router.post('/departments', async (req, res) => {
  try {
    const { name, code, hod, description } = req.body;
    const department = await Department.create({
      name,
      code,
      hod: hod || null,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/workflow-configs
// @desc    Get workflow configurations for all request types
router.get('/workflow-configs', async (req, res) => {
  try {
    const configs = await WorkflowConfiguration.find();
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/workflow-configs/:requestType
// @desc    Update workflow approval steps for a request type
router.put('/workflow-configs/:requestType', async (req, res) => {
  try {
    const { requiresFacultyApproval, requiresHodApproval, autoEscalateHours, description } = req.body;

    const config = await WorkflowConfiguration.findOneAndUpdate(
      { requestType: req.params.requestType },
      {
        $set: {
          requiresFacultyApproval,
          requiresHodApproval,
          autoEscalateHours: autoEscalateHours || 48,
          description: description || '',
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `Workflow for ${req.params.requestType} updated successfully`,
      data: config
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/reports
// @desc    Get comprehensive analytics for charts and administrative dashboard
router.get('/reports', async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const pendingFaculty = await Application.countDocuments({ status: 'PENDING_FACULTY' });
    const pendingHod = await Application.countDocuments({ status: 'PENDING_HOD' });
    const approved = await Application.countDocuments({ status: 'APPROVED' });
    const rejected = await Application.countDocuments({ status: 'REJECTED' });

    // 1. Applications by Request Type
    const byRequestType = await Application.aggregate([
      { $group: { _id: '$requestType', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    // 2. Department-wise distribution
    const byDepartment = await Application.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] }
          },
          pending: {
            $sum: {
              $cond: [
                { $in: ['$status', ['PENDING_FACULTY', 'PENDING_HOD']] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          department: '$_id',
          total: 1,
          approved: 1,
          rejected: 1,
          pending: 1,
          _id: 0
        }
      }
    ]);

    // 3. Approval vs Rejection stats
    const approvalStats = [
      { name: 'Approved', value: approved, color: '#10b981' },
      { name: 'Rejected', value: rejected, color: '#ef4444' },
      { name: 'Pending Faculty', value: pendingFaculty, color: '#3b82f6' },
      { name: 'Pending HOD', value: pendingHod, color: '#f59e0b' }
    ];

    // 4. Monthly trends (last 6 months)
    const monthlyTrends = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = monthlyTrends.map((t) => ({
      name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      total: t.total,
      approved: t.approved,
      rejected: t.rejected
    }));

    // If trends are sparse, provide a baseline with current month
    if (formattedTrends.length === 0) {
      formattedTrends.push({
        name: 'Current Month',
        total: totalApplications,
        approved,
        rejected
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          total: totalApplications,
          pendingFaculty,
          pendingHod,
          pendingTotal: pendingFaculty + pendingHod,
          approved,
          rejected
        },
        byRequestType,
        byDepartment,
        approvalStats,
        monthlyTrends: formattedTrends
      }
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/export
// @desc    Export applications as CSV with complete audit trail
router.get('/export', async (req, res) => {
  try {
    const { status, requestType, department } = req.query;
    const query = {};

    if (status && status !== 'ALL') query.status = status;
    if (requestType && requestType !== 'ALL') query.requestType = requestType;
    if (department && department !== 'ALL') query.department = department;

    const applications = await Application.find(query)
      .populate('student', 'name email regNo')
      .populate('assignedFaculty', 'name email')
      .populate('facultyApproval.approver', 'name')
      .populate('hodApproval.approver', 'name')
      .sort({ createdAt: -1 });

    // Construct CSV String
    const headers = [
      'Application ID',
      'Student Name',
      'Registration Number',
      'Department',
      'Year & Section',
      'Request Type',
      'Reason',
      'Start Date',
      'End Date',
      'Total Days',
      'Status',
      'Assigned Faculty',
      'Faculty Approval Status',
      'Faculty Remarks',
      'HOD Approval Status',
      'HOD Remarks',
      'Rejection Remarks',
      'Submitted Date'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const escaped = String(str).replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = applications.map((app) => [
      escapeCsv(app.applicationId),
      escapeCsv(app.studentName),
      escapeCsv(app.regNo),
      escapeCsv(app.department),
      escapeCsv(`${app.year} - ${app.section}`),
      escapeCsv(app.requestType),
      escapeCsv(app.reason),
      escapeCsv(app.startDate ? app.startDate.toISOString().split('T')[0] : ''),
      escapeCsv(app.endDate ? app.endDate.toISOString().split('T')[0] : ''),
      escapeCsv(app.totalDays),
      escapeCsv(app.status),
      escapeCsv(app.assignedFaculty ? app.assignedFaculty.name : 'N/A'),
      escapeCsv(app.facultyApproval?.status || 'PENDING'),
      escapeCsv(app.facultyApproval?.remarks || ''),
      escapeCsv(app.hodApproval?.status || 'PENDING'),
      escapeCsv(app.hodApproval?.remarks || ''),
      escapeCsv(app.rejectionRemarks || ''),
      escapeCsv(app.createdAt ? app.createdAt.toISOString() : '')
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=applications_export_${Date.now()}.csv`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
