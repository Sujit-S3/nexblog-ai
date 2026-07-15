import express from 'express';
import { verifyToken } from '../../utils/verifyUser.js';
import { executeWorkflowSchema } from '../../schemas/v1/Workflow.schema.js';
import { sendSuccess, sendError } from '../../utils/response.envelope.js';
import * as aiController from '../../controllers/ai.controller.js';
import AiWorkflow from '../../models/aiWorkflow.model.js';

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

router.get('/', wrapController(aiController.listWorkflows));
router.post('/save', wrapController(aiController.saveWorkflow));
router.post('/run', async (req, res, next) => {
  try {
    if (req.body.workflowId) {
      executeWorkflowSchema.parse(req.body);
    }
    await wrapController(aiController.runWorkflow)(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/v1/workflows/{workflowId}/rollback/{version}:
 *   post:
 *     summary: Roll back a workflow to a specific version in audit history
 */
router.post('/:workflowId/rollback/:version', async (req, res, next) => {
  try {
    const { workflowId, version } = req.params;
    const targetVersion = Number(version);

    const workflow = await AiWorkflow.findById(workflowId);
    if (!workflow) {
      return sendError(res, 'WORKFLOW_NOT_FOUND', `No workflow found with ID: ${workflowId}`, {}, 404);
    }

    if (!workflow.changeHistory || workflow.changeHistory.length === 0) {
      return sendError(res, 'NO_HISTORY', `Workflow ${workflowId} has no version history to roll back to.`, {}, 400);
    }

    const snapshot = workflow.changeHistory.find((h) => h.version === targetVersion);
    if (!snapshot) {
      return sendError(res, 'VERSION_NOT_FOUND', `Version ${targetVersion} not found in change history.`, {}, 404);
    }

    // Save current as backup and roll back nodes/edges
    workflow.changeHistory.push({
      version: workflow.version || 1,
      nodes: workflow.nodes,
      edges: workflow.edges,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.id || 'rollback-system',
    });

    workflow.nodes = snapshot.nodes;
    workflow.edges = snapshot.edges;
    workflow.version = targetVersion + 1;
    await workflow.save();

    return sendSuccess(res, workflow, { message: `Workflow rolled back successfully to version ${targetVersion}` });
  } catch (error) {
    next(error);
  }
});

export default router;
