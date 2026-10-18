require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const User = require('./models/User');
const { seedAll } = require('./seed/seedData');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is freshly initialized or empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running automatic seed for instant testing...');
      await seedAll();
    }

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log('================================================================');
      console.log(` SMART CAMPUS & RESOURCE MANAGEMENT SYSTEM (SCRMS) API RUNNING `);
      console.log(` Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health: http://localhost:${PORT}/api/health`);
      console.log('================================================================');
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await closeDB();
        console.log('[Server] MongoDB connection closed. Process exited.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Fatal startup failure:', error.message);
    process.exit(1);
  }
};

startServer();
