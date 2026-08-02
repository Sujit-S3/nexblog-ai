import AiLog from '../../models/aiLog.model.js';
import AiCache from '../../models/aiCache.model.js';
import observabilityService from '../observability/ObservabilityService.js';

/**
 * RetentionService
 * Enforces automated Data Retention and TTL cleanup policies across caches, telemetry logs, and job records.
 */
class RetentionService {
  constructor() {
    this.intervalHandle = null;
    this.retentionDays = {
      telemetryLogs: 30, // Retain AiLog records for 30 days
      semanticCache: 14, // Retain semantic cache entries without hits for 14 days
    };
  }

  /**
   * Execute immediate cleanup of expired records.
   * @returns {Promise<{ deletedLogs: number, deletedCacheEntries: number }>}
   */
  async runCleanup() {
    const now = Date.now();
    let deletedLogs = 0;
    let deletedCacheEntries = 0;

    try {
      // 1. Clean up AiLog records older than 30 days
      const logThreshold = new Date(now - this.retentionDays.telemetryLogs * 24 * 60 * 60 * 1000);
      const logRes = await AiLog.deleteMany({ createdAt: { $lt: logThreshold } });
      deletedLogs = logRes.deletedCount || 0;

      // 2. Clean up AiCache records older than 14 days
      const cacheThreshold = new Date(now - this.retentionDays.semanticCache * 24 * 60 * 60 * 1000);
      const cacheRes = await AiCache.deleteMany({ updatedAt: { $lt: cacheThreshold } });
      deletedCacheEntries = cacheRes.deletedCount || 0;

      if (deletedLogs > 0 || deletedCacheEntries > 0) {
        observabilityService.log('info', `🧹 [RetentionService] Cleanup complete: purged ${deletedLogs} old telemetry logs and ${deletedCacheEntries} stale cache entries.`);
      }
    } catch (err) {
      observabilityService.log('error', `❌ [RetentionService] Cleanup error: ${err.message}`, { error: err.stack });
    }

    return { deletedLogs, deletedCacheEntries };
  }

  /**
   * Schedule automated daily background cleanup.
   */
  startScheduledCleanup(intervalHours = 24) {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
    this.intervalHandle = setInterval(() => {
      this.runCleanup();
    }, intervalHours * 60 * 60 * 1000);
    if (this.intervalHandle && typeof this.intervalHandle.unref === 'function') {
      this.intervalHandle.unref();
    }
    observabilityService.log('info', `🕒 [RetentionService] Scheduled automated data retention cleanup every ${intervalHours} hours.`);
  }

  /**
   * Stop scheduled background cleanup.
   */
  stopScheduledCleanup() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}

export const retentionService = new RetentionService();
export default retentionService;
