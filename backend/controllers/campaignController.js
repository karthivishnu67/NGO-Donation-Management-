import Campaign from '../models/Campaign.js';
import { memoryDB, validateWithMongoose } from '../config/db.js';

// GET /api/campaigns (Search, Filter, Sort, Pagination)
export const getCampaigns = (req, res) => {
  try {
    const {
      search = '',
      category = 'All',
      status = 'All',
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 6
    } = req.query;

    let filtered = [...memoryDB.campaigns];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (category !== 'All') {
      filtered = filtered.filter((c) => c.category === category);
    }

    if (status !== 'All') {
      filtered = filtered.filter((c) => c.status === status);
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
      allCampaigns: memoryDB.campaigns,
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
      message: 'Failed to fetch campaigns.'
    });
  }
};

// POST /api/campaigns
export const createCampaign = (req, res) => {
  try {
    const {
      title,
      category,
      description,
      goalAmount,
      startDate,
      endDate,
      status,
      location,
      beneficiaryCount
    } = req.body;

    if (!title || !category || !description || !goalAmount || !startDate || !endDate || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, description, goal amount, dates, and location are required.'
      });
    }

    const payload = {
      title: title.trim(),
      category,
      description: description.trim(),
      goalAmount: Number(goalAmount),
      raisedAmount: 0,
      startDate,
      endDate,
      status: status || 'Active',
      location: location.trim(),
      beneficiaryCount: Number(beneficiaryCount) || 100,
      createdBy: req.user?.name || 'Campaign Manager'
    };

    validateWithMongoose(Campaign, payload);

    const newCampaign = {
      _id: `cmp_${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    memoryDB.campaigns.unshift(newCampaign);

    return res.status(201).json({
      success: true,
      message: 'Fundraising campaign created successfully.',
      data: newCampaign
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create campaign.'
    });
  }
};

// PUT /api/campaigns/:id
export const updateCampaign = (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      goalAmount,
      startDate,
      endDate,
      status,
      location,
      beneficiaryCount
    } = req.body;

    const index = memoryDB.campaigns.findIndex((c) => c._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.'
      });
    }

    if (!title || !category || !description || !goalAmount || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, description, goal amount, and location are required.'
      });
    }

    const updated = {
      ...memoryDB.campaigns[index],
      title: title.trim(),
      category,
      description: description.trim(),
      goalAmount: Number(goalAmount),
      startDate: startDate || memoryDB.campaigns[index].startDate,
      endDate: endDate || memoryDB.campaigns[index].endDate,
      status: status || memoryDB.campaigns[index].status,
      location: location.trim(),
      beneficiaryCount: Number(beneficiaryCount) || memoryDB.campaigns[index].beneficiaryCount
    };

    validateWithMongoose(Campaign, updated);
    memoryDB.campaigns[index] = updated;

    return res.json({
      success: true,
      message: 'Campaign updated successfully.',
      data: updated
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update campaign.'
    });
  }
};

// DELETE /api/campaigns/:id
export const deleteCampaign = (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryDB.campaigns.findIndex((c) => c._id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found.'
      });
    }

    memoryDB.campaigns.splice(index, 1);
    return res.json({
      success: true,
      message: 'Campaign deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete campaign.'
    });
  }
};
