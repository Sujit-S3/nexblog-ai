import AiExperiment from '../../models/aiExperiment.model.js';
import mongoose from 'mongoose';

export const experimentService = {
  /**
   * Check if there is an active A/B experiment for a specific feature.
   */
  async getActiveExperiment({ feature }) {
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      return null;
    }
    try {
      return await AiExperiment.findOne({ feature, status: 'active' }).lean();
    } catch (err) {
      console.warn('ExperimentService lookup warning:', err.message);
      return null;
    }
  },

  /**
   * Select which variant ('A' or 'B') receives traffic based on trafficSplit.
   */
  routeTraffic({ experiment }) {
    if (!experiment) return null;
    const rand = Math.random();
    return rand < (experiment.trafficSplit || 0.5) ? 'A' : 'B';
  },

  /**
   * Record execution metrics asynchronously for a specific variant.
   */
  async recordExecution({ experimentId, variant = 'A', latencyMs = 0, costUsd = 0, success = true, qualityScore = 80 }) {
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) return;
    try {
      const incFields = {};
      const prefix = variant === 'A' ? 'variantA.metrics' : 'variantB.metrics';
      incFields[`${prefix}.executions`] = 1;
      incFields[`${prefix}.totalLatencyMs`] = latencyMs || 0;
      incFields[`${prefix}.totalCostUsd`] = costUsd || 0;
      if (success) incFields[`${prefix}.successCount`] = 1;
      incFields[`${prefix}.totalQualityScore`] = qualityScore || 0;

      await AiExperiment.findByIdAndUpdate(experimentId, { $inc: incFields });
    } catch (err) {
      console.warn('ExperimentService metrics recording error:', err.message);
    }
  },

  /**
   * Evaluate winner between Variant A and Variant B based on average quality and success rate.
   */
  async evaluateWinner({ experimentId }) {
    const experiment = await AiExperiment.findById(experimentId);
    if (!experiment) throw new Error(`Experiment not found: ${experimentId}`);

    const mA = experiment.variantA.metrics || {};
    const mB = experiment.variantB.metrics || {};

    const countA = mA.executions || 1;
    const countB = mB.executions || 1;

    const avgQualityA = (mA.totalQualityScore || 0) / countA;
    const avgQualityB = (mB.totalQualityScore || 0) / countB;

    const successRateA = (mA.successCount || 0) / countA;
    const successRateB = (mB.successCount || 0) / countB;

    const avgLatencyA = (mA.totalLatencyMs || 0) / countA;
    const avgLatencyB = (mB.totalLatencyMs || 0) / countB;

    // Composite score: 60% quality + 30% success rate - 10% latency penalty (>1000ms)
    const compositeA = (avgQualityA * 0.6) + (successRateA * 100 * 0.3) - Math.max(0, (avgLatencyA - 1000) / 200);
    const compositeB = (avgQualityB * 0.6) + (successRateB * 100 * 0.3) - Math.max(0, (avgLatencyB - 1000) / 200);

    let winner = 'inconclusive';
    if (Math.abs(compositeA - compositeB) > 3) {
      winner = compositeA > compositeB ? 'A' : 'B';
    }

    experiment.winner = winner;
    if (mA.executions + mB.executions >= 100 && winner !== 'inconclusive') {
      experiment.status = 'completed';
    }
    await experiment.save();

    return {
      experimentId: experiment._id,
      winner,
      variantA: { avgQuality: Number(avgQualityA.toFixed(2)), successRate: Number((successRateA * 100).toFixed(1)), avgLatencyMs: Math.round(avgLatencyA), compositeScore: Number(compositeA.toFixed(2)) },
      variantB: { avgQuality: Number(avgQualityB.toFixed(2)), successRate: Number((successRateB * 100).toFixed(1)), avgLatencyMs: Math.round(avgLatencyB), compositeScore: Number(compositeB.toFixed(2)) },
      status: experiment.status,
    };
  },
};
