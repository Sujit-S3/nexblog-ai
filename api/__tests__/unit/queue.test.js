import { MemoryQueueProvider } from '../../src/services/queue/providers/MemoryQueueProvider.js';

describe('MemoryQueueProvider & Dead Letter Queue (DLQ) Unit Tests', () => {
  let queue;

  beforeEach(() => {
    queue = new MemoryQueueProvider();
  });

  afterEach(async () => {
    await queue.shutdown();
  });

  test('Enqueues job and executes successful worker handler', async () => {
    let handledPayload = null;
    queue.registerWorker('test-queue', async (payload, progress) => {
      handledPayload = payload;
      progress(100);
      return { success: true };
    });

    const { jobId } = await queue.enqueue('test-queue', { foo: 'bar' });
    expect(jobId).toBeDefined();

    // Wait slightly for async execution loop
    await new Promise((r) => setTimeout(r, 50));

    const status = await queue.getJobStatus(jobId);
    expect(status.status).toBe('completed');
    expect(status.result.success).toBe(true);
    expect(handledPayload.foo).toBe('bar');
  });

  test('Transitions permanently failed job to DLQ after exceeding maxRetries', async () => {
    queue.registerWorker('failing-queue', async () => {
      throw new Error('Worker intentional crash');
    });

    const { jobId } = await queue.enqueue('failing-queue', { data: 123 }, { maxRetries: 1, backoffMs: 10 });

    // Wait for retries to exhaust
    await new Promise((r) => setTimeout(r, 100));

    const dlqJobs = await queue.getDLQ('failing-queue');
    expect(dlqJobs.length).toBe(1);
    expect(dlqJobs[0].jobId).toBe(jobId);
    expect(dlqJobs[0].status).toBe('failed');
    expect(dlqJobs[0].error.failureReason).toBe('Worker intentional crash');
  });
});
