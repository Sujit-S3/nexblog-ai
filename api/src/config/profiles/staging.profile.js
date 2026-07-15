/**
 * Staging Profile
 * Mirrors production settings while enabling experimental features for pre-release validation and dogfooding.
 */
export default {
  name: 'staging',
  logLevel: 'info',
  queueProvider: process.env.REDIS_URL ? 'bullmq' : 'memory',
  cache: {
    enabled: true,
    provider: process.env.REDIS_URL ? 'redis' : 'memory',
    ttlSeconds: 3600, // 1 hour
  },
  aiProviders: {
    defaultTier: 'high',
    timeoutMs: 45000,
    maxRetries: 3,
  },
  featureFlags: {
    aiWorkspace: true,
    knowledgeBase: true,
    workflowStudio: true,
    plugins: true,
    rag: true,
    experimentalModels: true,
    collaboration: false,
    billing: false,
  },
};
