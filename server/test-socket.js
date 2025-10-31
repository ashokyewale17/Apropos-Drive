// Simple test script to verify socket.io functionality
const io = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Join as admin
  socket.emit('join', 'admin');
  
  // Listen for events
  socket.on('employeeCheckIn', (data) => {
    console.log('Employee checked in:', data);
  });
  
  socket.on('employeeCheckOut', (data) => {
    console.log('Employee checked out:', data);
  });
  
  // Simulate an employee check-in after 2 seconds
  setTimeout(() => {
    socket.emit('employeeCheckIn', {
      employeeId: 1,
      employeeName: 'John Doe',
      department: 'Engineering',
      checkInTime: new Date().toISOString(),
      location: 'Office'
    });
  }, 2000);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});