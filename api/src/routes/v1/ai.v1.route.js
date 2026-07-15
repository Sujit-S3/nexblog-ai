import express from 'express';
import { verifyToken } from '../../utils/verifyUser.js';
import { generateArticleSchema } from '../../schemas/v1/GenerateArticle.schema.js';
import { sendSuccess, sendError } from '../../utils/response.envelope.js';
import * as aiController from '../../controllers/ai.controller.js';
import { aiLimiter } from '../../middlewares/security.middleware.js';

const router = express.Router();
router.use(verifyToken);
router.use(aiLimiter);

/**
 * Middleware helper to validate request body with Zod before executing controller
 */
const validateWithSchema = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Wrapper to format legacy or standard controller responses into standardized envelopes
 */
const wrapController = (controllerFn) => async (req, res, next) => {
  try {
    // Intercept res.json / res.status to ensure standard envelope if not already enveloped
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

router.post('/generate', validateWithSchema(generateArticleSchema), wrapController(aiController.generateArticle));
router.post('/studio-chat', wrapController(aiController.studioChat));
router.post('/research-step', wrapController(aiController.executeResearchStep));

// Specialized content tools
router.post('/rewrite-copy', wrapController(aiController.rewriteCopy));
router.post('/improve-grammar', wrapController(aiController.improveGrammar));
router.post('/summarize-text', wrapController(aiController.summarizeText));
router.post('/score-seo', wrapController(aiController.scoreSEO));
router.post('/generate-tags', wrapController(aiController.generateTags));
router.post('/translate-content', wrapController(aiController.translateContent));
router.post('/expand-section', wrapController(aiController.expandSection));
router.post('/shorten-section', wrapController(aiController.shortenSection));
router.post('/generate-outline', wrapController(aiController.generateOutline));
router.post('/generate-meta', wrapController(aiController.generateMeta));
router.post('/generate-hooks', wrapController(aiController.generateHooks));
router.post('/generate-faq', wrapController(aiController.generateFAQ));
router.post('/generate-cta', wrapController(aiController.generateCTA));
router.post('/analyze-tone', wrapController(aiController.analyzeTone));
router.post('/generate-newsletter', wrapController(aiController.generateNewsletter));
router.post('/generate-social-posts', wrapController(aiController.generateSocialPosts));
router.post('/extract-keywords', wrapController(aiController.extractKeywords));
router.post('/check-plagiarism', wrapController(aiController.checkPlagiarismRisk));
router.post('/suggest-links', wrapController(aiController.suggestLinks));
router.post('/generate-code-snippet', wrapController(aiController.generateCodeSnippet));
router.post('/convert-format', wrapController(aiController.convertFormat));
router.post('/generate-pros-cons', wrapController(aiController.generateProsCons));
router.post('/generate-case-study', wrapController(aiController.generateCaseStudy));
router.post('/generate-interview-qna', wrapController(aiController.generateInterviewQnA));

// Telemetry, Error Replay & Regression Testing routes
router.get('/logs', wrapController(aiController.getAiLogs));
router.get('/logs/:logId', wrapController(aiController.getAiLogById));
router.post('/logs/:logId/replay', wrapController(aiController.replayAiLog));
router.post('/logs/:logId/regression-test', wrapController(aiController.regressionTestAiLog));

// AI Experiment Framework routes
router.post('/experiments/create', wrapController(aiController.createExperiment));
router.get('/experiments', wrapController(aiController.listExperiments));
router.post('/experiments/:experimentId/evaluate', wrapController(aiController.evaluateExperiment));

// Production Validation Dashboard & Trend-Based Readiness Gates endpoint
router.get('/health-dashboard', wrapController(aiController.getHealthDashboard));

export default router;
