const express = require('express');
const router = express.Router();
const DepartmentEvent = require('../models/DepartmentEvent');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// @route   GET /api/events
// @desc    Get departmental calendar events & academic deadlines
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { eventType, department } = req.query;
    const query = {};

    if (department && department !== 'ALL') {
      query.$or = [{ department: 'All Departments' }, { department }];
    } else if (req.user.department && req.user.role !== 'admin') {
      query.$or = [{ department: 'All Departments' }, { department: req.user.department }];
    }

    if (eventType && eventType !== 'ALL') {
      query.eventType = eventType;
    }

    const events = await DepartmentEvent.find(query).sort({ startDate: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/events
// @desc    Create a new calendar event (Faculty, HOD, Admin)
// @access  Private
router.post('/', protect, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { title, description, eventType, startDate, endDate, location, organizer, department } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, Start Date and End Date are mandatory'
      });
    }

    const event = await DepartmentEvent.create({
      title,
      description: description || '',
      eventType: eventType || 'Academic',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location: location || 'Campus',
      organizer: organizer || req.user.name,
      department: department || req.user.department || 'All Departments'
    });

    res.status(201).json({
      success: true,
      message: 'Event scheduled successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (HOD, Admin)
router.delete('/:id', protect, authorizeRoles('hod', 'admin'), async (req, res) => {
  try {
    await DepartmentEvent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event removed from calendar' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
