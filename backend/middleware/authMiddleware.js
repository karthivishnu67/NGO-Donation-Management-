import jwt from 'jsonwebtoken';
import { memoryDB } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'college_project_23_ngo_donation_jwt_secret_key_2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Middleware 1: Verify JWT Token
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in with a valid JWT token.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const currentUser = memoryDB.users.find((u) => String(u._id) === String(decoded.id));
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    req.user = {
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      phone: currentUser.phone
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired JWT token.'
    });
  }
};

// Middleware 2: Role-Based Access Control (Admin, Campaign Manager, Donor)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'Guest'}) is not allowed to perform this action. Required: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
};
