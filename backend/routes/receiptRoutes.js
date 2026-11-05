import express from 'express';
import {
  getReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt
} from '../controllers/receiptController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getReceipts);
router.post('/', protect, authorizeRoles('Admin', 'Campaign Manager', 'Donor'), createReceipt);
router.put('/:id', protect, authorizeRoles('Admin', 'Campaign Manager'), updateReceipt);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteReceipt);

export default router;
