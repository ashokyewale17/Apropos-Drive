const mongoose = require('mongoose');
const Employee = require('./models/Employee');

// Use the same connection string as in docker-compose.yml
const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/employee_management?authSource=admin';

const testDatabaseOperations = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Count existing employees
    const count = await Employee.countDocuments();
    console.log(`Found ${count} existing employees`);
    
    // Test 2: Create a test employee
    console.log('Creating test employee...');
    const testEmployee = new Employee({
      employeeId: 'TEST001',
      name: 'Database Test Employee',
      email: 'dbtest@example.com',
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
    
    // Test 3: Verify employee was saved
    const savedEmployee = await Employee.findOne({ email: 'dbtest@example.com' });
    console.log('✅ Employee found in database:', {
      id: savedEmployee._id,
      name: savedEmployee.name,
      email: savedEmployee.email
    });
    
    // Test 4: List all employees
    const allEmployees = await Employee.find({}, 'name email employeeId');
    console.log('All employees in database:');
    allEmployees.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.email}) [${emp.employeeId || 'No ID'}]`);
    });
    
    // Clean up test employee
    await Employee.deleteOne({ email: 'dbtest@example.com' });
    console.log('✅ Test employee cleaned up');
    
    mongoose.connection.close();
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error stack:', error.stack);
    
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
};

testDatabaseOperations();