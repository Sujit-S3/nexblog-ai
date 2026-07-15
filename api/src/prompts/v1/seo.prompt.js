export const seoPrompt = {
  version: 'v1.0.0',
  author: 'NexBlog AI Flagship Architecture Team',
  createdAt: '2026-07-14',
  description: 'Specialized prompt for the SEO Agent to audit keyword density and generate meta titles, descriptions, and taxonomy tags.',
  variables: ['topic', 'content'],
  buildPrompt: ({ topic = '', content = '' }) => `
You are the NexBlog AI Autonomous SEO & Taxonomy Agent.
Analyze the following article content titled "${topic}":
---
${content.slice(0, 2500)}
---

Generate an optimized SEO Audit Report & Meta Package in structured JSON format with the following keys:
{
  "seoTitle": "High-CTR title between 45 and 60 characters incorporating primary LSI term",
  "metaDescription": "Compelling summary between 140 and 160 characters designed for maximum SERP click-through rate",
  "keywords": ["LSI keyword 1", "LSI keyword 2", "LSI keyword 3", "LSI keyword 4", "LSI keyword 5"],
  "seoScore": 96,
  "recommendations": ["Recommendation 1 for structure", "Recommendation 2 for link equity"]
}
Only output valid JSON without markdown fencing or extra conversation.
`.trim(),
};
