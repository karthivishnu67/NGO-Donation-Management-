import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const UsersPage = () => {
  const { apiFetch, user } = useAuth();

  // List & Query States
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Campaign Manager');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active');

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams({
        search,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        order,
        page: String(page),
        limit: '5'
      });
      const res = await apiFetch(`/api/users?${params.toString()}`);
      setUsers(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [search, roleFilter, statusFilter, sortBy, order, page, user]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Campaign Manager');
    setPhone('');
    setStatus('Active');
    setShowForm(false);
  };

  const handleEditClick = (u) => {
    setEditingId(u._id);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setRole(u.role);
    setPhone(u.phone || '');
    setStatus(u.status || 'Active');
    setShowForm(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Controlled Form Submit using event.preventDefault()
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !role) {
      setErrorMessage('Name, Email, and Role are required fields.');
      return;
    }

    if (!editingId && (!password || password.trim().length < 6)) {
      setErrorMessage('Password of at least 6 characters is required for new users.');
      return;
    }

    try {
      const payload = {
        name,
        email,
        role,
        phone,
        status
      };
      if (password && password.trim().length >= 6) {
        payload.password = password;
      }

      if (editingId) {
        const res = await apiFetch(`/api/users/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMessage(res.message || 'User updated successfully.');
      } else {
        const res = await apiFetch('/api/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMessage(res.message || 'User created successfully.');
      }

      resetForm();
      fetchUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save user.');
    }
  };

  const handleDelete = async (id) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      setSuccessMessage(res.message || 'User deleted.');
      fetchUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete user.');
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">
          Admin Access Required
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Only users with the Admin role can manage system user accounts and role permissions. Use the Quick Role Switcher in the sidebar to switch to Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            System Users & Role Access Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Admin CRUD screen for managing Admin, Campaign Manager, and Donor accounts with bcrypt password hashing.
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
          <span>{showForm ? 'Close Form' : 'Create User Account'}</span>
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

      {/* Controlled User Form */}
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit User & Role Assignment' : 'Create New User Account'}
            </h2>
            <span className="text-xs text-slate-500">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Divya Balaji"
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
                placeholder="user@hopebridge.org"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {editingId ? 'New Password (leave blank to keep)' : 'Password (min 6 chars) *'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Assigned Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="Admin">Admin</option>
                <option value="Campaign Manager">Campaign Manager</option>
                <option value="Donor">Donor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98400 00000"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
            >
              {editingId ? 'Update User' : 'Save User'}
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
            placeholder="Search users by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Campaign Manager">Campaign Manager</option>
            <option value="Donor">Donor</option>
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
            <option value="Inactive">Inactive</option>
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
            <option value="name:asc">Sort: Name (A-Z)</option>
            <option value="role:asc">Sort: Role</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-6">User Name & ID</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">Role Permission</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500 font-mono-num">
                        ID: {u._id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-900 font-medium">{u.email}</div>
                      <div className="text-slate-500 font-mono-num">
                        {u.phone || '—'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-900">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span
                        className={
                          u.status === 'Active'
                            ? 'text-emerald-700 font-semibold'
                            : 'text-red-600 font-semibold'
                        }
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(u)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
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

export default UsersPage;
