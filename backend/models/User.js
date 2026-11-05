import mongoose from 'mongoose';

// 1. User Mongoose Schema (Roles: Admin, Campaign Manager, Donor)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: ['Admin', 'Campaign Manager', 'Donor'],
      default: 'Donor',
      required: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

// Suitable database indexes for fast lookup and filtering
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ name: 'text', email: 'text' });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
