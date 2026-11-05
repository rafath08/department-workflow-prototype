const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'workflow_secret_key_2026_xyz',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (Student / Faculty)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, regNo, department, year, section, mentorId, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      regNo: regNo || undefined,
      department: department || 'Computer Science & Engineering',
      year: year || 'III',
      section: section || 'A',
      mentor: mentorId && mentorId.trim() !== '' ? mentorId : null,
      phone: phone || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo,
        department: user.department,
        year: user.year,
        section: user.section
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('mentor', 'name email');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact Administrator.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo,
        department: user.department,
        year: user.year,
        section: user.section,
        mentor: user.mentor
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('mentor', 'name email department');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/mentors
// @desc    Get list of faculty members for dropdown
// @access  Public (accessible for registration and forms)
router.get('/mentors', async (req, res) => {
  try {
    const { department } = req.query;
    const query = { role: 'faculty', isActive: true };
    if (department) {
      query.department = department;
    }
    const faculty = await User.find(query).select('name email department');
    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
