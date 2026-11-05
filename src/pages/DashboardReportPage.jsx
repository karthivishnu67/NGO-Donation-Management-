import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const DashboardReportPage = () => {
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/reports/summary');
      setReport(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Download Campaign Progress CSV Report
  const handleDownloadCSV = () => {
    if (!report?.campaignProgress) return;
    const headers = [
      'Campaign Title',
      'Category',
      'Location',
      'Status',
      'Goal Amount (INR)',
      'Raised Amount (INR)',
      'Remaining Amount (INR)',
      'Progress (%)',
      'Donations Count'
    ];
    const rows = report.campaignProgress.map((c) => [
      `"${c.title}"`,
      c.category,
      `"${c.location}"`,
      c.status,
      c.goalAmount,
      c.raisedAmount,
      c.remainingAmount,
      `${c.progressPercent}%`,
      c.donationsCount
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ngo_campaign_progress_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatINR = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white border border-slate-200 rounded-xl p-5" />
          ))}
        </div>
        <div className="h-80 bg-white border border-slate-200 rounded-xl p-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
        <p className="font-semibold">Error loading report</p>
        <p className="mt-1">{error}</p>
        <button
          type="button"
          onClick={fetchReport}
          className="mt-3 px-4 py-2 bg-red-700 text-white text-xs font-medium rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const kpis = report?.kpis || {};
  const campaigns = report?.campaignProgress || [];
  const filteredCampaigns =
    categoryFilter === 'All'
      ? campaigns
      : campaigns.filter((c) => c.category === categoryFilter);

  return (
    <div className="space-y-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Campaign Progress & Financial Summary Report
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time overview of fundraising goals, online vs offline collections, donor segments, and 80G tax receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* 4-Column KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500 font-medium">
            Total Funds Raised
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1.5">
            {formatINR(kpis.totalFundsRaised)}
          </div>
          <div className="text-xs text-emerald-700 mt-2 font-mono-num">
            {kpis.overallProgressPercent}% of {formatINR(kpis.totalGoalAmount)} total goal
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500 font-medium">
            Online vs Offline Split
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1.5">
            {formatINR(kpis.onlineTotal)}
          </div>
          <div className="text-xs text-slate-600 mt-2 font-mono-num">
            Online ({kpis.onlineCount}) · Offline: {formatINR(kpis.offlineTotal)} ({kpis.offlineCount})
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500 font-medium">
            Active Fundraising Campaigns
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1.5">
            {kpis.activeCampaigns} / {kpis.totalCampaigns}
          </div>
          <div className="text-xs text-slate-600 mt-2">
            Across Education, Healthcare & Relief
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs text-slate-500 font-medium">
            Registered Donors & 80G Receipts
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1.5">
            {kpis.totalDonors} Donors
          </div>
          <div className="text-xs text-slate-600 mt-2 font-mono-num">
            {kpis.totalReceipts} Valid 80G Receipts Issued
          </div>
        </div>
      </div>

      {/* Main Campaign Progress Report Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Campaign-Wise Fundraising Progress Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live calculation of raised amount, remaining target, and donor contributions per campaign
            </p>
          </div>

          {/* Interactive Category Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {['All', 'Education', 'Healthcare', 'Disaster Relief', 'Environment'].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No campaigns found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-6">Campaign Title & Metadata</th>
                  <th className="py-3 px-4 text-right">Target Goal</th>
                  <th className="py-3 px-4 text-right">Raised So Far</th>
                  <th className="py-3 px-4 text-right">Remaining</th>
                  <th className="py-3 px-6 w-56">Progress</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredCampaigns.map((camp) => (
                  <tr key={camp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">
                        {camp.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {camp.category} · {camp.location} · Status: {camp.status} · {camp.donationsCount} donations
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-700">
                      {formatINR(camp.goalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-semibold text-emerald-700">
                      {formatINR(camp.raisedAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600">
                      {formatINR(camp.remainingAmount)}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-between text-xs font-mono-num mb-1">
                        <span className="font-semibold text-slate-900">
                          {camp.progressPercent}%
                        </span>
                        <span className="text-slate-500">
                          {camp.beneficiaryCount} beneficiaries
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${camp.progressPercent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate('/donate', {
                            state: { preselectedCampaignId: camp._id }
                          })
                        }
                        className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Donate Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom 2-Column Breakdown: Category Summary & Donor Segment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Funds Raised by Cause Category
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {(report?.categorySummary || []).map((item) => {
              const pct =
                item.goalAmount > 0
                  ? Math.round((item.raisedAmount / item.goalAmount) * 100)
                  : 0;
              return (
                <div
                  key={item.category}
                  className="px-6 py-3.5 flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {item.category}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.campaignsCount} campaign(s) · Target {formatINR(item.goalAmount)}
                    </div>
                  </div>
                  <div className="text-right font-mono-num">
                    <div className="font-semibold text-slate-900">
                      {formatINR(item.raisedAmount)}
                    </div>
                    <div className="text-xs text-emerald-700">{pct}% achieved</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donor Segment & Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Donor Type Contribution Summary
            </h3>
            <span className="text-xs text-slate-500">
              Logged in as {user?.role}
            </span>
          </div>
          <div className="divide-y divide-slate-200">
            {(report?.donorTypeBreakdown || []).map((seg) => (
              <div
                key={seg.donorType}
                className="px-6 py-3.5 flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium text-slate-900">
                    {seg.donorType} Donors
                  </div>
                  <div className="text-xs text-slate-500">
                    {seg.count} registered profile(s)
                  </div>
                </div>
                <div className="font-mono-num font-semibold text-slate-900">
                  {formatINR(seg.totalAmount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardReportPage;
