import React, { useState } from 'react';
import { Download } from 'lucide-react';

const SubmissionGuidePage = () => {
  const [imageError, setImageError] = useState(false);

  // Downloadable Postman Collection JSON for the college submission requirement
  const handleDownloadPostman = () => {
    const postmanCollection = {
      info: {
        name: '23. NGO Donation Management - MERN API Collection',
        description:
          'Complete Postman collection for User, Donor, Campaign, Donation, Receipt, Auth, and Reports APIs.',
        schema:
          'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [
        {
          name: '1. Auth - Login (Admin)',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/auth/login' },
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                { email: 'admin@hopebridge.org', password: 'admin123' },
                null,
                2
              )
            }
          }
        },
        {
          name: '2. Auth - Register User',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/api/auth/register' },
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  name: 'Student Tester',
                  email: 'student@college.edu',
                  password: 'password123',
                  role: 'Donor'
                },
                null,
                2
              )
            }
          }
        },
        {
          name: '3. Campaigns - List with Search, Filter, Sort & Pagination',
          request: {
            method: 'GET',
            url: {
              raw: '{{baseUrl}}/api/campaigns?search=&category=All&status=Active&sortBy=raisedAmount&order=desc&page=1&limit=6'
            }
          }
        },
        {
          name: '4. Donors - Get All Registered Donors',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
            url: { raw: '{{baseUrl}}/api/donors?page=1&limit=6' }
          }
        },
        {
          name: '5. Donations - Record Online or Offline Donation',
          request: {
            method: 'POST',
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer {{token}}' }
            ],
            url: { raw: '{{baseUrl}}/api/donations' },
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  donorId: 'dnr_201',
                  campaignId: 'cmp_301',
                  amount: 5000,
                  donationType: 'Online',
                  paymentMode: 'Online - UPI',
                  referenceNumber: 'UPI8899001122',
                  donationDate: '2026-11-05',
                  autoGenerateReceipt: true
                },
                null,
                2
              )
            }
          }
        },
        {
          name: '6. Receipts - List 80G Tax Receipts',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
            url: { raw: '{{baseUrl}}/api/receipts?page=1&limit=6' }
          }
        },
        {
          name: '7. Reports - Campaign Progress Summary',
          request: {
            method: 'GET',
            header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
            url: { raw: '{{baseUrl}}/api/reports/summary' }
          }
        }
      ],
      variable: [
        { key: 'baseUrl', value: window.location.origin },
        { key: 'token', value: localStorage.getItem('ngo_jwt_token') || '' }
      ]
    };

    const blob = new Blob([JSON.stringify(postmanCollection, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ngo_donation_postman_collection.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Project #23 Submission Package & ER Diagram
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete technical documentation, ER diagram of the 5 Mongoose models, role credentials, and Postman API collection for internal assessment.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPostman}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Postman Collection (.json)</span>
        </button>
      </div>

      {/* Entity-Relationship (ER) Diagram of the 5 Mongoose Models */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Entity-Relationship (ER) Diagram — 5 Mongoose Models
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Relationships: User (1:1 optional) → Donor (1:N) → Donation (N:1) ← Campaign, and Donation (1:1) → Receipt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          {/* 1. User Model */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
              1. User (backend/models/User.js)
            </div>
            <ul className="space-y-1 font-mono-num text-slate-700">
              <li>_id : ObjectId (PK)</li>
              <li>name : String (req)</li>
              <li>email : String (unique idx)</li>
              <li>password : String (bcrypt)</li>
              <li>role : Admin | Manager | Donor</li>
              <li>phone : String</li>
              <li>status : Active | Inactive</li>
            </ul>
          </div>

          {/* 2. Donor Model */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
              2. Donor (backend/models/Donor.js)
            </div>
            <ul className="space-y-1 font-mono-num text-slate-700">
              <li>_id : ObjectId (PK)</li>
              <li>donorCode : String (unique)</li>
              <li>name : String (req)</li>
              <li>email : String (idx)</li>
              <li>phone : String (req)</li>
              <li>panNumber : String (80G)</li>
              <li>donorType : Indiv | Corp | Found</li>
              <li>city : String (req)</li>
              <li>totalDonated : Number (idx)</li>
              <li>userId : Ref(User._id)</li>
            </ul>
          </div>

          {/* 3. Campaign Model */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
              3. Campaign (Campaign.js)
            </div>
            <ul className="space-y-1 font-mono-num text-slate-700">
              <li>_id : ObjectId (PK)</li>
              <li>title : String (text idx)</li>
              <li>category : Enum (idx)</li>
              <li>description : String (req)</li>
              <li>goalAmount : Number (min 1000)</li>
              <li>raisedAmount : Number</li>
              <li>startDate / endDate : String</li>
              <li>status : Active | Completed</li>
              <li>location : String (req)</li>
            </ul>
          </div>

          {/* 4. Donation Model */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
              4. Donation (Donation.js)
            </div>
            <ul className="space-y-1 font-mono-num text-slate-700">
              <li>_id : ObjectId (PK)</li>
              <li>donationCode : String (unique)</li>
              <li>donorId : Ref(Donor._id) (FK)</li>
              <li>campaignId : Ref(Campaign._id)</li>
              <li>amount : Number (min 100)</li>
              <li>donationType : Online | Offline</li>
              <li>paymentMode : UPI/Card/Cash/Chq</li>
              <li>referenceNumber : String</li>
              <li>donationDate : String (idx)</li>
              <li>receiptGenerated : Boolean</li>
            </ul>
          </div>

          {/* 5. Receipt Model */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2">
              5. Receipt (Receipt.js)
            </div>
            <ul className="space-y-1 font-mono-num text-slate-700">
              <li>_id : ObjectId (PK)</li>
              <li>receiptNumber : String (unique)</li>
              <li>donationId : Ref(Donation._id)</li>
              <li>donorId : Ref(Donor._id) (FK)</li>
              <li>campaignId : Ref(Campaign._id)</li>
              <li>donorPan : String</li>
              <li>amount : Number</li>
              <li>issueDate : String (idx)</li>
              <li>taxExemptionSection : 80G</li>
              <li>status : Valid | Cancelled</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Credentials & Architecture Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Demo Credentials for Viva & Evaluation
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Password</th>
                  <th className="py-2.5 px-3">Access Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Admin</td>
                  <td className="py-2.5 px-3 font-mono-num">admin@hopebridge.org</td>
                  <td className="py-2.5 px-3 font-mono-num">admin123</td>
                  <td className="py-2.5 px-3">Full CRUD on all 5 models + Users</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Campaign Manager</td>
                  <td className="py-2.5 px-3 font-mono-num">manager@hopebridge.org</td>
                  <td className="py-2.5 px-3 font-mono-num">manager123</td>
                  <td className="py-2.5 px-3">Campaigns, Donors, Donations, Receipts, Reports</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Donor</td>
                  <td className="py-2.5 px-3 font-mono-num">donor@hopebridge.org</td>
                  <td className="py-2.5 px-3 font-mono-num">donor123</td>
                  <td className="py-2.5 px-3">View Campaigns, Donate, Print 80G Receipts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            Technical Requirements Implemented
          </h2>
          <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <li>
              <strong>1. ReactJS + Vite + JavaScript:</strong> Built with functional `.jsx` components, `react-router-dom`, Context API (`AuthContext.jsx`), and controlled forms using `event.preventDefault()`.
            </li>
            <li>
              <strong>2. ExpressJS Modular Backend:</strong> Separate `backend/config/db.js`, `backend/models/*.js`, `backend/middleware/authMiddleware.js`, `backend/controllers/*.js`, and `backend/routes/*.js`.
            </li>
            <li>
              <strong>3. Security & Validation:</strong> JWT Bearer authentication, `bcryptjs` password hashing, `authorizeRoles` middleware, client form validation, and Mongoose schema + Express API validation.
            </li>
            <li>
              <strong>4. Search, Filter, Sort & Pagination:</strong> Implemented across all 5 main records (`User`, `Donor`, `Campaign`, `Donation`, `Receipt`).
            </li>
          </ul>
        </div>
      </div>

      {/* Reference Specification Sheet */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Project #23 Allocation Specification Reference
        </h2>
        {!imageError ? (
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <img
              src="/assets/aistudio/Screenshot_2026-11-05_180454_3c64e462.png"
              alt="23. NGO Donation Management Specification"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full max-w-4xl mx-auto object-contain"
            />
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            Project #23: NGO Donation Management — Roles: Admin, Campaign Manager, Donor — Models: User, Donor, Campaign, Donation, Receipt.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionGuidePage;
