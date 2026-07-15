import { z } from 'zod';

/**
 * Knowledge Ingestion & Query Validation Schemas
 */
export const knowledgeIngestSchema = z.object({
  title: z.string().min(1, 'title is required'),
  author: z.string().optional().default('Technical Team'),
  source: z.string().optional(),
  rawText: z.string().min(10, 'rawText must contain at least 10 characters to be indexed'),
  tags: z.array(z.string()).optional().default([]),
});

export const knowledgeSearchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
  topK: z.number().int().min(1).max(50).optional().default(5),
  documentId: z.string().optional(),
  minSimilarity: z.number().min(0).max(1).optional().default(0.35),
});

export default {
  knowledgeIngestSchema,
  knowledgeSearchSchema,
};
