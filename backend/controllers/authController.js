import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import { memoryDB, validateWithMongoose } from '../config/db.js';
import { generateToken } from '../middleware/authMiddleware.js';

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, city, panNumber } = req.body;

    // Express API validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existing = memoryDB.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || 'Donor',
      phone: phone || '+91 90000 00000',
      status: 'Active'
    };

    // Validate against Mongoose User schema
    validateWithMongoose(User, newUserPayload);

    const createdUser = {
      _id: `usr_${Date.now()}`,
      ...newUserPayload,
      createdAt: new Date().toISOString()
    };

    memoryDB.users.unshift(createdUser);

    // If role is Donor, also create a Donor profile automatically if not existing
    if (createdUser.role === 'Donor') {
      const existingDonor = memoryDB.donors.find(
        (d) => d.email.toLowerCase() === createdUser.email
      );
      if (!existingDonor) {
        const donorPayload = {
          donorCode: `DNR-2026-${String(memoryDB.donors.length + 1).padStart(3, '0')}`,
          name: createdUser.name,
          email: createdUser.email,
          phone: createdUser.phone || '+91 90000 00000',
          panNumber: panNumber ? panNumber.toUpperCase() : 'ABCDE0000F',
          donorType: 'Individual',
          address: 'Registered Online',
          city: city || 'Chennai',
          totalDonated: 0,
          donationsCount: 0,
          userId: createdUser._id
        };
        validateWithMongoose(Donor, donorPayload);
        memoryDB.donors.unshift({
          _id: `dnr_${Date.now()}`,
          ...donorPayload,
          createdAt: new Date().toISOString()
        });
      }
    }

    const token = generateToken(createdUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        phone: createdUser.phone,
        status: createdUser.status
      }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = memoryDB.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive. Contact Admin.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

// POST /api/auth/logout
export const logoutUser = (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// GET /api/auth/me
export const getMe = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};
