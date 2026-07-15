import { z } from 'zod';

/**
 * Workflow Execution Validation Schema
 */
export const executeWorkflowSchema = z.object({
  workflowId: z.string().min(1, 'workflowId is required'),
  inputs: z.record(z.any()).default({}),
  executionMode: z.enum(['sync', 'async']).default('sync'),
  version: z.number().int().positive().optional(),
});

export default executeWorkflowSchema;
