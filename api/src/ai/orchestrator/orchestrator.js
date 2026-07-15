import mongoose from 'mongoose';
import AiMemory from '../../models/aiMemory.model.js';
import AiLog from '../../models/aiLog.model.js';
import { systemPrompt } from '../../prompts/v1/system.prompt.js';
import { generateGemini } from '../providers/gemini.provider.js';
import { generateOpenAI } from '../providers/openai.provider.js';
import { generateLocal } from '../providers/local.provider.js';
import { semanticCacheService } from '../cache/semanticCache.service.js';
import { retrieverService } from '../rag/retriever.service.js';

export const aiOrchestrator = {
  async execute({ prompt, feature = 'generate-article', variables = {}, userId = 'anonymous', isReplay = false, parentLogId = null }) {
    // 0. Intercept with Semantic Cache layer (Exact / >=95% similarity check)
    const cacheLookup = !isReplay ? await semanticCacheService.lookup({ prompt, feature, similarityThreshold: 0.95 }) : { hit: false };
    if (cacheLookup && cacheLookup.hit) {
      // Asynchronously log the cache hit in telemetry
      if (mongoose.connection.readyState === 1) {
        AiLog.create({
          userId: userId || 'anonymous',
          prompt: prompt.slice(0, 3000),
          completion: (cacheLookup.output || '').slice(0, 5000),
          model: cacheLookup.model || 'semantic-cache',
          provider: cacheLookup.provider || 'cache',
          tokensIn: 0,
          tokensOut: cacheLookup.tokensSaved || 0,
          latencyMs: cacheLookup.latencyMs || 1,
          costUsd: 0,
          feature,
          status: 'cache_hit',
          errorMessage: null,
          isReplay: isReplay || false,
          parentLogId: parentLogId || null,
          executionSnapshot: {
            request: { prompt, feature, variables, userId },
            systemPrompt: 'N/A (Cache Hit)',
            provider: cacheLookup.provider || 'cache',
            model: cacheLookup.model || 'semantic-cache',
            providerVersion: 'v1.5',
            promptVersion: 'v1.0',
            memoryProfile: {},
            retrievedChunks: 0,
            cacheStatus: 'hit',
            evaluationResult: null,
            verificationResult: null,
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            latencyMs: cacheLookup.latencyMs || 1,
            costUsd: 0,
          },
        }).catch(err => console.error('AiLog cache recording error:', err.message));
      }

      return {
        output: cacheLookup.output,
        model: cacheLookup.model || 'semantic-cache',
        provider: cacheLookup.provider || 'cache',
        tokensIn: 0,
        tokensOut: cacheLookup.tokensSaved || 0,
        latencyMs: cacheLookup.latencyMs || 1,
        costUsd: 0,
        cacheHit: true,
      };
    }

    // 1. Retrieve creator AI memory invariants
    let memory = {};
    if (userId !== 'anonymous' && mongoose.connection.readyState === 1) {
      try {
        memory = (await AiMemory.findOne({ userId })) || {};
      } catch (err) {
        console.warn('Orchestrator: Could not fetch user memory, defaulting to base invariants.');
      }
    }

    // 2. Build versioned system instruction incorporating memory profile
    let systemInstruction = systemPrompt.buildPrompt({
      brandVoice: memory.brandVoice || variables.brandVoice,
      writingStyle: memory.writingStyle || variables.writingStyle,
      targetAudience: memory.targetAudience || variables.targetAudience,
      customInstructions: memory.customInstructions || variables.customInstructions,
    });

    // 2.1 Check if Hybrid RAG Retrieval is requested or active
    let ragHits = 0;
    if ((variables.useRag === true || variables.documentId || variables.groundInKnowledge === true) && mongoose.connection.readyState === 1) {
      try {
        const retrieval = await retrieverService.retrieve({
          query: prompt,
          userId,
          documentId: variables.documentId,
          topK: variables.topK || 5,
        });
        if (retrieval.hits > 0 && retrieval.formattedContext) {
          ragHits = retrieval.hits;
          systemInstruction += `\n\n### Ground-Truth Knowledge Base Context & Citations (${ragHits} sources retrieved):\n${retrieval.formattedContext}\n\n> **CRITICAL INVARIANT:** Ground all claims, statistics, and references strictly in the citation anchors above whenever possible.`;
        }
      } catch (ragErr) {
        console.warn(`Orchestrator RAG retrieval warning: ${ragErr.message}`);
      }
    }

    let result;
    let status = 'success';
    let errorMessage = null;

    // 3. Provider routing hierarchy: Gemini -> OpenAI -> Local Fallback
    try {
      if (variables.overrideProvider === 'gemini' || (!variables.overrideProvider && process.env.GEMINI_API_KEY)) {
        result = await generateGemini({ prompt, systemInstruction });
      } else if (variables.overrideProvider === 'openai' || (!variables.overrideProvider && process.env.OPENAI_API_KEY)) {
        result = await generateOpenAI({ prompt, systemInstruction });
      } else {
        result = await generateLocal({ prompt, systemInstruction, feature, variables: { ...variables, brandVoice: memory.brandVoice || variables.brandVoice, tone: memory.brandVoice || variables.tone, topic: variables.topic || prompt.slice(0, 50) } });
        if (variables.overrideProvider && variables.overrideProvider !== 'local') {
          status = 'fallback';
        } else if (!variables.overrideProvider && (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)) {
          status = 'fallback';
        }
      }
    } catch (error) {
      console.warn(`Orchestrator provider execution error: ${error.message}. Routing to local high-fidelity fallback.`);
      errorMessage = error.message;
      status = 'fallback';
      result = await generateLocal({ prompt, systemInstruction, feature, variables: { ...variables, brandVoice: memory.brandVoice || variables.brandVoice, tone: memory.brandVoice || variables.tone, topic: variables.topic || prompt.slice(0, 50) } });
    }

    // 4. Store completion asynchronously in Semantic Cache & log Telemetry
    if (!isReplay) {
      semanticCacheService.store({
        prompt,
        promptHash: cacheLookup?.promptHash,
        promptEmbedding: cacheLookup?.promptEmbedding,
        feature,
        output: result.output,
        provider: result.provider,
        model: result.model,
        tokensOut: result.tokensOut,
      }).catch(err => console.error('Semantic cache store error:', err.message));
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const snapshot = {
          request: { prompt, feature, variables, userId },
          systemPrompt: systemInstruction,
          provider: result.provider || 'local',
          model: result.model || 'unknown',
          providerVersion: 'v1.5',
          promptVersion: 'v1.0',
          memoryProfile: memory || {},
          retrievedChunks: ragHits,
          cacheStatus: 'miss',
          evaluationResult: result.meta?.evaluation || null,
          verificationResult: result.meta?.verification || null,
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
          latencyMs: result.latencyMs || 0,
          costUsd: result.costUsd || 0,
        };

        await AiLog.create({
          userId: userId || 'anonymous',
          prompt: prompt.slice(0, 3000),
          completion: (result.output || '').slice(0, 5000),
          model: result.model || 'unknown',
          provider: result.provider || 'local',
          tokensIn: result.tokensIn || 0,
          tokensOut: result.tokensOut || 0,
          latencyMs: result.latencyMs || 0,
          costUsd: result.costUsd || 0,
          feature,
          status,
          errorMessage,
          isReplay: isReplay || false,
          parentLogId: parentLogId || null,
          executionSnapshot: snapshot,
          diffReport: variables.diffReport || null,
        });
      } catch (logError) {
        console.error('AiLog recording error:', logError.message);
      }
    }

    return {
      ...result,
      ragHits,
    };
  },

  /**
   * Replay a historical AI log execution non-destructively, performing regression testing similarity check.
   */
  async replayLog({ logId, overrideProvider, overrideModel, userId }) {
    if (!mongoose.connection.readyState || mongoose.connection.readyState !== 1) {
      throw new Error('Database connection required for replay');
    }
    const originalLog = await AiLog.findById(logId);
    if (!originalLog) {
      throw new Error(`Log entry not found: ${logId}`);
    }

    const snapshot = originalLog.executionSnapshot || {};
    const reqPrompt = snapshot.request?.prompt || originalLog.prompt;
    const reqFeature = snapshot.request?.feature || originalLog.feature;
    const reqVariables = snapshot.request?.variables || {};

    const targetProvider = overrideProvider || snapshot.provider || originalLog.provider;
    const targetModel = overrideModel || snapshot.model || originalLog.model;

    // Execute generation with replay flags
    const replayResult = await this.execute({
      prompt: reqPrompt,
      feature: reqFeature,
      variables: {
        ...reqVariables,
        overrideProvider: targetProvider,
        overrideModel: targetModel,
      },
      userId: userId || originalLog.userId,
      isReplay: true,
      parentLogId: originalLog._id.toString(),
    });

    // Compute simple regression similarity delta against original completion
    const origText = originalLog.completion || '';
    const newText = replayResult.output || '';
    
    const origWords = new Set(origText.toLowerCase().split(/\s+/));
    const newWords = new Set(newText.toLowerCase().split(/\s+/));
    let intersection = 0;
    origWords.forEach(w => { if (newWords.has(w)) intersection++; });
    const union = new Set([...origWords, ...newWords]).size || 1;
    const similarityScore = Number((intersection / union).toFixed(4));
    const passedRegression = similarityScore >= 0.65;

    const diffReport = {
      similarity: similarityScore,
      status: passedRegression ? 'pass' : 'fail',
      oldLength: origText.length,
      newLength: newText.length,
      oldSnippet: origText.slice(0, 300),
      newSnippet: newText.slice(0, 300),
    };

    // Attach diffReport to the newly created child replay log
    await AiLog.findOneAndUpdate(
      { parentLogId: originalLog._id.toString(), isReplay: true },
      { diffReport },
      { sort: { createdAt: -1 } }
    );

    return {
      success: true,
      replayed: true,
      parentLogId: originalLog._id.toString(),
      originalExecution: {
        model: originalLog.model,
        provider: originalLog.provider,
        latencyMs: originalLog.latencyMs,
        createdAt: originalLog.createdAt,
      },
      replayExecution: {
        model: replayResult.model,
        provider: replayResult.provider,
        latencyMs: replayResult.latencyMs,
        output: replayResult.output,
      },
      diffReport,
    };
  },
};

