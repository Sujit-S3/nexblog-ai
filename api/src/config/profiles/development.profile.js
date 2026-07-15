/**
 * Development Profile
 * Optimized for local debugging, fast iteration, memory queues, and verbose logging.
 */
export default {
  name: 'development',
  logLevel: 'debug',
  queueProvider: 'memory',
  cache: {
    enabled: true,
    provider: 'memory',
    ttlSeconds: 300, // 5 minutes
  },
  aiProviders: {
    defaultTier: 'standard',
    timeoutMs: 30000,
    maxRetries: 2,
  },
  featureFlags: {
    aiWorkspace: true,
    knowledgeBase: true,
    workflowStudio: true,
    plugins: true,
    rag: true,
    experimentalModels: true,
    collaboration: true, // enabled locally for dogfooding/testing
    billing: false,
  },
};
