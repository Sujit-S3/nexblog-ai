import mongoose from 'mongoose';

const aiCacheSchema = new mongoose.Schema(
  {
    promptHash: {
      type: String,
      required: true,
      index: true,
    },
    promptText: {
      type: String,
      required: true,
    },
    feature: {
      type: String,
      required: true,
      index: true,
    },
    embedding: {
      type: [Number],
      required: true, // Used for 95% semantic similarity lookup
    },
    output: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: 'cache',
    },
    model: {
      type: String,
      default: 'semantic-cache-v1',
    },
    tokensSaved: {
      type: Number,
      default: 0,
    },
    hits: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// TTL index to automatically prune stale cache items after 30 days
aiCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const AiCache = mongoose.model('AiCache', aiCacheSchema);
export default AiCache;
