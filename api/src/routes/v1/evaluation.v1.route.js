import express from 'express';
import { verifyToken } from '../../utils/verifyUser.js';
import { sendSuccess } from '../../utils/response.envelope.js';
import * as aiController from '../../controllers/ai.controller.js';

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
 * /api/v1/evaluation/evaluate:
 *   post:
 *     summary: Evaluate generated content across factual accuracy, tone alignment, and SEO quality
 */
router.post('/evaluate', wrapController(aiController.evaluateContent));

export default router;
