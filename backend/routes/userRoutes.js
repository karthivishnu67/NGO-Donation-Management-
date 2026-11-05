import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only Admin can manage Users CRUD
router.get('/', protect, authorizeRoles('Admin'), getUsers);
router.post('/', protect, authorizeRoles('Admin'), createUser);
router.put('/:id', protect, authorizeRoles('Admin'), updateUser);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteUser);

export default router;
