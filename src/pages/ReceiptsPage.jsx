import React, { useState, useEffect } from 'react';
import { Search, Plus, Printer, Trash2, X, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { generateReceiptPdf } from '../utils/pdfGenerator.js';

const ReceiptsPage = () => {
  const { apiFetch, user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'Campaign Manager';

  // List & Query States
  const [receipts, setReceipts] = useState([]);
  const [unreceiptedDonations, setUnreceiptedDonations] = useState([]);
  const [search, setSearch] = useState('');
  const [donationTypeFilter, setDonationTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('issueDate');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Feedback States
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Controlled Form State for Generating a Receipt
  const [showForm, setShowForm] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [taxExemptionSection, setTaxExemptionSection] = useState(
    '80G (50% Tax Deductible)'
  );
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [remarks, setRemarks] = useState(
    'Official 80G Tax Exemption Donation Receipt.'
  );

  // Printable Receipt Preview Modal State
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState(null);
  const [printNotice, setPrintNotice] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Client-side PDF Generation (Save as PDF)
  const handleDownloadPdf = (rcp) => {
    try {
      setPdfGenerating(true);
      generateReceiptPdf(rcp);
      setPrintNotice(`Receipt ${rcp.receiptNumber} saved and downloaded as PDF file successfully!`);
      setTimeout(() => setPrintNotice(''), 5000);
    } catch (err) {
      console.error('PDF generation error:', err);
      setErrorMessage('Failed to generate PDF: ' + err.message);
    } finally {
      setPdfGenerating(false);
    }
  };

  // Safe Browser Print with IFrame Sandbox Error Handling
  const handlePrint = (rcp) => {
    try {
      window.print();
    } catch (err) {
      console.warn('Browser print restricted in sandbox:', err);
      // Automatically fallback to generating and downloading the official PDF document
      handleDownloadPdf(rcp);
      setPrintNotice('Browser print dialog is restricted in this embedded view. Your official 80G PDF receipt has been saved and downloaded automatically!');
    }
  };

  const fetchReceiptsAndDonations = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams({
        search,
        donationType: donationTypeFilter,
        status: statusFilter,
        sortBy,
        order,
        page: String(page),
        limit: '5'
      });

      const [rcpRes, donRes] = await Promise.all([
        apiFetch(`/api/receipts?${params.toString()}`),
        apiFetch('/api/donations?limit=50')
      ]);

      setReceipts(rcpRes.data || []);
      setPagination(rcpRes.pagination || { total: 0, page: 1, totalPages: 1 });

      const allDons = donRes.allDonations || donRes.data || [];
      const pendingReceiptDons = allDons.filter((d) => !d.receiptGenerated);
      setUnreceiptedDonations(pendingReceiptDons);
      if (pendingReceiptDons.length > 0 && !selectedDonationId) {
        setSelectedDonationId(pendingReceiptDons[0]._id);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiptsAndDonations();
  }, [search, donationTypeFilter, statusFilter, sortBy, order, page]);

  // Controlled Form Submit using event.preventDefault()
  const handleGenerateReceipt = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedDonationId) {
      setErrorMessage('Please select a donation record to issue a receipt.');
      return;
    }

    try {
      const res = await apiFetch('/api/receipts', {
        method: 'POST',
        body: JSON.stringify({
          donationId: selectedDonationId,
          taxExemptionSection,
          issueDate,
          remarks
        })
      });
      setSuccessMessage(res.message || 'Receipt generated successfully.');
      setShowForm(false);
      fetchReceiptsAndDonations();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to generate receipt.');
    }
  };

  const handleToggleStatus = async (receipt) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const nextStatus = receipt.status === 'Valid' ? 'Cancelled' : 'Valid';
      const res = await apiFetch(`/api/receipts/${receipt._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      setSuccessMessage(res.message || 'Receipt status updated.');
      fetchReceiptsAndDonations();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update receipt.');
    }
  };

  const handleDelete = async (id) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await apiFetch(`/api/receipts/${id}`, { method: 'DELETE' });
      setSuccessMessage(res.message || 'Receipt deleted.');
      fetchReceiptsAndDonations();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete receipt.');
    }
  };

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            80G Tax Exemption Receipts
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Generate, verify, and print official NGO donation receipts with PAN and 80G tax deduction details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Generate Receipt'}</span>
        </button>
      </div>

      {/* Feedback States */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium no-print">
          Error: {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium no-print">
          Success: {successMessage}
        </div>
      )}

      {/* Controlled Generate Receipt Form */}
      {showForm && (
        <form
          onSubmit={handleGenerateReceipt}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 no-print"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Issue 80G Receipt for Recorded Donation
            </h2>
            <span className="text-xs text-slate-500">
              {unreceiptedDonations.length} unreceipted donation(s) available
            </span>
          </div>

          {unreceiptedDonations.length === 0 ? (
            <div className="text-xs text-slate-600 py-2">
              All recorded donations already have a valid 80G receipt! Record a new donation first to generate another receipt.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Select Unreceipted Donation *
                </label>
                <select
                  value={selectedDonationId}
                  onChange={(e) => setSelectedDonationId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {unreceiptedDonations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.donationCode} — {d.donorName} ({formatINR(d.amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tax Exemption Section *
                </label>
                <input
                  type="text"
                  value={taxExemptionSection}
                  onChange={(e) => setTaxExemptionSection(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
                />
              </div>
            </div>
          )}

          {unreceiptedDonations.length > 0 && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Remarks on Certificate
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
                >
                  Generate Official Receipt
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by receipt number, donor name, PAN, or campaign..."
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
            <option value="All">All Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
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
            <option value="Valid">Valid</option>
            <option value="Cancelled">Cancelled</option>
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
            <option value="issueDate:desc">Sort: Newest Issued</option>
            <option value="amount:desc">Sort: Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden no-print">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading receipts...
          </div>
        ) : receipts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">
              No tax receipts found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Generate a receipt from an existing donation record above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-6">Receipt No & Date</th>
                  <th className="py-3 px-4">Donor & PAN</th>
                  <th className="py-3 px-4">Campaign & Mode</th>
                  <th className="py-3 px-4">Tax Section & Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {receipts.map((rcp) => (
                  <tr key={rcp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900 font-mono-num">
                        {rcp.receiptNumber}
                      </div>
                      <div className="text-xs text-slate-500 font-mono-num">
                        Issued: {rcp.issueDate}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{rcp.donorName}</div>
                      <div className="text-xs text-slate-500 font-mono-num">
                        PAN: {rcp.donorPan}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">
                        {rcp.campaignTitle}
                      </div>
                      <div className="text-xs text-slate-500">
                        {rcp.paymentMode} ({rcp.donationCode})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium text-slate-900">
                        {rcp.taxExemptionSection}
                      </div>
                      <div
                        className={
                          rcp.status === 'Valid'
                            ? 'text-emerald-700 font-semibold'
                            : 'text-red-600 font-semibold'
                        }
                      >
                        Status: {rcp.status}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-slate-900">
                      {formatINR(rcp.amount)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPrintNotice('');
                            setSelectedReceiptForPrint(rcp);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap"
                          title="View / Print Certificate"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View / Print</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(rcp)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg whitespace-nowrap"
                          title="Save as PDF (.pdf)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(rcp)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg whitespace-nowrap"
                          >
                            {rcp.status === 'Valid' ? 'Cancel' : 'Restore'}
                          </button>
                        )}
                        {user?.role === 'Admin' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(rcp._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg"
                            title="Delete Receipt"
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
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-3.5 text-xs text-slate-600 no-print">
        <div className="font-mono-num">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} receipts)
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

      {/* Printable 80G Certificate Modal */}
      {selectedReceiptForPrint && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print-dialog-overlay">
          <div className="bg-white border border-slate-300 rounded-xl max-w-2xl w-full p-8 space-y-6 print-certificate-card">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-semibold text-emerald-700">
                  SECTION 80G TAX EXEMPTION CERTIFICATE
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5 font-display">
                  HopeBridge Charitable Foundation (NGO)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reg. No: TN/CHN/2020/80G-44912 · NGO PAN: AABTH8821K
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedReceiptForPrint(null);
                  setPrintNotice('');
                }}
                className="p-1.5 text-slate-500 hover:text-slate-900 no-print"
                title="Close Certificate"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print notice / status feedback banner */}
            {printNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg font-medium flex items-center gap-2 no-print">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{printNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <div className="text-xs text-slate-500">Receipt Number</div>
                <div className="font-bold text-slate-900 font-mono-num">
                  {selectedReceiptForPrint.receiptNumber}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Issue Date</div>
                <div className="font-bold text-slate-900 font-mono-num">
                  {selectedReceiptForPrint.issueDate}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Donor Full Name</div>
                <div className="font-semibold text-slate-900">
                  {selectedReceiptForPrint.donorName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Donor PAN</div>
                <div className="font-semibold text-slate-900 font-mono-num">
                  {selectedReceiptForPrint.donorPan}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
              <p>
                Received with gratitude from{' '}
                <strong className="text-slate-900">
                  {selectedReceiptForPrint.donorName}
                </strong>{' '}
                ({selectedReceiptForPrint.donorEmail}) a sum of{' '}
                <strong className="text-emerald-700 font-mono-num">
                  {formatINR(selectedReceiptForPrint.amount)}
                </strong>{' '}
                by <strong>{selectedReceiptForPrint.paymentMode}</strong> towards the fundraising campaign{' '}
                <strong className="text-slate-900">
                  &ldquo;{selectedReceiptForPrint.campaignTitle}&rdquo;
                </strong>.
              </p>
              <p className="text-xs text-slate-500">
                Remarks: {selectedReceiptForPrint.remarks} · Tax Section:{' '}
                {selectedReceiptForPrint.taxExemptionSection}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-600">
              <div>
                Issued By: <strong>{selectedReceiptForPrint.issuedBy}</strong>
              </div>
              <div className="font-semibold text-emerald-700">
                Certificate Status: {selectedReceiptForPrint.status}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={() => {
                  setSelectedReceiptForPrint(null);
                  setPrintNotice('');
                }}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedReceiptForPrint)}
                disabled={pdfGenerating}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                title="Download verified PDF certificate file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{pdfGenerating ? 'Generating PDF...' : 'Save as PDF (.pdf)'}</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrint(selectedReceiptForPrint)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                title="Browser print preview"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsPage;
