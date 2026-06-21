import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecowise';

// Establish connection to Database
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[server.ts] Connected to MongoDB database successfully.');
    app.listen(PORT, () => {
      console.log(`[server.ts] EcoWise Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  })
  .catch(err => {
    console.error('[server.ts] Database connection failed:', err);
    process.exit(1);
  });

// Graceful shutdowns
process.on('SIGTERM', async () => {
  console.log('[server.ts] SIGTERM signal received. Closing database connections and stopping service.');
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[server.ts] Mongoose connection close failed:', error);
    process.exit(1);
  }
});
