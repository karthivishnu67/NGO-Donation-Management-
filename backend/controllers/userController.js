import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { memoryDB, validateWithMongoose } from '../config/db.js';

// GET /api/users (Search, Filter, Sort, Pagination)
export const getUsers = (req, res) => {
  try {
    const {
      search = '',
      role = 'All',
      status = 'All',
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 6
    } = req.query;

    let filtered = memoryDB.users.map(({ password, ...rest }) => rest);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    if (role !== 'All') {
      filtered = filtered.filter((u) => u.role === role);
    }

    if (status !== 'All') {
      filtered = filtered.filter((u) => u.status === status);
    }

    filtered.sort((a, b) => {
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.'
    });
  }
};

// POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, status } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.'
      });
    }

    const exists = memoryDB.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already registered.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      phone: phone || '',
      status: status || 'Active'
    };

    validateWithMongoose(User, payload);

    const newUser = {
      _id: `usr_${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    memoryDB.users.unshift(newUser);
    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: safeUser
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create user.'
    });
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, status, password } = req.body;

    const index = memoryDB.users.findIndex((u) => u._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and role are required.'
      });
    }

    const updatedPassword =
      password && password.trim().length >= 6
        ? await bcrypt.hash(password, 10)
        : memoryDB.users[index].password;

    const updatedPayload = {
      ...memoryDB.users[index],
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      phone: phone ?? memoryDB.users[index].phone,
      status: status || memoryDB.users[index].status,
      password: updatedPassword
    };

    validateWithMongoose(User, updatedPayload);
    memoryDB.users[index] = updatedPayload;

    const { password: _, ...safeUser } = updatedPayload;
    return res.json({
      success: true,
      message: 'User updated successfully.',
      data: safeUser
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update user.'
    });
  }
};

// DELETE /api/users/:id
export const deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryDB.users.findIndex((u) => u._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    memoryDB.users.splice(index, 1);
    return res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.'
    });
  }
};
