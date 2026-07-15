import profileManager from '../../config/profiles/ProfileManager.js';
import memoryQueueProvider from './providers/MemoryQueueProvider.js';
import bullMQQueueProvider from './providers/BullMQQueueProvider.js';

/**
 * QueueManager
 * Resolves and returns the active JobQueueProvider based on the current deployment profile.
 */
class QueueManager {
  /**
   * Retrieve the active job queue provider (Memory or BullMQ).
   */
  getQueueProvider() {
    const providerName = profileManager.getConfig('queueProvider', 'memory');
    if (providerName === 'bullmq' && process.env.REDIS_URL) {
      return bullMQQueueProvider;
    }
    return memoryQueueProvider;
  }
}

export const queueManager = new QueueManager();
export default queueManager;
