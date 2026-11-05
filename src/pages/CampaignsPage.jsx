import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const CampaignsPage = () => {
  const { apiFetch, user } = useAuth();
  const navigate = useNavigate();

  const canManage = user?.role === 'Admin' || user?.role === 'Campaign Manager';

  // List & Query States (Search, Filter, Sort, Pagination)
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Feedback States
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Controlled Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Education');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2027-03-31');
  const [status, setStatus] = useState('Active');
  const [location, setLocation] = useState('');
  const [beneficiaryCount, setBeneficiaryCount] = useState('250');

  const fetchCampaigns = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams({
        search,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
        order,
        page: String(page),
        limit: '4'
      });
      const res = await apiFetch(`/api/campaigns?${params.toString()}`);
      setCampaigns(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [search, categoryFilter, statusFilter, sortBy, order, page]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Education');
    setDescription('');
    setGoalAmount('');
    setStartDate('2026-11-01');
    setEndDate('2027-03-31');
    setStatus('Active');
    setLocation('');
    setBeneficiaryCount('250');
    setShowForm(false);
  };

  const handleEditClick = (camp) => {
    setEditingId(camp._id);
    setTitle(camp.title);
    setCategory(camp.category);
    setDescription(camp.description);
    setGoalAmount(String(camp.goalAmount));
    setStartDate(camp.startDate);
    setEndDate(camp.endDate);
    setStatus(camp.status);
    setLocation(camp.location);
    setBeneficiaryCount(String(camp.beneficiaryCount || 100));
    setShowForm(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Controlled Form Submit using event.preventDefault()
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validation
    if (!title.trim() || !description.trim() || !goalAmount || !location.trim()) {
      setErrorMessage('Please fill all required campaign fields (Title, Description, Goal Amount, Location).');
      return;
    }

    if (Number(goalAmount) < 1000) {
      setErrorMessage('Campaign Goal Amount must be at least ₹1,000.');
      return;
    }

    try {
      const payload = {
        title,
        category,
        description,
        goalAmount: Number(goalAmount),
        startDate,
        endDate,
        status,
        location,
        beneficiaryCount: Number(beneficiaryCount) || 100
      };

      if (editingId) {
        const res = await apiFetch(`/api/campaigns/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMessage(res.message || 'Campaign updated.');
      } else {
        const res = await apiFetch('/api/campaigns', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMessage(res.message || 'Campaign created.');
      }

      resetForm();
      fetchCampaigns();
    } catch (err) {
      setErrorMessage(err.message || 'Error saving campaign.');
    }
  };

  const handleDelete = async (id) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await apiFetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      setSuccessMessage(res.message || 'Campaign deleted.');
      fetchCampaigns();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete campaign.');
    }
  };

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Fundraising Campaigns Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Create, track, and manage NGO fundraising drives with real-time progress targets.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Close Form' : 'Create Campaign'}</span>
          </button>
        )}
      </div>

      {/* Feedback States */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          Error: {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
          Success: {successMessage}
        </div>
      )}

      {/* Controlled Create / Edit Form */}
      {showForm && canManage && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Fundraising Campaign' : 'Create New Fundraising Campaign'}
            </h2>
            <span className="text-xs text-slate-500">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solar Study Lamps for Tribal Students"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Cause Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Disaster Relief">Disaster Relief</option>
                <option value="Child Welfare">Child Welfare</option>
                <option value="Environment">Environment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Campaign Description & Impact Plan *
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how funds will be utilized..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Goal Amount (INR) *
              </label>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="150000"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Madurai, TN"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
            >
              {editingId ? 'Update Campaign' : 'Save Campaign'}
            </button>
          </div>
        </form>
      )}

      {/* Search, Filter, and Sort Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search campaigns by title, description, or location..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Education">Education</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Disaster Relief">Disaster Relief</option>
            <option value="Child Welfare">Child Welfare</option>
            <option value="Environment">Environment</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={`${sortBy}:${order}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(':');
              setSortBy(field);
              setOrder(dir);
            }}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
          >
            <option value="createdAt:desc">Sort: Newest First</option>
            <option value="raisedAmount:desc">Sort: Highest Raised</option>
            <option value="goalAmount:desc">Sort: Highest Goal</option>
            <option value="title:asc">Sort: Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Campaign List Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-48 bg-white border border-slate-200 rounded-xl p-6 animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-sm font-semibold text-slate-900">
            No matching fundraising campaigns found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try clearing your search filters or create a new fundraising campaign.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {campaigns.map((camp) => {
            const pct =
              camp.goalAmount > 0
                ? Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100))
                : 0;
            return (
              <div
                key={camp._id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Clean unboxed metadata kicker */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {camp.category} · {camp.location} · Status: {camp.status}
                    </span>
                    <span className="font-mono-num">
                      Ends {camp.endDate}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    {camp.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {camp.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-baseline justify-between text-xs mb-1.5 font-mono-num">
                    <span>
                      Raised: <strong className="text-emerald-700 text-sm">{formatINR(camp.raisedAmount)}</strong> of {formatINR(camp.goalAmount)}
                    </span>
                    <span className="font-semibold text-slate-900">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-500">
                      Managed by {camp.createdBy}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate('/donate', {
                            state: { preselectedCampaignId: camp._id }
                          })
                        }
                        className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Donate
                      </button>

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditClick(camp)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                            title="Edit Campaign"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(camp._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-3.5 text-xs text-slate-600">
        <div className="font-mono-num">
          Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total campaigns)
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 font-medium border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 font-medium border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
