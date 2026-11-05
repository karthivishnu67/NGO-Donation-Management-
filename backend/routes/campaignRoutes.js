import express from 'express';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Authenticated read; Admin & Campaign Manager can create/update; Admin can delete
router.get('/', getCampaigns);
router.post('/', protect, authorizeRoles('Admin', 'Campaign Manager'), createCampaign);
router.put('/:id', protect, authorizeRoles('Admin', 'Campaign Manager'), updateCampaign);
router.delete('/:id', protect, authorizeRoles('Admin', 'Campaign Manager'), deleteCampaign);

export default router;
