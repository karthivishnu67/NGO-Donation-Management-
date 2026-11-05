import { memoryDB, isMongoConnected } from '../config/db.js';

// GET /api/reports/summary
export const getSummaryReport = (req, res) => {
  try {
    const completedDonations = memoryDB.donations.filter((d) => d.status === 'Completed');
    const totalFundsRaised = completedDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const totalGoalAmount = memoryDB.campaigns.reduce(
      (sum, c) => sum + Number(c.goalAmount || 0),
      0
    );

    const onlineDonations = completedDonations.filter((d) => d.donationType === 'Online');
    const offlineDonations = completedDonations.filter((d) => d.donationType === 'Offline');

    const onlineTotal = onlineDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const offlineTotal = offlineDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // Campaign progress report rows
    const campaignProgress = memoryDB.campaigns.map((c) => {
      const donationsForCamp = completedDonations.filter((d) => d.campaignId === c._id);
      const raised = donationsForCamp.reduce((sum, d) => sum + Number(d.amount || 0), 0);
      const progressPercent =
        c.goalAmount > 0 ? Math.min(100, Math.round((raised / c.goalAmount) * 100)) : 0;

      return {
        _id: c._id,
        title: c.title,
        category: c.category,
        location: c.location,
        status: c.status,
        goalAmount: c.goalAmount,
        raisedAmount: raised,
        remainingAmount: Math.max(0, c.goalAmount - raised),
        progressPercent,
        donationsCount: donationsForCamp.length,
        beneficiaryCount: c.beneficiaryCount || 100,
        startDate: c.startDate,
        endDate: c.endDate
      };
    });

    // Category-wise summary
    const categoryMap = {};
    campaignProgress.forEach((c) => {
      if (!categoryMap[c.category]) {
        categoryMap[c.category] = {
          category: c.category,
          campaignsCount: 0,
          goalAmount: 0,
          raisedAmount: 0
        };
      }
      categoryMap[c.category].campaignsCount += 1;
      categoryMap[c.category].goalAmount += c.goalAmount;
      categoryMap[c.category].raisedAmount += c.raisedAmount;
    });

    // Donor type breakdown
    const donorTypeBreakdown = ['Individual', 'Corporate', 'Foundation'].map((type) => {
      const matching = memoryDB.donors.filter((d) => d.donorType === type);
      const totalAmount = matching.reduce((sum, d) => sum + Number(d.totalDonated || 0), 0);
      return {
        donorType: type,
        count: matching.length,
        totalAmount
      };
    });

    return res.json({
      success: true,
      databaseMode: isMongoConnected ? 'MongoDB Atlas (Live)' : 'Mongoose Validated Store',
      kpis: {
        totalFundsRaised,
        totalGoalAmount,
        overallProgressPercent:
          totalGoalAmount > 0 ? Math.round((totalFundsRaised / totalGoalAmount) * 100) : 0,
        onlineTotal,
        offlineTotal,
        onlineCount: onlineDonations.length,
        offlineCount: offlineDonations.length,
        totalDonors: memoryDB.donors.length,
        activeCampaigns: memoryDB.campaigns.filter((c) => c.status === 'Active').length,
        totalCampaigns: memoryDB.campaigns.length,
        totalDonations: memoryDB.donations.length,
        totalReceipts: memoryDB.receipts.filter((r) => r.status === 'Valid').length,
        totalUsers: memoryDB.users.length
      },
      campaignProgress,
      categorySummary: Object.values(categoryMap),
      donorTypeBreakdown,
      recentDonations: memoryDB.donations.slice(0, 5)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate campaign progress report.'
    });
  }
};
