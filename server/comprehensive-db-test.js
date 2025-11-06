const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// Use the same connection string as in docker-compose.yml
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/employee_management?authSource=admin';

console.log('=== Database Connection Test ===');
console.log('Using connection string:', MONGODB_URI);

const runTests = async () => {
  try {
    console.log('\n1. Testing database connection...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      authSource: 'admin'
    });
    
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    console.log('\n2. Testing database operations...');
    
    // Test ping
    await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Test collection access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Collections accessible:', collections.map(c => c.name));
    
    // Test employee operations
    console.log('\n3. Testing employee operations...');
    
    // Count existing employees
    const count = await Employee.countDocuments();
    console.log(`Found ${count} existing employees`);
    
    // Create test employee
    console.log('\n4. Creating test employee...');
    const testEmployee = new Employee({
      employeeId: 'DBTEST001',
      name: 'Database Connection Test',
      email: 'dbtest@company.com',
      password: 'password123',
      role: 'employee',
      position: 'Test Engineer',
      department: 'Testing',
      salary: 50000,
      phone: '+1234567890',
      address: '123 Test Street, Test City'
    });
    
    await testEmployee.save();
    console.log('✅ Test employee created successfully');
    
    // Verify employee was saved
    const savedEmployee = await Employee.findOne({ email: 'dbtest@company.com' });
    console.log('✅ Employee found in database:', {
      id: savedEmployee._id,
      name: savedEmployee.name,
      email: savedEmployee.email,
      employeeId: savedEmployee.employeeId
    });
    
    // List all employees
    const allEmployees = await Employee.find({}, 'name email employeeId');
    console.log('\n5. All employees in database:');
    allEmployees.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.email}) [${emp.employeeId || 'No ID'}]`);
    });
    
    // Clean up
    await Employee.deleteOne({ email: 'dbtest@company.com' });
    console.log('\n6. ✅ Test employee cleaned up');
    
    mongoose.connection.close();
    console.log('\n=== All tests passed successfully ===');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    console.error('Stack trace:', error.stack);
    
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
    
    process.exit(1);
  }
};

runTests();