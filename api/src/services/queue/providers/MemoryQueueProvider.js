import JobQueueProvider from '../JobQueueProvider.interface.js';
import crypto from 'crypto';

/**
 * MemoryQueueProvider
 * Development-grade in-memory async job queue with retries, exponential backoff, and Dead Letter Queue (DLQ).
 */
export class MemoryQueueProvider extends JobQueueProvider {
  constructor() {
    super();
    this.jobs = new Map(); // jobId -> Job record
    this.workers = new Map(); // queueName -> async handler function
    this.dlq = new Map(); // jobId -> Failed job record with diagnostic details
    this.processing = new Set(); // Job IDs currently executing
    this.timers = new Set();
    this.isShutDown = false;
  }

  _scheduleTimeout(fn, delayMs) {
    if (this.isShutDown) return;
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (!this.isShutDown) fn();
    }, delayMs);
    if (timer && typeof timer.unref === 'function') timer.unref();
    this.timers.add(timer);
    return timer;
  }

  async enqueue(queueName, payload, options = {}) {
    const jobId = options.jobId || `job_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const job = {
      jobId,
      queueName,
      payload,
      status: 'pending',
      progress: 0,
      result: null,
      error: null,
      retryCount: 0,
      maxRetries: options.maxRetries !== undefined ? options.maxRetries : 3,
      backoffMs: options.backoffMs || 1000,
      enqueuedAt: now,
      startedAt: null,
      completedAt: null,
      executionTimeMs: 0,
    };

    this.jobs.set(jobId, job);

    // Schedule execution asynchronously on next tick or after delay
    const delay = options.delayMs || 10;
    this._scheduleTimeout(() => this._processJob(jobId), delay);

    return { jobId, status: 'pending' };
  }

  registerWorker(queueName, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Worker handler must be an async function');
    }
    this.workers.set(queueName, handler);
  }

  async getJobStatus(jobId) {
    if (this.jobs.has(jobId)) {
      return this.jobs.get(jobId);
    }
    if (this.dlq.has(jobId)) {
      return this.dlq.get(jobId);
    }
    return null;
  }

  async retryJob(jobId) {
    const failedJob = this.dlq.get(jobId);
    if (!failedJob) return false;

    this.dlq.delete(jobId);
    failedJob.status = 'pending';
    failedJob.error = null;
    failedJob.retryCount = 0;
    this.jobs.set(jobId, failedJob);

    this._scheduleTimeout(() => this._processJob(jobId), 10);
    return true;
  }

  async getDLQ(queueName = undefined) {
    const allFailed = Array.from(this.dlq.values());
    if (queueName) {
      return allFailed.filter((j) => j.queueName === queueName);
    }
    return allFailed;
  }

  async shutdown() {
    this.isShutDown = true;
    for (const t of this.timers) {
      clearTimeout(t);
    }
    this.timers.clear();
    this.jobs.clear();
    this.dlq.clear();
    this.workers.clear();
  }

  async _processJob(jobId) {
    if (this.isShutDown) return;
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed' || this.processing.has(jobId)) return;

    const handler = this.workers.get(job.queueName);
    if (!handler) {
      // If no worker registered yet, retry after 200ms
      this._scheduleTimeout(() => this._processJob(jobId), 200);
      return;
    }

    this.processing.add(jobId);
    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    const startMs = Date.now();

    try {
      // Execute worker handler passing jobId and payload, plus a progress reporting callback
      const progressCallback = (pct) => {
        job.progress = Math.min(100, Math.max(0, pct));
      };

      const result = await handler(job.payload, progressCallback, job);
      job.result = result;
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.executionTimeMs = Date.now() - startMs;
      this.processing.delete(jobId);
    } catch (err) {
      job.executionTimeMs = Date.now() - startMs;
      this.processing.delete(jobId);

      if (job.retryCount < job.maxRetries) {
        job.retryCount += 1;
        job.status = 'retrying';
        job.error = {
          message: err.message,
          stack: err.stack,
          retryingAt: new Date().toISOString(),
        };

        // Exponential backoff
        const nextDelay = job.backoffMs * Math.pow(2, job.retryCount - 1);
        this._scheduleTimeout(() => this._processJob(jobId), nextDelay);
      } else {
        // Exceeded maxRetries -> Move to Dead Letter Queue (DLQ)
        job.status = 'failed';
        job.completedAt = new Date().toISOString();
        job.error = {
          code: err.code || 'WORKER_FATAL_ERROR',
          failureReason: err.message,
          stack: err.stack,
          failedAt: job.completedAt,
        };

        this.jobs.delete(jobId);
        this.dlq.set(jobId, job);
      }
    }
  }
}

export const memoryQueueProvider = new MemoryQueueProvider();
export default memoryQueueProvider;
