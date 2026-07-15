import { z } from 'zod';

/**
 * GenerateArticle Validation Schema
 * Enforces strict runtime checks on input prompts and variables for AI generation endpoints.
 */
export const generateArticleSchema = z.object({
  prompt: z.string({
    required_error: 'prompt is a required field',
  }).min(3, 'prompt must contain at least 3 characters').max(20000, 'prompt exceeds maximum 20,000 character limit'),
  
  feature: z.enum([
    'generate-article',
    'studio-chat',
    'brainstorm',
    'refine',
    'summarize',
    'fact-check',
    'code-explain',
  ]).default('generate-article'),

  provider: z.enum(['gemini', 'openai', 'local']).optional(),
  model: z.string().optional(),

  variables: z.object({
    topic: z.string().optional(),
    brandVoice: z.string().optional(),
    writingStyle: z.string().optional(),
    targetAudience: z.string().optional(),
    useRag: z.boolean().optional(),
    documentId: z.string().optional(),
    topK: z.number().int().min(1).max(20).default(5),
    customInstructions: z.string().optional(),
  }).optional().default({}),
});

export default generateArticleSchema;
