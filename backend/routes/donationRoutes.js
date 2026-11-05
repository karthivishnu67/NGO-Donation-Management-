import express from 'express';
import {
  getDonations,
  createDonation,
  updateDonation,
  deleteDonation
} from '../controllers/donationController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All authenticated users can view and record donations; Admin & Campaign Manager can update/delete
router.get('/', protect, getDonations);
router.post('/', protect, authorizeRoles('Admin', 'Campaign Manager', 'Donor'), createDonation);
router.put('/:id', protect, authorizeRoles('Admin', 'Campaign Manager'), updateDonation);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteDonation);

export default router;
