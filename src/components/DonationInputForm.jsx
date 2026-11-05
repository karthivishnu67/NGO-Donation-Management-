import React, { useState, useEffect } from 'react';
import { HeartHandshake, CheckCircle2, AlertCircle, ArrowRight, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { generateReceiptPdf } from '../utils/pdfGenerator.js';

const DonationInputForm = ({ onDonationSuccess, defaultCause = '', preselectedCampaignId = null }) => {
  const { user, apiFetch } = useAuth();

  // Form Fields: donor name, amount, and cause
  const [donorName, setDonorName] = useState(user?.name || '');
  const [amount, setAmount] = useState('');
  const [cause, setCause] = useState(defaultCause || 'Rural Classroom Digital Kit Drive');
  const [customCause, setCustomCause] = useState('');
  const [paymentMode, setPaymentMode] = useState('Online - UPI');

  // Causes list loaded from backend campaigns
  const [causesList, setCausesList] = useState([
    'Rural Classroom Digital Kit Drive (Education)',
    'Mobile Maternal & Child Health Van (Healthcare)',
    'Coastal Flood Emergency Relief Kits (Disaster Relief)',
    'Urban Sapling & Lake Restoration (Environment)',
    'Other / Custom Cause'
  ]);

  // Basic Feedback States (Loading, Error, Success)
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [recentTransaction, setRecentTransaction] = useState(null);
  const [recentReceipt, setRecentReceipt] = useState(null);

  // Fetch live campaigns from backend to populate causes dropdown
  useEffect(() => {
    const fetchCampaignCauses = async () => {
      try {
        const res = await apiFetch('/api/campaigns?limit=20');
        if (res && res.data && res.data.length > 0) {
          const list = res.data.map((c) => `${c.title} (${c.category})`);
          list.push('Other / Custom Cause');
          setCausesList(list);

          if (preselectedCampaignId) {
            const matched = res.data.find((c) => c._id === preselectedCampaignId);
            if (matched) {
              setCause(`${matched.title} (${matched.category})`);
              return;
            }
          }

          if (defaultCause) {
            setCause(defaultCause);
          } else if (list.length > 0) {
            setCause(list[0]);
          }
        }
      } catch (err) {
        // Fallback to initial causes if backend call fails
        console.log('Using default causes list:', err.message);
      }
    };
    fetchCampaignCauses();
  }, [defaultCause, preselectedCampaignId]);

  // Keep donor name updated if user logs in or switches account
  useEffect(() => {
    if (user && user.name && !donorName) {
      setDonorName(user.name);
    }
  }, [user]);

  // Quick Preset Donation Amounts
  const presetAmounts = [250, 500, 1000, 2500, 5000];

  // Controlled Form Submission with basic validation
  const handleSubmit = async (event) => {
    // Prevent default browser form submission (college project requirement)
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setRecentTransaction(null);

    // 1. Basic Validation: Donor Name field
    if (!donorName.trim()) {
      setErrorMessage('Please enter the donor full name.');
      return;
    }

    // 2. Basic Validation: Cause field
    const effectiveCause = cause === 'Other / Custom Cause' ? customCause.trim() : cause;
    if (!effectiveCause) {
      setErrorMessage('Please select or specify a cause for this donation.');
      return;
    }

    // 3. Basic Validation: Ensure amount is a positive number (> 0)
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount)) {
      setErrorMessage('Please enter a valid numeric donation amount.');
      return;
    }

    if (numericAmount <= 0) {
      setErrorMessage('Donation amount must be a positive number greater than 0.');
      return;
    }

    // If all basic validations pass, send data to the Node.js Express backend
    setLoading(true);
    try {
      const payload = {
        donorName: donorName.trim(),
        amount: numericAmount,
        cause: effectiveCause,
        paymentMode: paymentMode,
        donationType: paymentMode.startsWith('Offline') ? 'Offline' : 'Online',
        autoGenerateReceipt: true
      };

      const result = await apiFetch('/api/donations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Show success message with transaction details
      setSuccessMessage(
        `Thank you! Donation of ₹${numericAmount.toLocaleString('en-IN')} for "${effectiveCause}" has been recorded successfully.`
      );
      setRecentTransaction(result.data);
      setRecentReceipt(result.receipt || null);

      // Reset amount field while keeping donor name for quick re-use
      setAmount('');
      if (cause === 'Other / Custom Cause') {
        setCustomCause('');
      }

      // Notify parent component if callback provided
      if (onDonationSuccess) {
        onDonationSuccess(result);
      }
    } catch (err) {
      // Simple error handling
      setErrorMessage(err.message || 'Failed to submit donation to backend server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Form Header */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900 font-display">
              NGO Donation Input Form
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accepts donor name, amount, and cause with client-side positive number validation.
          </p>
        </div>

        <div className="text-xs font-mono-num text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
          Validation: <span className="text-emerald-700 font-semibold">Amount &gt; 0</span>
        </div>
      </div>

      <div className="p-6">
        {/* Error Feedback State */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <div className="font-semibold text-red-800">Validation Error</div>
              <div className="mt-0.5">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Success Feedback State */}
        {successMessage && (
          <div className="mb-5 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-emerald-900">Donation Successful!</div>
              <div className="mt-0.5">{successMessage}</div>
              {recentTransaction && (
                <div className="mt-2 pt-2 border-t border-emerald-200/60 font-mono-num text-[11px] text-emerald-950 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Code: <strong>{recentTransaction.donationCode}</strong></span>
                  <span>Date: <strong>{recentTransaction.donationDate}</strong></span>
                  <span>Status: <strong>{recentTransaction.status}</strong></span>
                  <span>Receipt: <strong>80G Auto-Generated</strong></span>
                </div>
              )}
              {recentReceipt && (
                <div className="mt-2.5 pt-2 border-t border-emerald-200/60">
                  <button
                    type="button"
                    onClick={() => generateReceiptPdf(recentReceipt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-50 text-xs font-semibold shadow-xs"
                    title="Download Section 80G Tax Exemption Receipt as PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Download 80G Receipt (.pdf)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controlled Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Donor Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Donor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => {
                setDonorName(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g., Karthik Subramanian, Ananya Sharma, or Tech Corp"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 bg-white"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Enter individual donor or corporate organization name.
            </span>
          </div>

          {/* 2. Donation Amount Field (with quick presets & positive number check) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Donation Amount (INR ₹) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono-num">
                Must be &gt; 0
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-5 gap-2 mb-2.5">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(String(preset));
                    if (errorMessage) setErrorMessage('');
                  }}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors font-mono-num ${
                    Number(amount) === preset
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  ₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter amount (e.g. 500)"
                className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg font-mono-num focus:outline-none focus:border-slate-900 bg-white"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Basic validation checks that amount is a positive number greater than 0 before sending.
            </span>
          </div>

          {/* 3. Cause Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Fundraising Cause / Campaign <span className="text-red-500">*</span>
            </label>
            <select
              value={cause}
              onChange={(e) => {
                setCause(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-900"
            >
              {causesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {cause === 'Other / Custom Cause' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customCause}
                  onChange={(e) => setCustomCause(e.target.value)}
                  placeholder="Type custom cause (e.g. Clean Drinking Water Initiative)"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            )}
            <span className="text-[11px] text-slate-500 mt-1 block">
              Select the active campaign or charity cause for which this donation is designated.
            </span>
          </div>

          {/* 4. Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                'Online - UPI',
                'Online - Card',
                'Online - NetBanking',
                'Offline - Cash'
              ].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-left transition-colors truncate ${
                    paymentMode === mode
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? (
                <span>Validating & Sending to Backend...</span>
              ) : (
                <>
                  <span>Submit Donation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationInputForm;
