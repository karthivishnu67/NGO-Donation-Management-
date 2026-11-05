import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, FileText, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import DonationInputForm from '../components/DonationInputForm.jsx';

const DonationsPage = () => {
  const { apiFetch, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const canManageAll = user?.role === 'Admin' || user?.role === 'Campaign Manager';

  // Reference lists for dropdowns
  const [donorsList, setDonorsList] = useState([]);
  const [campaignsList, setCampaignsList] = useState([]);

  // List & Query States
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState('');
  const [donationTypeFilter, setDonationTypeFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [sortBy, setSortBy] = useState('donationDate');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Feedback States
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Controlled Form State
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [donorId, setDonorId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [amount, setAmount] = useState('');
  const [donationType, setDonationType] = useState('Online');
  const [paymentMode, setPaymentMode] = useState('Online - UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [donationDate, setDonationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState('Completed');
  const [notes, setNotes] = useState('');
  const [autoGenerateReceipt, setAutoGenerateReceipt] = useState(true);

  // Load donors and campaigns for select dropdowns
  const loadDropdownData = async () => {
    try {
      const [donorsRes, campsRes] = await Promise.all([
        apiFetch('/api/donors?limit=50'),
        apiFetch('/api/campaigns?limit=50')
      ]);
      const allDonors = donorsRes.allDonors || donorsRes.data || [];
      const allCamps = campsRes.allCampaigns || campsRes.data || [];
      setDonorsList(allDonors);
      setCampaignsList(allCamps);

      // Default selections
      if (allDonors.length > 0 && !donorId) {
        const myDonor = allDonors.find(
          (d) => d.email.toLowerCase() === user?.email?.toLowerCase()
        );
        setDonorId(myDonor ? myDonor._id : allDonors[0]._id);
      }

      if (location.state?.preselectedCampaignId) {
        setCampaignId(location.state.preselectedCampaignId);
        setShowForm(true);
      } else if (allCamps.length > 0 && !campaignId) {
        setCampaignId(allCamps[0]._id);
      }
    } catch (err) {
      console.error('Dropdown load error:', err);
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams({
        search,
        donationType: donationTypeFilter,
        campaignId: campaignFilter,
        sortBy,
        order,
        page: String(page),
        limit: '5'
      });
      const res = await apiFetch(`/api/donations?${params.toString()}`);
      setDonations(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDropdownData();
  }, [user]);

  useEffect(() => {
    fetchDonations();
  }, [search, donationTypeFilter, campaignFilter, sortBy, order, page]);

  // Keep paymentMode synced when toggling Online vs Offline
  const handleDonationTypeChange = (type) => {
    setDonationType(type);
    if (type === 'Online') {
      setPaymentMode('Online - UPI');
    } else {
      setPaymentMode('Offline - Cash');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setAmount('');
    setDonationType('Online');
    setPaymentMode('Online - UPI');
    setReferenceNumber('');
    setDonationDate(new Date().toISOString().split('T')[0]);
    setStatus('Completed');
    setNotes('');
    setAutoGenerateReceipt(true);
    setShowForm(false);
  };

  const handleEditClick = (don) => {
    setEditingId(don._id);
    setDonorId(don.donorId);
    setCampaignId(don.campaignId);
    setAmount(String(don.amount));
    setDonationType(don.donationType);
    setPaymentMode(don.paymentMode);
    setReferenceNumber(don.referenceNumber || '');
    setDonationDate(don.donationDate);
    setStatus(don.status);
    setNotes(don.notes || '');
    setShowForm(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Controlled Form Submit using event.preventDefault()
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!donorId || !campaignId || !amount || !donationDate) {
      setErrorMessage('Please select Donor, Campaign, Donation Amount, and Date.');
      return;
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Donation amount must be a positive number greater than 0.');
      return;
    }

    try {
      const payload = {
        donorId,
        campaignId,
        amount: Number(amount),
        donationType,
        paymentMode,
        referenceNumber,
        donationDate,
        status,
        notes,
        autoGenerateReceipt
      };

      if (editingId) {
        const res = await apiFetch(`/api/donations/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMessage(res.message || 'Donation updated.');
      } else {
        const res = await apiFetch('/api/donations', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMessage(res.message || 'Donation recorded successfully.');
      }

      resetForm();
      fetchDonations();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save donation.');
    }
  };

  const handleDelete = async (id) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await apiFetch(`/api/donations/${id}`, { method: 'DELETE' });
      setSuccessMessage(res.message || 'Donation deleted.');
      fetchDonations();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete donation.');
    }
  };

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Online & Offline Donations Ledger
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Record UPI, Card, NetBanking, Cash, or Cheque contributions and update campaign progress automatically.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setShowQuickForm((prev) => !prev);
              if (showForm) setShowForm(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{showQuickForm ? 'Close Quick Form' : 'Quick Donation Form (Name, Amount, Cause)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (showForm) resetForm();
              else {
                setShowForm(true);
                setShowQuickForm(false);
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Close Manual Entry' : 'Manual Ledger Entry'}</span>
          </button>
        </div>
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

      {/* Quick Donation Input Form (Donor Name, Amount, Cause with positive validation) */}
      {showQuickForm && (
        <div className="mb-6">
          <DonationInputForm
            onDonationSuccess={() => {
              fetchDonations();
            }}
          />
        </div>
      )}

      {/* Controlled Donation Form */}
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Donation Record' : 'Record Online / Offline Donation'}
            </h2>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {['Online', 'Offline'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleDonationTypeChange(t)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    donationType === t
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t} Mode
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Select Registered Donor *
              </label>
              <select
                value={donorId}
                onChange={(e) => setDonorId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                {donorsList.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.donorCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Fundraising Campaign *
              </label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                {campaignsList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Donation Amount (INR) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Payment Mode *
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                {donationType === 'Online' ? (
                  <>
                    <option value="Online - UPI">Online - UPI</option>
                    <option value="Online - Card">Online - Card</option>
                    <option value="Online - NetBanking">Online - NetBanking</option>
                  </>
                ) : (
                  <>
                    <option value="Offline - Cash">Offline - Cash</option>
                    <option value="Offline - Cheque">Offline - Cheque</option>
                    <option value="Offline - Bank Transfer">Offline - Bank Transfer</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                UTR / Cheque / Voucher Ref
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. UPI99182341 / CHQ102"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Donation Date *
              </label>
              <input
                type="date"
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Transaction Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Purpose / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional note or dedication"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            {!editingId && (
              <div className="pt-4">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateReceipt}
                    onChange={(e) => setAutoGenerateReceipt(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>Automatically generate 80G Tax Exemption Receipt upon saving</span>
                </label>
              </div>
            )}
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
              {editingId ? 'Update Donation' : 'Save Donation'}
            </button>
          </div>
        </form>
      )}

      {/* Search, Filter & Sort Controls */}
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
            placeholder="Search by donation code, donor name, campaign, or reference number..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={donationTypeFilter}
            onChange={(e) => {
              setDonationTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
          >
            <option value="All">All Modes (Online & Offline)</option>
            <option value="Online">Online Only</option>
            <option value="Offline">Offline Only</option>
          </select>

          <select
            value={campaignFilter}
            onChange={(e) => {
              setCampaignFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white max-w-52 truncate"
          >
            <option value="All">All Campaigns</option>
            {campaignsList.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
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
            <option value="donationDate:desc">Sort: Latest Date</option>
            <option value="amount:desc">Sort: Highest Amount</option>
            <option value="amount:asc">Sort: Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Donations Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading donations ledger...
          </div>
        ) : donations.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">
              No donations found matching your filter
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Click &ldquo;Record New Donation&rdquo; to log an online or offline contribution.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-6">Donation Code & Date</th>
                  <th className="py-3 px-4">Donor Details</th>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Mode & Reference</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {donations.map((don) => (
                  <tr key={don._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900 font-mono-num">
                        {don.donationCode}
                      </div>
                      <div className="text-xs text-slate-500 font-mono-num">
                        {don.donationDate} · {don.status}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{don.donorName}</div>
                      <div className="text-xs text-slate-500">{don.donorEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{don.campaignTitle}</div>
                      {don.notes && (
                        <div className="text-xs text-slate-500 truncate max-w-52">
                          {don.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium text-slate-900">
                        {don.paymentMode}
                      </div>
                      <div className="text-slate-500 font-mono-num">
                        Ref: {don.referenceNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num">
                      <div className="font-bold text-emerald-700">
                        {formatINR(don.amount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {don.receiptGenerated ? '80G Issued' : 'No Receipt'}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('/receipts')}
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 rounded-lg"
                          title="View / Issue Receipt"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {canManageAll && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(don)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                            title="Edit Donation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {user?.role === 'Admin' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(don._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
                            title="Delete Donation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-3.5 text-xs text-slate-600">
        <div className="font-mono-num">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} donations)
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

export default DonationsPage;
