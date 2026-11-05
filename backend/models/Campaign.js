import mongoose from 'mongoose';

// 3. Campaign Mongoose Schema
const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      minlength: [4, 'Campaign title must be at least 4 characters']
    },
    category: {
      type: String,
      enum: ['Education', 'Healthcare', 'Disaster Relief', 'Child Welfare', 'Environment'],
      required: [true, 'Campaign category is required']
    },
    description: {
      type: String,
      required: [true, 'Campaign description is required'],
      trim: true
    },
    goalAmount: {
      type: Number,
      required: [true, 'Goal amount is required'],
      min: [1000, 'Goal amount must be at least 1000']
    },
    raisedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Raised amount cannot be negative']
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: String,
      required: [true, 'End date is required']
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Draft'],
      default: 'Active'
    },
    location: {
      type: String,
      required: [true, 'Campaign location is required'],
      trim: true
    },
    beneficiaryCount: {
      type: Number,
      default: 100,
      min: 1
    },
    createdBy: {
      type: String,
      default: 'Campaign Manager'
    }
  },
  { timestamps: true }
);

// Suitable database indexes
campaignSchema.index({ category: 1, status: 1 });
campaignSchema.index({ goalAmount: -1, raisedAmount: -1 });
campaignSchema.index({ title: 'text', description: 'text' });

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
export default Campaign;
