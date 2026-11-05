import Receipt from '../models/Receipt.js';
import { memoryDB, validateWithMongoose } from '../config/db.js';

// GET /api/receipts (Search, Filter, Sort, Pagination)
export const getReceipts = (req, res) => {
  try {
    const {
      search = '',
      status = 'All',
      donationType = 'All',
      sortBy = 'issueDate',
      order = 'desc',
      page = 1,
      limit = 6
    } = req.query;

    let filtered = [...memoryDB.receipts];

    if (req.query.myOnly === 'true' && req.user) {
      filtered = filtered.filter(
        (r) => r.donorEmail.toLowerCase() === req.user.email.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.receiptNumber.toLowerCase().includes(q) ||
          r.donorName.toLowerCase().includes(q) ||
          r.campaignTitle.toLowerCase().includes(q) ||
          (r.donorPan && r.donorPan.toLowerCase().includes(q))
      );
    }

    if (status !== 'All') {
      filtered = filtered.filter((r) => r.status === status);
    }

    if (donationType !== 'All') {
      filtered = filtered.filter((r) => r.donationType === donationType);
    }

    filtered.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
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
      message: 'Failed to fetch receipts.'
    });
  }
};

// POST /api/receipts (Generate receipt for an existing donation or custom entry)
export const createReceipt = (req, res) => {
  try {
    const {
      donationId,
      taxExemptionSection,
      remarks,
      issueDate
    } = req.body;

    if (!donationId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a donation record to generate a receipt.'
      });
    }

    const donation = memoryDB.donations.find((d) => d._id === donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.'
      });
    }

    const existingReceipt = memoryDB.receipts.find(
      (r) => r.donationId === donation._id && r.status === 'Valid'
    );
    if (existingReceipt) {
      return res.status(400).json({
        success: false,
        message: `Receipt (${existingReceipt.receiptNumber}) already exists for this donation.`
      });
    }

    const donor = memoryDB.donors.find((d) => d._id === donation.donorId);

    const receiptPayload = {
      receiptNumber: `RCP-80G-2026-${String(memoryDB.receipts.length + 1).padStart(3, '0')}`,
      donationId: donation._id,
      donationCode: donation.donationCode,
      donorId: donation.donorId,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorPan: donor?.panNumber || 'NOT PROVIDED',
      campaignId: donation.campaignId,
      campaignTitle: donation.campaignTitle,
      amount: donation.amount,
      donationType: donation.donationType,
      paymentMode: donation.paymentMode,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      taxExemptionSection: taxExemptionSection || '80G (50% Tax Deductible)',
      issuedBy: req.user?.name || 'HopeBridge NGO Finance Desk',
      status: 'Valid',
      remarks: remarks || 'Official 80G Tax Exemption Receipt.'
    };

    validateWithMongoose(Receipt, receiptPayload);

    const newReceipt = {
      _id: `rcp_${Date.now()}`,
      ...receiptPayload,
      createdAt: new Date().toISOString()
    };

    donation.receiptGenerated = true;
    memoryDB.receipts.unshift(newReceipt);

    return res.status(201).json({
      success: true,
      message: `Receipt ${newReceipt.receiptNumber} generated successfully.`,
      data: newReceipt
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to generate receipt.'
    });
  }
};

// PUT /api/receipts/:id
export const updateReceipt = (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, taxExemptionSection, donorPan } = req.body;

    const index = memoryDB.receipts.findIndex((r) => r._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found.'
      });
    }

    const updated = {
      ...memoryDB.receipts[index],
      status: status || memoryDB.receipts[index].status,
      remarks: remarks ?? memoryDB.receipts[index].remarks,
      taxExemptionSection: taxExemptionSection || memoryDB.receipts[index].taxExemptionSection,
      donorPan: donorPan ? donorPan.toUpperCase() : memoryDB.receipts[index].donorPan
    };

    validateWithMongoose(Receipt, updated);
    memoryDB.receipts[index] = updated;

    return res.json({
      success: true,
      message: 'Receipt updated successfully.',
      data: updated
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update receipt.'
    });
  }
};

// DELETE /api/receipts/:id
export const deleteReceipt = (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryDB.receipts.findIndex((r) => r._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found.'
      });
    }

    const removed = memoryDB.receipts[index];
    const linkedDonation = memoryDB.donations.find((d) => d._id === removed.donationId);
    if (linkedDonation) {
      linkedDonation.receiptGenerated = false;
    }

    memoryDB.receipts.splice(index, 1);

    return res.json({
      success: true,
      message: 'Receipt deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete receipt.'
    });
  }
};
