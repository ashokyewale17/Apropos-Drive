const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const { Server } = require('socket.io');
const http = require('http');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      process.env.CLIENT_URL || 'http://localhost:3000'
    ],
    credentials: true
  }
});

// Store active connections
const activeConnections = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // When a user joins, store their employee ID
  socket.on('join', (employeeId) => {
    activeConnections.set(socket.id, employeeId);
    console.log(`Employee ${employeeId} joined with socket ${socket.id}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const employeeId = activeConnections.get(socket.id);
    if (employeeId) {
      activeConnections.delete(socket.id);
      console.log(`Employee ${employeeId} disconnected`);
    } else {
      console.log('User disconnected:', socket.id);
    }
  });
});

// Make io available to other modules
app.set('io', io);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL || 'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/employee", require("./routes/employeeRoutes"));
app.use("/api/attendance-edit", require("./routes/attendanceEditRoutes"));
app.use("/api/attendance-records", require("./routes/attendanceRoutes")); // Add this line

// Enhanced Health check endpoint with more details
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Employee Management API is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0',
    socketConnections: activeConnections.size
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Create default admin user if it doesn't exist
const createDefaultAdmin = async () => {
  try {
    // Check if we're connected to the database
    if (require('mongoose').connection.readyState !== 1) {
      console.log('Skipping default admin creation - database not connected');
      return;
    }
    
    const Employee = require('./models/Employee');
    const adminExists = await Employee.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const defaultAdmin = new Employee({
        name: 'System Administrator',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
        position: 'System Administrator',
        department: 'IT',
        salary: 100000,
        phone: '+1234567890',
        address: '123 Admin Street, City, State'
      });
      
      await defaultAdmin.save();
      console.log('Default admin user created:');
      console.log('Email: admin@company.com');
      console.log('Password: admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Create default admin after server starts
  setTimeout(createDefaultAdmin, 2000);
});

// Export io for use in other modules
module.exports = { app, io };