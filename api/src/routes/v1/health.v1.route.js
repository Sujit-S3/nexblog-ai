import express from 'express';
import mongoose from 'mongoose';
import observabilityService from '../../services/observability/ObservabilityService.js';
import pluginManager from '../../ai/plugins/PluginManager.js';
import queueManager from '../../services/queue/QueueManager.js';
import providerFactory from '../../container/ProviderFactory.js';
import { sendSuccess } from '../../utils/response.envelope.js';
import profileManager from '../../config/profiles/ProfileManager.js';

const router = express.Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Comprehensive diagnostic probe across all 6 OS subsystems
 */
router.get('/', async (req, res) => {
  const isMongoHealthy = mongoose.connection.readyState === 1;
  const observabilitySummary = await observabilityService.checkHealth();
  const pluginsDiagnostics = await pluginManager.getDiagnostics();
  
  // Test AI provider basic availability
  const aiProvider = providerFactory.getDefaultProvider();
  
  const status = isMongoHealthy ? 'healthy' : 'degraded';
  const statusCode = status === 'healthy' ? 200 : 503;

  const diagnostics = {
    status,
    timestamp: new Date().toISOString(),
    version: '3.2.5',
    profile: profileManager.getProfileName(),
    subsystems: {
      mongodb: {
        status: isMongoHealthy ? 'healthy' : 'disconnected',
        readyState: mongoose.connection.readyState,
      },
      aiProvider: {
        default: aiProvider.providerName,
        status: 'ready',
      },
      queue: {
        provider: queueManager.getQueueProvider().constructor.name,
        status: 'active',
      },
      observability: observabilitySummary,
      vectorStore: {
        adapter: providerFactory.getVectorStore().constructor.name,
        status: isMongoHealthy ? 'healthy' : 'degraded',
      },
      plugins: {
        count: Object.keys(pluginsDiagnostics).length,
        details: pluginsDiagnostics,
      },
    },
  };

  return sendSuccess(res, diagnostics, {}, statusCode);
});

/**
 * @openapi
 * /api/v1/health/ready:
 *   get:
 *     summary: Readiness probe for Kubernetes/cloud load balancers
 */
router.get('/ready', (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  if (isReady) {
    return sendSuccess(res, { status: 'ready' }, {}, 200);
  }
  return res.status(503).json({ success: false, error: { code: 'NOT_READY', message: 'MongoDB not connected yet' } });
});

/**
 * @openapi
 * /api/v1/health/live:
 *   get:
 *     summary: Liveness probe ensuring Node.js process event loop responsiveness
 */
router.get('/live', (req, res) => {
  return sendSuccess(res, { status: 'alive', uptime: process.uptime() });
});

/**
 * @openapi
 * /api/v1/health/version:
 *   get:
 *     summary: Return current version and build metadata
 */
router.get('/version', (req, res) => {
  return sendSuccess(res, {
    version: '3.2.5',
    codename: 'Engineering Stabilization',
    buildDate: '2026-07-15',
    system: 'AI Knowledge & Content Operating System for Technical Teams',
  });
});

export default router;
