// MongoDB initialization script
// This script will be executed when the MongoDB container starts for the first time

db = db.getSiblingDB('employee_management');

// Create collections
db.createCollection('employees');
db.createCollection('attendance');

// Create indexes for better performance
db.employees.createIndex({ "email": 1 }, { unique: true });
db.employees.createIndex({ "role": 1 });
db.employees.createIndex({ "department": 1 });
db.attendance.createIndex({ "employeeId": 1 });
db.attendance.createIndex({ "date": 1 });
db.attendance.createIndex({ "employeeId": 1, "date": 1 }, { unique: true });

// Insert default admin user (password will be hashed by the application)
db.employees.insertOne({
  name: "System Administrator",
  email: "admin@company.com",
  password: "$2b$10$K2w1kGgUYKGDjjHZmYqJieB2pGgE8n4sXc6KjLUm7jEjgDz8.T8T6", // hashed "admin123"
  role: "admin",
  position: "System Administrator",
  department: "IT",
  salary: 100000,
  phone: "+1234567890",
  address: "123 Admin Street, City, State",
  dateOfJoining: new Date(),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB initialization completed successfully!');