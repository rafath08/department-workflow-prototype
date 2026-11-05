const mongoose = require('mongoose');

// Ensure Windows finds msvcp140.dll and vcruntime140.dll for mongodb binary locally
if (process.platform === 'win32') {
  const extraPath = 'C:\\Users\\altha\\AppData\\Local\\Microsoft\\TeamsMeetingAdd-in\\1.25.28902\\x64';
  if (process.env.PATH && !process.env.PATH.includes(extraPath)) {
    process.env.PATH = `${extraPath};${process.env.PATH}`;
  }
}

// Global cached connection for serverless environments (Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let mongod = null;

const connectDB = async () => {
  // If already connected in a serverless warm instance, reuse connection
  if (cached.conn) {
    return cached.conn;
  }

  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri) {
      if (!cached.promise) {
        console.log(`Connecting to MongoDB URI...`);
        cached.promise = mongoose.connect(mongoUri, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 5000
        }).then((m) => {
          console.log(`MongoDB Connected: ${m.connection.host}`);
          return m;
        });
      }
      cached.conn = await cached.promise;
      return cached.conn;
    }

    // Try default local MongoDB first
    try {
      console.log('Attempting to connect to local MongoDB (mongodb://127.0.0.1:27017/workflow_automation)...');
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/workflow_automation', {
        serverSelectionTimeoutMS: 2000
      });
      console.log(`Local MongoDB Connected: ${conn.connection.host}`);
      cached.conn = conn;
      return conn;
    } catch (localErr) {
      console.log('Local MongoDB not available. Starting embedded MongoMemoryServer for instant zero-config prototype...');
    }

    // Fallback to MongoMemoryServer (local non-serverless only)
    if (!process.env.VERCEL) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`MongoMemoryServer started at: ${uri}`);
      const conn = await mongoose.connect(uri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      cached.conn = conn;
      return conn;
    } else {
      throw new Error('Please configure the MONGO_URI environment variable in your Vercel Project Settings.');
    }

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
