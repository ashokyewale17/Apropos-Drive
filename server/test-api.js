const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const connectDB = require('./config/database');

const testAPI = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Testing employee creation...');
    
    // Create a test employee
    const testEmployee = new Employee({
      employeeId: 'TEST001',
      name: 'API Test Employee',
      email: 'api.test@company.com',
      password: 'password123',
      role: 'employee',
      position: 'Software Developer',
      department: 'Engineering',
      salary: 75000,
      phone: '+1234567890',
      address: '123 Test Street, Test City',
      dateOfJoining: new Date()
    });
    
    await testEmployee.save();
    console.log('✅ Test employee created successfully');
    
    // Verify it was saved by fetching it
    const fetchedEmployee = await Employee.findOne({ email: 'api.test@company.com' });
    console.log('✅ Employee found in database:', {
      id: fetchedEmployee._id,
      name: fetchedEmployee.name,
      email: fetchedEmployee.email,
      employeeId: fetchedEmployee.employeeId
    });
    
    // Clean up - delete the test employee
    await Employee.deleteOne({ email: 'api.test@company.com' });
    console.log('✅ Test employee cleaned up');
    
    mongoose.connection.close();
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Error in test:', error.message);
    mongoose.connection.close();
  }
};

testAPI();