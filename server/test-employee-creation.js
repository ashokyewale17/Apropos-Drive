const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const connectDB = require('./config/database');

const testEmployeeCreation = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Create a test employee
    const testEmployee = new Employee({
      employeeId: 'EMP001',
      name: 'Test Employee',
      email: 'test@example.com',
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
    console.log('✅ Test employee created successfully:', testEmployee.name);
    
    // Verify it was saved by fetching it
    const fetchedEmployee = await Employee.findOne({ email: 'test@example.com' });
    console.log('✅ Employee found in database:', fetchedEmployee.name);
    
    // Clean up - delete the test employee
    await Employee.deleteOne({ email: 'test@example.com' });
    console.log('✅ Test employee cleaned up');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error in test:', error.message);
    mongoose.connection.close();
  }
};

testEmployeeCreation();