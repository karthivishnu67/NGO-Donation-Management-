import Donor from '../models/Donor.js';
import { memoryDB, validateWithMongoose } from '../config/db.js';

// GET /api/donors (Search, Filter, Sort, Pagination)
export const getDonors = (req, res) => {
  try {
    const {
      search = '',
      donorType = 'All',
      city = 'All',
      sortBy = 'totalDonated',
      order = 'desc',
      page = 1,
      limit = 6
    } = req.query;

    let filtered = [...memoryDB.donors];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.donorCode.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          (d.panNumber && d.panNumber.toLowerCase().includes(q))
      );
    }

    if (donorType !== 'All') {
      filtered = filtered.filter((d) => d.donorType === donorType);
    }

    if (city !== 'All') {
      filtered = filtered.filter((d) => d.city.toLowerCase() === city.toLowerCase());
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
      allDonors: memoryDB.donors,
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
      message: 'Failed to fetch donors.'
    });
  }
};

// POST /api/donors
export const createDonor = (req, res) => {
  try {
    const { name, email, phone, panNumber, donorType, address, city } = req.body;

    if (!name || !email || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and city are required fields.'
      });
    }

    const donorCode = `DNR-2026-${String(memoryDB.donors.length + 1).padStart(3, '0')}`;

    const payload = {
      donorCode,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      panNumber: panNumber ? panNumber.trim().toUpperCase() : '',
      donorType: donorType || 'Individual',
      address: address ? address.trim() : '',
      city: city.trim(),
      totalDonated: 0,
      donationsCount: 0,
      userId: null
    };

    validateWithMongoose(Donor, payload);

    const newDonor = {
      _id: `dnr_${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    memoryDB.donors.unshift(newDonor);

    return res.status(201).json({
      success: true,
      message: 'Donor registered successfully.',
      data: newDonor
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to register donor.'
    });
  }
};

// PUT /api/donors/:id
export const updateDonor = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, panNumber, donorType, address, city } = req.body;

    const index = memoryDB.donors.findIndex((d) => d._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Donor record not found.'
      });
    }

    if (!name || !email || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and city are required.'
      });
    }

    const updated = {
      ...memoryDB.donors[index],
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      panNumber: panNumber ? panNumber.trim().toUpperCase() : '',
      donorType: donorType || memoryDB.donors[index].donorType,
      address: address ?? memoryDB.donors[index].address,
      city: city.trim()
    };

    validateWithMongoose(Donor, updated);
    memoryDB.donors[index] = updated;

    return res.json({
      success: true,
      message: 'Donor updated successfully.',
      data: updated
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update donor.'
    });
  }
};

// DELETE /api/donors/:id
export const deleteDonor = (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryDB.donors.findIndex((d) => d._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found.'
      });
    }

    memoryDB.donors.splice(index, 1);
    return res.json({
      success: true,
      message: 'Donor deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete donor.'
    });
  }
};
