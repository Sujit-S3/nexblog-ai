import express from 'express';
import { verifyToken } from '../../utils/verifyUser.js';
import { knowledgeIngestSchema, knowledgeSearchSchema } from '../../schemas/v1/Knowledge.schema.js';
import { sendSuccess, sendError } from '../../utils/response.envelope.js';
import * as aiController from '../../controllers/ai.controller.js';
import queueManager from '../../services/queue/QueueManager.js';
import KnowledgeDocument from '../../models/knowledgeDocument.model.js';
import KnowledgeChunk from '../../models/knowledgeChunk.model.js';

const router = express.Router();
router.use(verifyToken);

const wrapController = (controllerFn) => async (req, res, next) => {
  try {
    const originalJson = res.json.bind(res);
    res.json = (payload) => {
      if (payload && (payload.success !== undefined || payload.error !== undefined)) {
        return originalJson(payload);
      }
      return sendSuccess(res, payload);
    };
    await controllerFn(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/v1/knowledge/ingest:
 *   post:
 *     summary: Ingest document into vector knowledge base via background queue
 */
router.post('/ingest', async (req, res, next) => {
  try {
    const validated = knowledgeIngestSchema.parse(req.body);
    const userId = req.user?.id || 'anonymous';

    // Create preliminary KnowledgeDocument record
    const doc = await KnowledgeDocument.create({
      userId,
      title: validated.title,
      author: validated.author,
      source: validated.source || validated.title,
      fileType: 'text',
      status: 'processing',
      chunkCount: 0,
      tags: validated.tags,
    });

    // Enqueue job to background worker
    const queueProvider = queueManager.getQueueProvider();
    const jobInfo = await queueProvider.enqueue('knowledge-ingest', {
      documentId: doc._id.toString(),
      rawText: validated.rawText,
      title: validated.title,
      author: validated.author,
      source: validated.source || validated.title,
      userId,
    });

    return sendSuccess(res, {
      documentId: doc._id,
      status: 'processing',
      jobId: jobInfo.jobId,
      message: 'Knowledge document ingestion enqueued for background vector indexing.',
    }, {}, 202);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/knowledge/documents:
 *   get:
 *     summary: List all knowledge base documents in workspace
 */
router.get('/documents', wrapController(aiController.listKnowledge));

/**
 * @openapi
 * /api/v1/knowledge/documents/{documentId}:
 *   delete:
 *     summary: Delete a knowledge document and its associated vector chunks
 */
router.delete('/documents/:documentId', async (req, res, next) => {
  try {
    const { documentId } = req.params;
    await KnowledgeChunk.deleteMany({ documentId });
    await KnowledgeDocument.findByIdAndDelete(documentId);
    return sendSuccess(res, { deleted: true, documentId });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/knowledge/search:
 *   post:
 *     summary: Perform hybrid semantic search across knowledge chunks
 */
router.post('/search', async (req, res, next) => {
  try {
    const { query, topK = 5, documentId } = req.body;
    const validated = knowledgeSearchSchema.parse({ query, topK, documentId });
    
    // Delegate to retriever Service or controller
    req.body = validated;
    await wrapController(aiController.verifyContent)(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
