const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_campus';

  // Attempt 1: Try connecting to configured MongoDB (local or Atlas)
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // fast fail if local mongod is not running
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] Could not connect to MongoDB at ${uri} (${err.message}).`);
    console.log('[Database] Initializing embedded in-memory MongoDB server for seamless zero-config operation...');
  }

  // Attempt 2: Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'smart_campus_dev',
      },
    });
    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to In-Memory MongoDB at ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error('[Database] Failed to start MongoMemoryServer:', memErr.message);
    throw memErr;
  }
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
