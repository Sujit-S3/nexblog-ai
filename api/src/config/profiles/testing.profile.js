/**
 * Testing Profile
 * Optimized for automated unit/integration/E2E testing with deterministic behavior and memory providers.
 */
export default {
  name: 'testing',
  logLevel: 'error',
  queueProvider: 'memory',
  cache: {
    enabled: false, // Disabled by default in testing for deterministic test runs
    provider: 'memory',
    ttlSeconds: 60,
  },
  aiProviders: {
    defaultTier: 'standard',
    timeoutMs: 5000,
    maxRetries: 0, // Fail fast during unit tests
  },
  featureFlags: {
    aiWorkspace: true,
    knowledgeBase: true,
    workflowStudio: true,
    plugins: true,
    rag: true,
    experimentalModels: false,
    collaboration: false,
    billing: false,
  },
};
