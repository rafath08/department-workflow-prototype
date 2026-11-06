const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// @route   GET /api/announcements
// @desc    Get all active announcements for user's department or institution-wide
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { department, priority } = req.query;
    const query = { isActive: true };

    if (department && department !== 'ALL') {
      query.$or = [{ department: 'All Departments' }, { department }];
    } else if (req.user.department && req.user.role !== 'admin') {
      query.$or = [{ department: 'All Departments' }, { department: req.user.department }];
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 }).limit(30);

    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/announcements
// @desc    Create a new announcement (Faculty, HOD, Admin)
// @access  Private
router.post('/', protect, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { title, content, department, priority, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      department: department || req.user.department || 'All Departments',
      priority: priority || 'Normal',
      category: category || 'General',
      author: req.user._id,
      authorName: req.user.name
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement (Admin, HOD)
// @access  Private
router.delete('/:id', protect, authorizeRoles('hod', 'admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
