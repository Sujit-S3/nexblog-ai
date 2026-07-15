import mongoose from 'mongoose';

const aiExperimentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    feature: { type: String, required: true }, // e.g., 'generate-article', 'rewrite'
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
    trafficSplit: { type: Number, default: 0.5 }, // 0.5 = 50% variant A, 50% variant B
    variantA: {
      name: { type: String, default: 'Variant A' },
      promptTemplate: { type: String, required: true },
      provider: { type: String, default: 'gemini' },
      model: { type: String, default: 'gemini-1.5-pro' },
      metrics: {
        executions: { type: Number, default: 0 },
        totalLatencyMs: { type: Number, default: 0 },
        totalCostUsd: { type: Number, default: 0 },
        successCount: { type: Number, default: 0 },
        totalQualityScore: { type: Number, default: 0 },
      },
    },
    variantB: {
      name: { type: String, default: 'Variant B' },
      promptTemplate: { type: String, required: true },
      provider: { type: String, default: 'openai' },
      model: { type: String, default: 'gpt-4o' },
      metrics: {
        executions: { type: Number, default: 0 },
        totalLatencyMs: { type: Number, default: 0 },
        totalCostUsd: { type: Number, default: 0 },
        successCount: { type: Number, default: 0 },
        totalQualityScore: { type: Number, default: 0 },
      },
    },
    winner: { type: String, enum: ['A', 'B', 'inconclusive', null], default: null },
  },
  { timestamps: true }
);

aiExperimentSchema.index({ feature: 1, status: 1 });

const AiExperiment = mongoose.model('AiExperiment', aiExperimentSchema);
export default AiExperiment;
