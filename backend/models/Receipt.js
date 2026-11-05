import mongoose from 'mongoose';

// 5. Receipt Mongoose Schema
const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      trim: true
    },
    donationId: {
      type: String,
      required: [true, 'Linked Donation ID is required']
    },
    donationCode: {
      type: String,
      default: ''
    },
    donorId: {
      type: String,
      required: [true, 'Donor ID is required']
    },
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true
    },
    donorEmail: {
      type: String,
      required: [true, 'Donor email is required'],
      trim: true
    },
    donorPan: {
      type: String,
      default: 'NOT PROVIDED',
      uppercase: true,
      trim: true
    },
    campaignId: {
      type: String,
      required: [true, 'Campaign ID is required']
    },
    campaignTitle: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Receipt amount is required'],
      min: [1, 'Amount must be positive']
    },
    donationType: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online'
    },
    paymentMode: {
      type: String,
      required: [true, 'Payment mode is required']
    },
    issueDate: {
      type: String,
      required: [true, 'Receipt issue date is required']
    },
    taxExemptionSection: {
      type: String,
      default: '80G (50% Tax Deductible)'
    },
    issuedBy: {
      type: String,
      default: 'HopeBridge NGO Finance Desk'
    },
    status: {
      type: String,
      enum: ['Valid', 'Cancelled'],
      default: 'Valid'
    },
    remarks: {
      type: String,
      default: 'Thank you for supporting our NGO fundraising initiative.'
    }
  },
  { timestamps: true }
);

// Suitable database indexes
receiptSchema.index({ receiptNumber: 1 }, { unique: true });
receiptSchema.index({ donationId: 1 });
receiptSchema.index({ donorId: 1, issueDate: -1 });

const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', receiptSchema);
export default Receipt;
