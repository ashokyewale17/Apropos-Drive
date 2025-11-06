const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log environment variables for debugging
    console.log('Environment variables:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Multiple connection string options
    const connectionStrings = [
      process.env.MONGODB_URI,
      'mongodb://127.0.0.1:27017/employee_management',
      'mongodb://localhost:27017/employee_management'
    ].filter(Boolean);
    
    console.log('Connection strings to try:', connectionStrings);

    let connected = false;
    let lastError;

    for (const uri of connectionStrings) {
      try {
        console.log(`Attempting to connect to: ${uri}`);
        const conn = await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
          socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
          maxPoolSize: 10, // Maintain up to 10 socket connections
          // Removed bufferMaxEntries as it's not supported in newer MongoDB versions
          bufferCommands: true, // Enable mongoose buffering to queue operations until connection is ready
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        connected = true;
        break;
      } catch (err) {
        lastError = err;
        console.log(`❌ Failed to connect to: ${uri}`);
        console.log('Error details:', err.message);
        continue;
      }
    }

    if (!connected) {
      throw lastError;
    }
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n📋 Troubleshooting Steps:');
    console.log('1. Check if MongoDB service is running:');
    console.log('   - Open Services (services.msc) and look for MongoDB service');
    console.log('   - Or run: net start MongoDB');
    console.log('2. Start MongoDB manually:');
    console.log('   - Open Command Prompt as Administrator');
    console.log('   - Run: mongod --dbpath "C:\\data\\db"');
    console.log('3. Use MongoDB Atlas (cloud):');
    console.log('   - Visit: https://www.mongodb.com/cloud/atlas');
    console.log('   - Update MONGODB_URI in .env file\n');
    
    throw error; // Re-throw the error so the server can handle it properly
  }
};

module.exports = connectDB;