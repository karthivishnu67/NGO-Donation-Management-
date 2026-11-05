import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const DonorsPage = () => {
  const { apiFetch, user } = useAuth();

  // List & Query States
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState('');
  const [donorTypeFilter, setDonorTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('totalDonated');
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [donorType, setDonorType] = useState('Individual');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const fetchDonors = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams({
        search,
        donorType: donorTypeFilter,
        sortBy,
        order,
        page: String(page),
        limit: '5'
      });
      const res = await apiFetch(`/api/donors?${params.toString()}`);
      setDonors(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch donors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [search, donorTypeFilter, sortBy, order, page]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPhone('');
    setPanNumber('');
    setDonorType('Individual');
    setAddress('');
    setCity('');
    setShowForm(false);
  };

  const handleEditClick = (donor) => {
    setEditingId(donor._id);
    setName(donor.name);
    setEmail(donor.email);
    setPhone(donor.phone);
    setPanNumber(donor.panNumber || '');
    setDonorType(donor.donorType);
    setAddress(donor.address || '');
    setCity(donor.city);
    setShowForm(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Controlled Form Submit using event.preventDefault()
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !phone.trim() || !city.trim()) {
      setErrorMessage('Name, Email, Phone Number, and City are required fields.');
      return;
    }

    try {
      const payload = {
        name,
        email,
        phone,
        panNumber,
        donorType,
        address,
        city
      };

      if (editingId) {
        const res = await apiFetch(`/api/donors/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMessage(res.message || 'Donor updated successfully.');
      } else {
        const res = await apiFetch('/api/donors', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMessage(res.message || 'New donor registered successfully.');
      }

      resetForm();
      fetchDonors();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save donor record.');
    }
  };

  const handleDelete = async (id) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await apiFetch(`/api/donors/${id}`, { method: 'DELETE' });
      setSuccessMessage(res.message || 'Donor deleted.');
      fetchDonors();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete donor.');
    }
  };

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Donor Registry & Directory
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Register Individual, Corporate CSR, and Foundation donors with PAN details for 80G tax compliance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Register New Donor'}</span>
        </button>
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

      {/* Controlled Donor Registration Form */}
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Donor Profile' : 'Register New Donor'}
            </h2>
            <span className="text-xs text-slate-500">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name / Organization *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sundar Raman"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="donor@domain.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98400 12345"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Donor Category *
              </label>
              <select
                value={donorType}
                onChange={(e) => setDonorType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
                <option value="Foundation">Foundation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                PAN Number (for 80G)
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase font-mono-num focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Chennai"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="12 Gandhi Nagar"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
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
              {editingId ? 'Update Donor' : 'Register Donor'}
            </button>
          </div>
        </form>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by donor name, code, email, PAN, or city..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={donorTypeFilter}
            onChange={(e) => {
              setDonorTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
          >
            <option value="All">All Donor Types</option>
            <option value="Individual">Individual</option>
            <option value="Corporate">Corporate</option>
            <option value="Foundation">Foundation</option>
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
            <option value="totalDonated:desc">Sort: Highest Donated</option>
            <option value="createdAt:desc">Sort: Recently Registered</option>
            <option value="name:asc">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading donor records...
          </div>
        ) : donors.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">
              No donor records match your filter
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Click &ldquo;Register New Donor&rdquo; to add a donor profile.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-6">Donor Code & Name</th>
                  <th className="py-3 px-4">Type & City</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">PAN Number</th>
                  <th className="py-3 px-4 text-right">Total Donated</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {donors.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{d.name}</div>
                      <div className="text-xs text-slate-500 font-mono-num">
                        {d.donorCode}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <div className="font-medium text-slate-900">{d.donorType}</div>
                      <div className="text-slate-500">{d.city}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{d.email}</div>
                      <div className="font-mono-num text-slate-500">{d.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-xs text-slate-700">
                      {d.panNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num">
                      <div className="font-semibold text-emerald-700">
                        {formatINR(d.totalDonated)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {d.donationsCount} donation(s)
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(d)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                          title="Edit Donor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {user?.role === 'Admin' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(d._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
                            title="Delete Donor"
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
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} registered donors)
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

export default DonorsPage;
