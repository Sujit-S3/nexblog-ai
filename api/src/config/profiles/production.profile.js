/**
 * Production Profile
 * Optimized for high reliability, enterprise security, strict SLAs, and distributed background workers.
 */
export default {
  name: 'production',
  logLevel: 'info',
  queueProvider: 'bullmq',
  cache: {
    enabled: true,
    provider: 'redis',
    ttlSeconds: 86400, // 24 hours
  },
  aiProviders: {
    defaultTier: 'high',
    timeoutMs: 60000,
    maxRetries: 3,
  },
  featureFlags: {
    aiWorkspace: true,
    knowledgeBase: true,
    workflowStudio: true,
    plugins: true,
    rag: true,
    experimentalModels: false, // Strict: only stable models in production
    collaboration: false,
    billing: false,
  },
};
