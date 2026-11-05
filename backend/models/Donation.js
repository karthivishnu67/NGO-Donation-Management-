import mongoose from 'mongoose';

// 4. Donation Mongoose Schema (Online and Offline donations)
const donationSchema = new mongoose.Schema(
  {
    donationCode: {
      type: String,
      required: [true, 'Donation code is required'],
      unique: true,
      trim: true
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
      required: [true, 'Donation amount is required'],
      min: [1, 'Donation amount must be a positive number greater than 0']
    },
    donationType: {
      type: String,
      enum: ['Online', 'Offline'],
      required: [true, 'Donation type (Online or Offline) is required']
    },
    paymentMode: {
      type: String,
      enum: [
        'Online - UPI',
        'Online - Card',
        'Online - NetBanking',
        'Offline - Cash',
        'Offline - Cheque',
        'Offline - Bank Transfer'
      ],
      required: [true, 'Payment mode is required']
    },
    referenceNumber: {
      type: String,
      default: '',
      trim: true
    },
    donationDate: {
      type: String,
      required: [true, 'Donation date is required']
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed'],
      default: 'Completed'
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    recordedBy: {
      type: String,
      default: 'System'
    },
    receiptGenerated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Suitable database indexes
donationSchema.index({ donationCode: 1 }, { unique: true });
donationSchema.index({ campaignId: 1, status: 1 });
donationSchema.index({ donorId: 1 });
donationSchema.index({ donationType: 1, donationDate: -1 });

const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
export default Donation;
