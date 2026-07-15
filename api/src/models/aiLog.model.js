import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: 'anonymous',
      index: true,
    },
    prompt: {
      type: String,
      default: '',
    },
    completion: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      required: true,
      default: 'gemini-1.5-flash',
    },
    provider: {
      type: String,
      required: true,
      default: 'local', // 'gemini', 'openai', or 'local'
    },
    tokensIn: {
      type: Number,
      default: 0,
    },
    tokensOut: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    costUsd: {
      type: Number,
      default: 0,
    },
    feature: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'fallback', 'error', 'cache_hit'],
      default: 'success',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    executionSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isReplay: {
      type: Boolean,
      default: false,
      index: true,
    },
    parentLogId: {
      type: String,
      default: null,
      index: true,
    },
    diffReport: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

aiLogSchema.index({ userId: 1, createdAt: -1 });
aiLogSchema.index({ feature: 1, status: 1 });
aiLogSchema.index({ parentLogId: 1, createdAt: -1 });

const AiLog = mongoose.model('AiLog', aiLogSchema);

export default AiLog;
