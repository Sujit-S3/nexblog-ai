import mongoose from 'mongoose';
import AiCache from '../../models/aiCache.model.js';
import { embeddingService } from '../../services/embedding.service.js';
import crypto from 'crypto';

function cosineSim(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return (normA === 0 || normB === 0) ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const semanticCacheService = {
  /**
   * Check semantic cache for exact or >=95% similar prompt match
   */
  async lookup({ prompt, feature = 'general', similarityThreshold = 0.95 }) {
    if (!prompt || typeof prompt !== 'string' || mongoose.connection.readyState !== 1) return { hit: false };

    const cleanPrompt = prompt.trim();
    const promptHash = crypto.createHash('sha256').update(`${feature}|${cleanPrompt}`).digest('hex');

    try {
      // 1. Exact hash lookup first (0.5ms)
      const exactMatch = await AiCache.findOne({ promptHash });
      if (exactMatch) {
        exactMatch.hits += 1;
        await exactMatch.save();
        return {
          hit: true,
          matchType: 'exact',
          similarity: 1.0,
          output: exactMatch.output,
          provider: 'semantic-cache',
          model: exactMatch.model || 'cache-v1',
          latencyMs: 1,
          costUsd: 0,
          tokensSaved: exactMatch.tokensSaved || Math.ceil(exactMatch.output.length / 4),
        };
      }

      // 2. Vector similarity lookup (if not disabled)
      if (process.env.DISABLE_SEMANTIC_CACHE === 'true') {
        return { hit: false, promptHash };
      }

      const promptEmbedding = await embeddingService.generateEmbedding(cleanPrompt);
      const candidates = await AiCache.find({ feature }).limit(100).lean();

      let bestScore = 0;
      let bestCandidate = null;

      for (const candidate of candidates) {
        if (!candidate.embedding || candidate.embedding.length === 0) continue;
        const score = cosineSim(promptEmbedding, candidate.embedding);
        if (score > bestScore) {
          bestScore = score;
          bestCandidate = candidate;
        }
      }

      if (bestCandidate && bestScore >= similarityThreshold) {
        // Increment hits asynchronously
        AiCache.findByIdAndUpdate(bestCandidate._id, { $inc: { hits: 1 } }).exec();

        return {
          hit: true,
          matchType: 'semantic',
          similarity: Number(bestScore.toFixed(4)),
          output: bestCandidate.output,
          provider: 'semantic-cache',
          model: bestCandidate.model || 'cache-v1',
          latencyMs: 3,
          costUsd: 0,
          tokensSaved: bestCandidate.tokensSaved || Math.ceil(bestCandidate.output.length / 4),
        };
      }

      return { hit: false, promptHash, promptEmbedding };
    } catch (err) {
      console.warn(`[SemanticCache] Lookup skipped due to error: ${err.message}`);
      return { hit: false };
    }
  },

  /**
   * Store a successful LLM output in the semantic cache asynchronously
   */
  async store({ prompt, promptHash, promptEmbedding, feature = 'general', output, provider, model, tokensOut = 0 }) {
    if (!prompt || !output || process.env.DISABLE_SEMANTIC_CACHE === 'true' || mongoose.connection.readyState !== 1) return;

    try {
      const cleanPrompt = prompt.trim();
      const hash = promptHash || crypto.createHash('sha256').update(`${feature}|${cleanPrompt}`).digest('hex');
      const embedding = promptEmbedding || await embeddingService.generateEmbedding(cleanPrompt);

      await AiCache.findOneAndUpdate(
        { promptHash: hash },
        {
          promptHash: hash,
          promptText: cleanPrompt.slice(0, 3000),
          feature,
          embedding,
          output: output.slice(0, 15000),
          provider: provider || 'unknown',
          model: model || 'unknown',
          tokensSaved: tokensOut || Math.ceil(output.length / 4),
        },
        { upsert: true }
      );
    } catch (err) {
      console.warn(`[SemanticCache] Store error: ${err.message}`);
    }
  },
};
