import mongoose from 'mongoose';

// 2. Donor Mongoose Schema
const donorSchema = new mongoose.Schema(
  {
    donorCode: {
      type: String,
      required: [true, 'Donor code is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Donor full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Donor email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    panNumber: {
      type: String,
      default: '',
      uppercase: true,
      trim: true
    },
    donorType: {
      type: String,
      enum: ['Individual', 'Corporate', 'Foundation'],
      default: 'Individual',
      required: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    totalDonated: {
      type: Number,
      default: 0,
      min: [0, 'Total donated cannot be negative']
    },
    donationsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    userId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

// Suitable database indexes
donorSchema.index({ donorCode: 1 }, { unique: true });
donorSchema.index({ email: 1 });
donorSchema.index({ donorType: 1, city: 1 });
donorSchema.index({ totalDonated: -1 });

const Donor = mongoose.models.Donor || mongoose.model('Donor', donorSchema);
export default Donor;
