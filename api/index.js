const app = require('../backend/app');
const connectDB = require('../backend/config/db');
const User = require('../backend/models/User');

let isDbInitialized = false;

// Middleware to ensure database connection before processing any serverless request
app.use(async (req, res, next) => {
  try {
    await connectDB();

    // Auto-seed demo data once on first request if database is completely empty
    if (!isDbInitialized) {
      isDbInitialized = true;
      try {
        const count = await User.countDocuments();
        if (count === 0) {
          console.log('[Vercel Serverless] Database empty. Seeding initial institutional data...');
          const seedData = require('../backend/seed');
          await seedData();
        }
      } catch (seedErr) {
        console.warn('[Vercel Serverless] Auto-seed check notice:', seedErr.message);
      }
    }

    next();
  } catch (error) {
    console.error('[Vercel Serverless] Database connection failure:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGO_URI is set in Vercel environment variables.',
      error: error.message
    });
  }
});

module.exports = app;
