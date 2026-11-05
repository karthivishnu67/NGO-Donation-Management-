import express from 'express';
import {
  getDonors,
  createDonor,
  updateDonor,
  deleteDonor
} from '../controllers/donorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All authenticated roles can view donors; Admin & Campaign Manager can register/edit; Admin can delete
router.get('/', protect, getDonors);
router.post('/', protect, authorizeRoles('Admin', 'Campaign Manager', 'Donor'), createDonor);
router.put('/:id', protect, authorizeRoles('Admin', 'Campaign Manager'), updateDonor);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteDonor);

export default router;
