import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles, FileText, ArrowLeft } from 'lucide-react';
import DonationInputForm from '../components/DonationInputForm.jsx';

const DonatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lastDonation, setLastDonation] = useState(null);

  const handleDonationSuccess = (result) => {
    setLastDonation(result.data);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner / Breadcrumb Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold mb-1">
            <Heart className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>NGO Public & Registered Giving</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Make a Donation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter donor name, donation amount, and designated cause. All contributions receive 80G tax receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/donations')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap self-start sm:self-auto shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>View All Donations Ledger</span>
        </button>
      </div>

      {/* Main Donation Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <DonationInputForm
            preselectedCampaignId={location.state?.preselectedCampaignId}
            onDonationSuccess={handleDonationSuccess}
          />
        </div>

        {/* Right Info Box: College Assessment Validation Spec & 80G Details */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Basic Form Validation</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Donor Name:</strong> Required text input before submitting.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Amount:</strong> Checked with <code>Number(amount) &gt; 0</code> to ensure it is a positive number.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Cause:</strong> Selected fundraising campaign or custom cause.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Automatic 80G Tax Receipt</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every donation processed through this form automatically creates an official 80G tax exemption receipt linked to the donor and cause.
            </p>
            {lastDonation && (
              <button
                type="button"
                onClick={() => navigate('/receipts')}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Generated Receipt</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
