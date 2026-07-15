import express from 'express';
import queueManager from '../../services/queue/QueueManager.js';
import { sendSuccess, sendError } from '../../utils/response.envelope.js';
import { verifyToken } from '../../utils/verifyUser.js';

const router = express.Router();

/**
 * @openapi
 * /api/v1/jobs/dlq:
 *   get:
 *     summary: Retrieve all failed jobs residing in the Dead Letter Queue (DLQ)
 *     tags: [Background Jobs]
 */
router.get('/dlq', verifyToken, async (req, res, next) => {
  try {
    const { queueName } = req.query;
    const queueProvider = queueManager.getQueueProvider();
    const dlqJobs = await queueProvider.getDLQ(queueName);
    return sendSuccess(res, dlqJobs, { count: dlqJobs.length });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/jobs/{jobId}:
 *   get:
 *     summary: Inspect exact status, progress, and result/error of a background job
 *     tags: [Background Jobs]
 */
router.get('/:jobId', verifyToken, async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const queueProvider = queueManager.getQueueProvider();
    const jobStatus = await queueProvider.getJobStatus(jobId);

    if (!jobStatus) {
      return sendError(res, 'JOB_NOT_FOUND', `No job found with ID: ${jobId}`, {}, 404);
    }

    return sendSuccess(res, jobStatus);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/jobs/{jobId}/retry:
 *   post:
 *     summary: Manually retry a failed job from the Dead Letter Queue
 *     tags: [Background Jobs]
 */
router.post('/:jobId/retry', verifyToken, async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const queueProvider = queueManager.getQueueProvider();
    const retried = await queueProvider.retryJob(jobId);

    if (!retried) {
      return sendError(res, 'JOB_RETRY_FAILED', `Could not retry job ${jobId}. It may not exist in the DLQ.`, {}, 400);
    }

    return sendSuccess(res, { jobId, retried: true, message: 'Job has been re-enqueued for processing.' });
  } catch (error) {
    next(error);
  }
});

export default router;
