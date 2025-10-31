const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await Employee.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// Middleware to check if user is admin or accessing their own data
const requireAdminOrSelf = (req, res, next) => {
  const requestedUserId = req.params.id;
  const currentUserId = req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (isAdmin || requestedUserId === currentUserId) {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. You can only access your own data.' 
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrSelf
};
