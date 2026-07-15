/**
 * JobQueueProvider Interface
 * Abstract infrastructure boundary for background job processing.
 * Decouples workers from memory queues, BullMQ/Redis, or cloud queue services.
 */
export class JobQueueProvider {
  /**
   * Enqueue a job for background processing.
   * @param {string} queueName - Target queue or job type (e.g., 'knowledge-ingest')
   * @param {Object} payload - Data payload required by the worker
   * @param {Object} [options] - Optional settings (maxRetries, backoffMs, delayMs)
   * @returns {Promise<{ jobId: string, status: string }>}
   */
  async enqueue(queueName, payload, options = {}) {
    throw new Error('Method enqueue() must be implemented by concrete JobQueueProvider');
  }

  /**
   * Register a worker processing function for a queue.
   * @param {string} queueName - Queue to listen to
   * @param {Function} handler - Async function(jobId, payload)
   */
  registerWorker(queueName, handler) {
    throw new Error('Method registerWorker() must be implemented by concrete JobQueueProvider');
  }

  /**
   * Get the status and execution details of a specific job.
   * @param {string} jobId
   * @returns {Promise<{ jobId: string, status: string, queueName: string, progress: number, result: any, error: Object, retryCount: number, enqueuedAt: string, completedAt: string } | null>}
   */
  async getJobStatus(jobId) {
    throw new Error('Method getJobStatus() must be implemented by concrete JobQueueProvider');
  }

  /**
   * Manually retry a failed job from the Dead Letter Queue.
   * @param {string} jobId
   * @returns {Promise<boolean>}
   */
  async retryJob(jobId) {
    throw new Error('Method retryJob() must be implemented by concrete JobQueueProvider');
  }

  /**
   * Retrieve all jobs currently residing in the Dead Letter Queue (DLQ).
   * @param {string} [queueName]
   * @returns {Promise<Array<Object>>}
   */
  async getDLQ(queueName = undefined) {
    throw new Error('Method getDLQ() must be implemented by concrete JobQueueProvider');
  }

  /**
   * Gracefully shut down all queue connections and active workers.
   */
  async shutdown() {
    throw new Error('Method shutdown() must be implemented by concrete JobQueueProvider');
  }
}

export default JobQueueProvider;
