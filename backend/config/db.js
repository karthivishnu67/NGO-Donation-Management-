import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Campaign from '../models/Campaign.js';
import Donation from '../models/Donation.js';
import Receipt from '../models/Receipt.js';

// Track whether live MongoDB Atlas is connected
export let isMongoConnected = false;

// In-memory fallback collection store (backed by real Mongoose Schema validation)
export const memoryDB = {
  users: [],
  donors: [],
  campaigns: [],
  donations: [],
  receipts: []
};

// Helper to validate a document against its real Mongoose Schema before saving
export function validateWithMongoose(Model, data) {
  const doc = new Model(data);
  const error = doc.validateSync();
  if (error) {
    const messages = Object.values(error.errors).map((err) => err.message);
    const validationErr = new Error(messages.join(', '));
    validationErr.statusCode = 400;
    throw validationErr;
  }
  return doc.toObject();
}

// Seed initial data for college project demonstration
export async function seedInitialData() {
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const managerPassword = await bcrypt.hash('manager123', salt);
  const donorPassword = await bcrypt.hash('donor123', salt);

  const initialUsers = [
    {
      _id: 'usr_101',
      name: 'Arjun Sharma (Admin)',
      email: 'admin@hopebridge.org',
      password: adminPassword,
      role: 'Admin',
      phone: '+91 98401 11223',
      status: 'Active',
      createdAt: '2026-08-01T09:00:00.000Z'
    },
    {
      _id: 'usr_102',
      name: 'Priya Nair (Manager)',
      email: 'manager@hopebridge.org',
      password: managerPassword,
      role: 'Campaign Manager',
      phone: '+91 98402 33445',
      status: 'Active',
      createdAt: '2026-08-05T10:30:00.000Z'
    },
    {
      _id: 'usr_103',
      name: 'Karthik Subramanian',
      email: 'donor@hopebridge.org',
      password: donorPassword,
      role: 'Donor',
      phone: '+91 98403 55667',
      status: 'Active',
      createdAt: '2026-08-10T11:15:00.000Z'
    },
    {
      _id: 'usr_104',
      name: 'Meera Krishnan',
      email: 'meera.k@gmail.com',
      password: donorPassword,
      role: 'Donor',
      phone: '+91 94441 77889',
      status: 'Active',
      createdAt: '2026-09-02T14:20:00.000Z'
    },
    {
      _id: 'usr_105',
      name: 'Rohan Deshmukh',
      email: 'rohan.manager@hopebridge.org',
      password: managerPassword,
      role: 'Campaign Manager',
      phone: '+91 98201 99001',
      status: 'Active',
      createdAt: '2026-09-12T08:45:00.000Z'
    }
  ];

  const initialDonors = [
    {
      _id: 'dnr_201',
      donorCode: 'DNR-2026-001',
      name: 'Karthik Subramanian',
      email: 'donor@hopebridge.org',
      phone: '+91 98403 55667',
      panNumber: 'ABCDE1234F',
      donorType: 'Individual',
      address: '42 Anna Nagar East',
      city: 'Chennai',
      totalDonated: 40000,
      donationsCount: 2,
      userId: 'usr_103',
      createdAt: '2026-08-12T10:00:00.000Z'
    },
    {
      _id: 'dnr_202',
      donorCode: 'DNR-2026-002',
      name: 'Apex Tech Solutions Pvt Ltd',
      email: 'csr@apextech.in',
      phone: '+91 80411 22334',
      panNumber: 'AAACA9988K',
      donorType: 'Corporate',
      address: 'Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      totalDonated: 150000,
      donationsCount: 2,
      userId: null,
      createdAt: '2026-08-18T11:30:00.000Z'
    },
    {
      _id: 'dnr_203',
      donorCode: 'DNR-2026-003',
      name: 'Meera Krishnan',
      email: 'meera.k@gmail.com',
      phone: '+91 94441 77889',
      panNumber: 'BMNPK4512M',
      donorType: 'Individual',
      address: '18 Race Course Road',
      city: 'Coimbatore',
      totalDonated: 25000,
      donationsCount: 1,
      userId: 'usr_104',
      createdAt: '2026-09-03T15:00:00.000Z'
    },
    {
      _id: 'dnr_204',
      donorCode: 'DNR-2026-004',
      name: 'Surya Charitable Trust',
      email: 'grants@suryatrust.org',
      phone: '+91 40233 44556',
      panNumber: 'AABTS3344P',
      donorType: 'Foundation',
      address: 'Banjara Hills Road No 12',
      city: 'Hyderabad',
      totalDonated: 85000,
      donationsCount: 1,
      userId: null,
      createdAt: '2026-09-15T09:45:00.000Z'
    },
    {
      _id: 'dnr_205',
      donorCode: 'DNR-2026-005',
      name: 'Vikramaditya Rao',
      email: 'vikram.rao@outlook.com',
      phone: '+91 98211 66778',
      panNumber: 'GHJVR7890L',
      donorType: 'Individual',
      address: 'Powai Lake View Residency',
      city: 'Mumbai',
      totalDonated: 18000,
      donationsCount: 1,
      userId: null,
      createdAt: '2026-10-01T16:20:00.000Z'
    }
  ];

  const initialCampaigns = [
    {
      _id: 'cmp_301',
      title: 'Rural Classroom Digital Kit Drive',
      category: 'Education',
      description: 'Equipping 25 government panchayat schools with solar-powered smart projectors, tablets, and science lab kits.',
      goalAmount: 250000,
      raisedAmount: 175000,
      startDate: '2026-08-01',
      endDate: '2026-12-31',
      status: 'Active',
      location: 'Tamil Nadu & Karnataka',
      beneficiaryCount: 1200,
      createdBy: 'Priya Nair (Manager)',
      createdAt: '2026-08-01T10:00:00.000Z'
    },
    {
      _id: 'cmp_302',
      title: 'Mobile Maternal & Child Health Van',
      category: 'Healthcare',
      description: 'Operating weekly diagnostic clinics, iron-folic supplementation, and pediatric checkups in tribal hamlets.',
      goalAmount: 180000,
      raisedAmount: 100000,
      startDate: '2026-08-15',
      endDate: '2026-11-30',
      status: 'Active',
      location: 'Nilgiris & Wayanad',
      beneficiaryCount: 850,
      createdBy: 'Priya Nair (Manager)',
      createdAt: '2026-08-15T12:00:00.000Z'
    },
    {
      _id: 'cmp_303',
      title: 'Coastal Flood Emergency Relief Kits',
      category: 'Disaster Relief',
      description: 'Providing dry rations, clean drinking water filters, tarpaulins, and hygiene kits to flood-affected families.',
      goalAmount: 120000,
      raisedAmount: 43000,
      startDate: '2026-09-10',
      endDate: '2026-12-15',
      status: 'Active',
      location: 'Cuddalore & Nagapattinam',
      beneficiaryCount: 600,
      createdBy: 'Rohan Deshmukh',
      createdAt: '2026-09-10T09:30:00.000Z'
    },
    {
      _id: 'cmp_304',
      title: 'Urban Sapling & Lake Restoration',
      category: 'Environment',
      description: 'Planting 5,000 native saplings and desilting community percolation ponds with student volunteers.',
      goalAmount: 75000,
      raisedAmount: 75000,
      startDate: '2026-06-01',
      endDate: '2026-09-30',
      status: 'Completed',
      location: 'Chennai & Coimbatore',
      beneficiaryCount: 3000,
      createdBy: 'Arjun Sharma (Admin)',
      createdAt: '2026-06-01T08:00:00.000Z'
    }
  ];

  const initialDonations = [
    {
      _id: 'don_401',
      donationCode: 'DON-2026-1001',
      donorId: 'dnr_202',
      donorName: 'Apex Tech Solutions Pvt Ltd',
      donorEmail: 'csr@apextech.in',
      campaignId: 'cmp_301',
      campaignTitle: 'Rural Classroom Digital Kit Drive',
      amount: 100000,
      donationType: 'Online',
      paymentMode: 'Online - NetBanking',
      referenceNumber: 'NEFT882341902',
      donationDate: '2026-08-20',
      status: 'Completed',
      notes: 'Annual CSR Education Grant Tranche 1',
      recordedBy: 'Priya Nair (Manager)',
      receiptGenerated: true,
      createdAt: '2026-08-20T11:00:00.000Z'
    },
    {
      _id: 'don_402',
      donationCode: 'DON-2026-1002',
      donorId: 'dnr_201',
      donorName: 'Karthik Subramanian',
      donorEmail: 'donor@hopebridge.org',
      campaignId: 'cmp_302',
      campaignTitle: 'Mobile Maternal & Child Health Van',
      amount: 15000,
      donationType: 'Online',
      paymentMode: 'Online - UPI',
      referenceNumber: 'UPI629104882110',
      donationDate: '2026-09-05',
      status: 'Completed',
      notes: 'Monthly health clinic sponsor contribution',
      recordedBy: 'Karthik Subramanian',
      receiptGenerated: true,
      createdAt: '2026-09-05T14:30:00.000Z'
    },
    {
      _id: 'don_403',
      donationCode: 'DON-2026-1003',
      donorId: 'dnr_204',
      donorName: 'Surya Charitable Trust',
      donorEmail: 'grants@suryatrust.org',
      campaignId: 'cmp_302',
      campaignTitle: 'Mobile Maternal & Child Health Van',
      amount: 85000,
      donationType: 'Offline',
      paymentMode: 'Offline - Cheque',
      referenceNumber: 'CHQ-HDFC-449012',
      donationDate: '2026-09-18',
      status: 'Completed',
      notes: 'Handed over physical cheque at Hyderabad office',
      recordedBy: 'Arjun Sharma (Admin)',
      receiptGenerated: true,
      createdAt: '2026-09-18T16:00:00.000Z'
    },
    {
      _id: 'don_404',
      donationCode: 'DON-2026-1004',
      donorId: 'dnr_203',
      donorName: 'Meera Krishnan',
      donorEmail: 'meera.k@gmail.com',
      campaignId: 'cmp_303',
      campaignTitle: 'Coastal Flood Emergency Relief Kits',
      amount: 25000,
      donationType: 'Online',
      paymentMode: 'Online - Card',
      referenceNumber: 'PAY_CRD_998123',
      donationDate: '2026-09-25',
      status: 'Completed',
      notes: 'Emergency ration kits for 25 families',
      recordedBy: 'Meera Krishnan',
      receiptGenerated: true,
      createdAt: '2026-09-25T10:15:00.000Z'
    },
    {
      _id: 'don_405',
      donationCode: 'DON-2026-1005',
      donorId: 'dnr_205',
      donorName: 'Vikramaditya Rao',
      donorEmail: 'vikram.rao@outlook.com',
      campaignId: 'cmp_303',
      campaignTitle: 'Coastal Flood Emergency Relief Kits',
      amount: 18000,
      donationType: 'Offline',
      paymentMode: 'Offline - Cash',
      referenceNumber: 'CASH-VOUCHER-109',
      donationDate: '2026-10-04',
      status: 'Completed',
      notes: 'Collected during Mumbai relief collection camp',
      recordedBy: 'Rohan Deshmukh',
      receiptGenerated: false,
      createdAt: '2026-10-04T17:45:00.000Z'
    },
    {
      _id: 'don_406',
      donationCode: 'DON-2026-1006',
      donorId: 'dnr_201',
      donorName: 'Karthik Subramanian',
      donorEmail: 'donor@hopebridge.org',
      campaignId: 'cmp_301',
      campaignTitle: 'Rural Classroom Digital Kit Drive',
      amount: 25000,
      donationType: 'Online',
      paymentMode: 'Online - UPI',
      referenceNumber: 'UPI991023481209',
      donationDate: '2026-10-15',
      status: 'Completed',
      notes: 'Sponsoring 1 smart projector classroom kit',
      recordedBy: 'Karthik Subramanian',
      receiptGenerated: true,
      createdAt: '2026-10-15T09:20:00.000Z'
    },
    {
      _id: 'don_407',
      donationCode: 'DON-2026-1007',
      donorId: 'dnr_202',
      donorName: 'Apex Tech Solutions Pvt Ltd',
      donorEmail: 'csr@apextech.in',
      campaignId: 'cmp_301',
      campaignTitle: 'Rural Classroom Digital Kit Drive',
      amount: 50000,
      donationType: 'Offline',
      paymentMode: 'Offline - Bank Transfer',
      referenceNumber: 'RTGS774019283',
      donationDate: '2026-10-22',
      status: 'Completed',
      notes: 'Second installment for Rural Classroom Drive',
      recordedBy: 'Priya Nair (Manager)',
      receiptGenerated: true,
      createdAt: '2026-10-22T12:10:00.000Z'
    }
  ];

  const initialReceipts = [
    {
      _id: 'rcp_501',
      receiptNumber: 'RCP-80G-2026-001',
      donationId: 'don_401',
      donationCode: 'DON-2026-1001',
      donorId: 'dnr_202',
      donorName: 'Apex Tech Solutions Pvt Ltd',
      donorEmail: 'csr@apextech.in',
      donorPan: 'AAACA9988K',
      campaignId: 'cmp_301',
      campaignTitle: 'Rural Classroom Digital Kit Drive',
      amount: 100000,
      donationType: 'Online',
      paymentMode: 'Online - NetBanking',
      issueDate: '2026-08-20',
      taxExemptionSection: '80G (50% Tax Deductible)',
      issuedBy: 'Arjun Sharma (Admin)',
      status: 'Valid',
      remarks: 'Official 80G CSR Tax Exemption Receipt.',
      createdAt: '2026-08-20T11:05:00.000Z'
    },
    {
      _id: 'rcp_502',
      receiptNumber: 'RCP-80G-2026-002',
      donationId: 'don_402',
      donationCode: 'DON-2026-1002',
      donorId: 'dnr_201',
      donorName: 'Karthik Subramanian',
      donorEmail: 'donor@hopebridge.org',
      donorPan: 'ABCDE1234F',
      campaignId: 'cmp_302',
      campaignTitle: 'Mobile Maternal & Child Health Van',
      amount: 15000,
      donationType: 'Online',
      paymentMode: 'Online - UPI',
      issueDate: '2026-09-05',
      taxExemptionSection: '80G (50% Tax Deductible)',
      issuedBy: 'Priya Nair (Manager)',
      status: 'Valid',
      remarks: 'Thank you for supporting maternal healthcare.',
      createdAt: '2026-09-05T14:35:00.000Z'
    },
    {
      _id: 'rcp_503',
      receiptNumber: 'RCP-80G-2026-003',
      donationId: 'don_403',
      donationCode: 'DON-2026-1003',
      donorId: 'dnr_204',
      donorName: 'Surya Charitable Trust',
      donorEmail: 'grants@suryatrust.org',
      donorPan: 'AABTS3344P',
      campaignId: 'cmp_302',
      campaignTitle: 'Mobile Maternal & Child Health Van',
      amount: 85000,
      donationType: 'Offline',
      paymentMode: 'Offline - Cheque',
      issueDate: '2026-09-18',
      taxExemptionSection: '80G (50% Tax Deductible)',
      issuedBy: 'Arjun Sharma (Admin)',
      status: 'Valid',
      remarks: 'Issued upon cheque realization.',
      createdAt: '2026-09-18T16:10:00.000Z'
    },
    {
      _id: 'rcp_504',
      receiptNumber: 'RCP-80G-2026-004',
      donationId: 'don_404',
      donationCode: 'DON-2026-1004',
      donorId: 'dnr_203',
      donorName: 'Meera Krishnan',
      donorEmail: 'meera.k@gmail.com',
      donorPan: 'BMNPK4512M',
      campaignId: 'cmp_303',
      campaignTitle: 'Coastal Flood Emergency Relief Kits',
      amount: 25000,
      donationType: 'Online',
      paymentMode: 'Online - Card',
      issueDate: '2026-09-25',
      taxExemptionSection: '80G (50% Tax Deductible)',
      issuedBy: 'Rohan Deshmukh',
      status: 'Valid',
      remarks: 'Emergency Flood Relief Tax Receipt.',
      createdAt: '2026-09-25T10:20:00.000Z'
    },
    {
      _id: 'rcp_505',
      receiptNumber: 'RCP-80G-2026-005',
      donationId: 'don_406',
      donationCode: 'DON-2026-1006',
      donorId: 'dnr_201',
      donorName: 'Karthik Subramanian',
      donorEmail: 'donor@hopebridge.org',
      donorPan: 'ABCDE1234F',
      campaignId: 'cmp_301',
      campaignTitle: 'Rural Classroom Digital Kit Drive',
      amount: 25000,
      donationType: 'Online',
      paymentMode: 'Online - UPI',
      issueDate: '2026-10-15',
      taxExemptionSection: '80G (50% Tax Deductible)',
      issuedBy: 'Priya Nair (Manager)',
      status: 'Valid',
      remarks: 'Digital Classroom Kit sponsorship receipt.',
      createdAt: '2026-10-15T09:25:00.000Z'
    },
    {
      _id: 'rcp_506',
      receiptNumber: 'RCP-80G-2026-006',
      donationId: 'don_407',
      donationCode: 'DON-2026-1007',
      donorId: 'dnr_202',
      donorName: 'Apex Tech Solutions Pvt Ltd',
      donorEmail: 'csr@apextech.in',
      donorPan: 'AAACA9988K',
      campaignId: 'cmp_301',
      campaignTitle: 'Rural Classroom Digital Kit Drive',
      amount: 50000,
      donationType: 'Offline',
      paymentMode: 'Offline - Bank Transfer',
      issueDate: '2026-10-22',
      taxExemptionSection: '80G (50% Tax Deductible)',
      issuedBy: 'Priya Nair (Manager)',
      status: 'Valid',
      remarks: 'RTGS Second Installment Receipt.',
      createdAt: '2026-10-22T12:15:00.000Z'
    }
  ];

  memoryDB.users = initialUsers;
  memoryDB.donors = initialDonors;
  memoryDB.campaigns = initialCampaigns;
  memoryDB.donations = initialDonations;
  memoryDB.receipts = initialReceipts;
}

const connectDB = async () => {
  await seedInitialData();

  const uri = process.env.MONGODB_URI;
  if (uri && !uri.includes('<username>') && uri.startsWith('mongodb')) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      isMongoConnected = true;
      console.log('Connected to MongoDB Atlas successfully.');

      // Seed MongoDB if empty
      const count = await User.countDocuments();
      if (count === 0) {
        await User.insertMany(memoryDB.users.map(({ _id, ...rest }) => rest));
        await Donor.insertMany(memoryDB.donors.map(({ _id, ...rest }) => rest));
        await Campaign.insertMany(memoryDB.campaigns.map(({ _id, ...rest }) => rest));
        await Donation.insertMany(memoryDB.donations.map(({ _id, ...rest }) => rest));
        await Receipt.insertMany(memoryDB.receipts.map(({ _id, ...rest }) => rest));
      }
    } catch (error) {
      isMongoConnected = false;
      console.log('MongoDB Atlas unreachable, using Mongoose-validated local memory store:', error.message);
    }
  } else {
    isMongoConnected = false;
    console.log('Using Mongoose-validated seeded store (set MONGODB_URI in .env for MongoDB Atlas).');
  }
};

export default connectDB;
