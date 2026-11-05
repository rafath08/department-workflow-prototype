const path = require('path');
const fs = require('fs');
const express = require('express');
const app = require('./app');
const connectDB = require('./config/db');
const { initReminderCron } = require('./services/reminderCron');
const User = require('./models/User');

// Serve Frontend build in local production mode if available
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  console.log(`Serving pre-built frontend from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/uploads') || req.url.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Start Server and initialize database connection
const startServer = async () => {
  await connectDB();

  // Check if database needs automated seeding
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Automatically seeding demo institutional data...');
      const seedData = require('./seed');
      await seedData();
    }
  } catch (err) {
    console.warn('Seeding check error:', err.message);
  }

  // Initialize background cron scheduler
  initReminderCron();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`Intelligent Department Workflow Automation Agent API`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Full Application URL: http://localhost:${PORT}`);
    console.log(`API Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
};

startServer();
