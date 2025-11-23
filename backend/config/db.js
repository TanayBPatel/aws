const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri) {
      console.warn('⚠️  MONGODB_URI is not defined in environment variables');
      console.warn('⚠️  Server will start but database operations will fail');
      console.warn('⚠️  Please create a .env file with your MongoDB connection string');
      return; // Don't exit, allow server to start for testing
    }

    const uri = rawUri.trim();
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true; // Return true if connection successful
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Server will continue running but database operations will fail');
    console.error('⚠️  Please check your MONGODB_URI in .env file');
    // Don't exit in development - allow server to start for testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false; // Return false if connection failed
  }
};

module.exports = connectDB;

