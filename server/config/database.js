const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log environment variables for debugging
    console.log('Environment variables:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Use the MONGODB_URI from environment variables first
    // This should be set in docker-compose.yml or .env file
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management';
    
    console.log(`Attempting to connect to: ${mongoUri}`);

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout for Docker environments
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: true,
      // Add authentication options
      authSource: 'admin'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Log connection details
    console.log('Database Name:', conn.connection.name);
    console.log('Database Host:', conn.connection.host);
    console.log('Database Port:', conn.connection.port);
    
    // Test the connection with a simple query
    const testConnection = async () => {
      try {
        await mongoose.connection.db.admin().ping();
        console.log('✅ Database ping successful');
      } catch (err) {
        console.log('❌ Database ping failed:', err.message);
      }
    };
    
    testConnection();
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Additional Docker-specific troubleshooting
    console.log('\n📋 Docker Troubleshooting Steps:');
    console.log('1. Check if MongoDB container is running:');
    console.log('   docker-compose ps');
    console.log('2. Check MongoDB container logs:');
    console.log('   docker-compose logs mongodb');
    console.log('3. Verify network connectivity between containers:');
    console.log('   docker-compose exec app ping mongodb');
    console.log('4. Check if MongoDB is listening on the correct port:');
    console.log('   docker-compose exec mongodb netstat -tlnp');
    
    throw error;
  }
};

module.exports = connectDB;