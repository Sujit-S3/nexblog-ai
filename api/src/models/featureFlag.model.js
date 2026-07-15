import mongoose from 'mongoose';

const featureFlagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    enabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    targetWorkspaces: [
      {
        type: String,
      },
    ],
    targetUsers: [
      {
        type: String,
      },
    ],
    rolloutPercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    updatedBy: {
      type: String,
      default: 'system',
    },
  },
  { timestamps: true }
);

const FeatureFlag = mongoose.models.FeatureFlag || mongoose.model('FeatureFlag', featureFlagSchema);
export default FeatureFlag;
