import Donation from '../models/Donation.js';
import Receipt from '../models/Receipt.js';
import { memoryDB, validateWithMongoose } from '../config/db.js';

// Helper to recalculate campaign raised amounts and donor totals accurately
export const syncTotals = () => {
  // Recalculate each campaign's raisedAmount from Completed donations
  memoryDB.campaigns.forEach((camp) => {
    const campDonations = memoryDB.donations.filter(
      (d) => d.campaignId === camp._id && d.status === 'Completed'
    );
    camp.raisedAmount = campDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  });

  // Recalculate each donor's totalDonated and donationsCount
  memoryDB.donors.forEach((donor) => {
    const donorDonations = memoryDB.donations.filter(
      (d) =>
        (d.donorId === donor._id || d.donorEmail.toLowerCase() === donor.email.toLowerCase()) &&
        d.status === 'Completed'
    );
    donor.totalDonated = donorDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    donor.donationsCount = donorDonations.length;
  });
};

// GET /api/donations (Search, Filter, Sort, Pagination)
export const getDonations = (req, res) => {
  try {
    const {
      search = '',
      donationType = 'All',
      campaignId = 'All',
      status = 'All',
      sortBy = 'donationDate',
      order = 'desc',
      page = 1,
      limit = 6
    } = req.query;

    let filtered = [...memoryDB.donations];

    // If user is a Donor role, allow filtering to their own donations when myOnly=true
    if (req.query.myOnly === 'true' && req.user) {
      filtered = filtered.filter(
        (d) => d.donorEmail.toLowerCase() === req.user.email.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.donationCode.toLowerCase().includes(q) ||
          d.donorName.toLowerCase().includes(q) ||
          d.campaignTitle.toLowerCase().includes(q) ||
          (d.referenceNumber && d.referenceNumber.toLowerCase().includes(q))
      );
    }

    if (donationType !== 'All') {
      filtered = filtered.filter((d) => d.donationType === donationType);
    }

    if (campaignId !== 'All') {
      filtered = filtered.filter((d) => d.campaignId === campaignId);
    }

    if (status !== 'All') {
      filtered = filtered.filter((d) => d.status === status);
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
      allDonations: memoryDB.donations,
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
      message: 'Failed to fetch donations.'
    });
  }
};

// POST /api/donations
export const createDonation = (req, res) => {
  try {
    let {
      donorId,
      donorName,
      donorEmail,
      campaignId,
      cause,
      amount,
      donationType,
      paymentMode,
      referenceNumber,
      donationDate,
      status,
      notes,
      autoGenerateReceipt = true
    } = req.body;

    // Basic Backend Validation: ensure amount is a positive number
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Donation amount must be a positive number greater than 0.'
      });
    }

    // Resolve or find Donor (supports direct donorName from donation form or donorId)
    let donor = null;
    if (donorId) {
      donor = memoryDB.donors.find((d) => d._id === donorId);
    }
    if (!donor && donorName && donorName.trim()) {
      donor = memoryDB.donors.find(
        (d) => d.name.toLowerCase() === donorName.trim().toLowerCase()
      );
      if (!donor) {
        // Register this donor automatically so they appear in donor records
        const newCode = `DNR-2026-${String(memoryDB.donors.length + 1).padStart(3, '0')}`;
        donor = {
          _id: `dnr_${Date.now()}`,
          donorCode: newCode,
          name: donorName.trim(),
          email: donorEmail || `${donorName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'donor'}@example.com`,
          phone: '+91 98400 00000',
          panNumber: '',
          donorType: 'Individual',
          address: 'Donation Form Direct',
          city: 'Chennai',
          totalDonated: 0,
          donationsCount: 0,
          userId: req.user?._id || null,
          createdAt: new Date().toISOString()
        };
        memoryDB.donors.unshift(donor);
      }
    }

    if (!donor) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid donor name.'
      });
    }

    // Resolve or find Campaign / Cause (supports direct cause name or campaignId)
    let campaign = null;
    const targetCause = cause || campaignId;
    if (campaignId) {
      campaign = memoryDB.campaigns.find((c) => c._id === campaignId);
    }
    if (!campaign && targetCause) {
      campaign = memoryDB.campaigns.find(
        (c) =>
          c._id === targetCause ||
          c.title.toLowerCase().includes(targetCause.toLowerCase()) ||
          c.category.toLowerCase().includes(targetCause.toLowerCase())
      );
    }
    if (!campaign && memoryDB.campaigns.length > 0) {
      campaign = memoryDB.campaigns[0];
    }

    if (!campaign) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid cause for this donation.'
      });
    }

    donationType = donationType || 'Online';
    paymentMode = paymentMode || 'Online - UPI';
    donationDate = donationDate || new Date().toISOString().split('T')[0];

    const donationCode = `DON-2026-${1000 + memoryDB.donations.length + 1}`;
    const finalStatus = status || 'Completed';
    const shouldCreateReceipt = Boolean(autoGenerateReceipt) && finalStatus === 'Completed';

    const payload = {
      donationCode,
      donorId: donor._id,
      donorName: donor.name,
      donorEmail: donor.email,
      campaignId: campaign._id,
      campaignTitle: campaign.title,
      amount: numericAmount,
      donationType,
      paymentMode,
      referenceNumber:
        referenceNumber && referenceNumber.trim()
          ? referenceNumber.trim()
          : `REF-${Date.now().toString().slice(-6)}`,
      donationDate,
      status: finalStatus,
      notes: notes ? notes.trim() : (cause ? `Cause: ${cause}` : ''),
      recordedBy: req.user?.name || donor.name,
      receiptGenerated: shouldCreateReceipt
    };

    validateWithMongoose(Donation, payload);

    const newDonation = {
      _id: `don_${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    memoryDB.donations.unshift(newDonation);

    let generatedReceipt = null;
    if (shouldCreateReceipt) {
      const receiptPayload = {
        receiptNumber: `RCP-80G-2026-${String(memoryDB.receipts.length + 1).padStart(3, '0')}`,
        donationId: newDonation._id,
        donationCode: newDonation.donationCode,
        donorId: donor._id,
        donorName: donor.name,
        donorEmail: donor.email,
        donorPan: donor.panNumber || 'NOT PROVIDED',
        campaignId: campaign._id,
        campaignTitle: campaign.title,
        amount: newDonation.amount,
        donationType: newDonation.donationType,
        paymentMode: newDonation.paymentMode,
        issueDate: newDonation.donationDate,
        taxExemptionSection: '80G (50% Tax Deductible)',
        issuedBy: req.user?.name || 'HopeBridge NGO Finance Desk',
        status: 'Valid',
        remarks: notes || 'Official 80G Tax Exemption Donation Receipt.'
      };

      validateWithMongoose(Receipt, receiptPayload);
      generatedReceipt = {
        _id: `rcp_${Date.now()}`,
        ...receiptPayload,
        createdAt: new Date().toISOString()
      };
      memoryDB.receipts.unshift(generatedReceipt);
    }

    syncTotals();

    return res.status(201).json({
      success: true,
      message: shouldCreateReceipt
        ? 'Donation recorded and 80G tax receipt generated automatically!'
        : 'Donation recorded successfully.',
      data: newDonation,
      receipt: generatedReceipt
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to record donation.'
    });
  }
};

// PUT /api/donations/:id
export const updateDonation = (req, res) => {
  try {
    const { id } = req.params;
    const {
      donorId,
      campaignId,
      amount,
      donationType,
      paymentMode,
      referenceNumber,
      donationDate,
      status,
      notes
    } = req.body;

    const index = memoryDB.donations.findIndex((d) => d._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found.'
      });
    }

    const donor = memoryDB.donors.find((d) => d._id === (donorId || memoryDB.donations[index].donorId));
    const campaign = memoryDB.campaigns.find(
      (c) => c._id === (campaignId || memoryDB.donations[index].campaignId)
    );

    const updated = {
      ...memoryDB.donations[index],
      donorId: donor ? donor._id : memoryDB.donations[index].donorId,
      donorName: donor ? donor.name : memoryDB.donations[index].donorName,
      donorEmail: donor ? donor.email : memoryDB.donations[index].donorEmail,
      campaignId: campaign ? campaign._id : memoryDB.donations[index].campaignId,
      campaignTitle: campaign ? campaign.title : memoryDB.donations[index].campaignTitle,
      amount: Number(amount || memoryDB.donations[index].amount),
      donationType: donationType || memoryDB.donations[index].donationType,
      paymentMode: paymentMode || memoryDB.donations[index].paymentMode,
      referenceNumber: referenceNumber ?? memoryDB.donations[index].referenceNumber,
      donationDate: donationDate || memoryDB.donations[index].donationDate,
      status: status || memoryDB.donations[index].status,
      notes: notes ?? memoryDB.donations[index].notes
    };

    validateWithMongoose(Donation, updated);
    memoryDB.donations[index] = updated;
    syncTotals();

    return res.json({
      success: true,
      message: 'Donation updated successfully.',
      data: updated
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update donation.'
    });
  }
};

// DELETE /api/donations/:id
export const deleteDonation = (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryDB.donations.findIndex((d) => d._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found.'
      });
    }

    memoryDB.donations.splice(index, 1);
    syncTotals();

    return res.json({
      success: true,
      message: 'Donation deleted and campaign progress updated.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete donation.'
    });
  }
};
