const mongoose = require('mongoose');

// Use the same connection string as in docker-compose.yml
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/employee_management?authSource=admin';

console.log('Testing database connection with URI:', MONGODB_URI);

const connectAndTest = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Get the collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Try to access employees collection
    const employees = await mongoose.connection.db.collection('employees').countDocuments();
    console.log(`Found ${employees} employees in database`);
    
    // List all employees
    const employeeList = await mongoose.connection.db.collection('employees').find({}).toArray();
    console.log('Employee list:');
    employeeList.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.email})`);
    });
    
    mongoose.connection.close();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error stack:', error.stack);
    
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
};

connectAndTest();