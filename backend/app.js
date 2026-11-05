const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const uploadPath = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadPath));
app.use('/api/uploads', express.static(uploadPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Intelligent Department Workflow Automation Agent',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Intelligent Department Workflow Automation Agent',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'local-node',
    timestamp: new Date().toISOString()
  });
});

// Create and mount routes (both on /api/* and root for maximum proxy compatibility)
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

// /api mounts
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Direct mounts fallback for Vercel serverless functions
app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
