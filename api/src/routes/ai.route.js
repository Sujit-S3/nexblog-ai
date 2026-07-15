import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  generateArticle,
  rewriteCopy,
  improveGrammar,
  summarizeText,
  scoreSEO,
  generateTags,
  translateContent,
  expandSection,
  shortenSection,
  generateOutline,
  generateMeta,
  generateHooks,
  generateFAQ,
  generateCTA,
  analyzeTone,
  generateNewsletter,
  generateSocialPosts,
  extractKeywords,
  checkPlagiarismRisk,
  suggestLinks,
  generateCodeSnippet,
  convertFormat,
  generateProsCons,
  generateCaseStudy,
  generateInterviewQnA,
  studioChat,
  executeResearchStep,
  ingestKnowledge,
  listKnowledge,
  deleteKnowledge,
  verifyContent,
  evaluateContent,
  listWorkflows,
  saveWorkflow,
  runWorkflow,
} from '../controllers/ai.controller.js';

const router = express.Router();

// Apply verifyToken to all AI endpoints for workspace security
router.use(verifyToken);

router.post('/generate-article', generateArticle);
router.post('/rewrite-copy', rewriteCopy);
router.post('/improve-grammar', improveGrammar);
router.post('/summarize-text', summarizeText);
router.post('/score-seo', scoreSEO);
router.post('/generate-tags', generateTags);
router.post('/translate-content', translateContent);
router.post('/expand-section', expandSection);
router.post('/shorten-section', shortenSection);
router.post('/generate-outline', generateOutline);
router.post('/generate-meta', generateMeta);
router.post('/generate-hooks', generateHooks);
router.post('/generate-faq', generateFAQ);
router.post('/generate-cta', generateCTA);
router.post('/analyze-tone', analyzeTone);
router.post('/generate-newsletter', generateNewsletter);
router.post('/generate-social-posts', generateSocialPosts);
router.post('/extract-keywords', extractKeywords);
router.post('/check-plagiarism', checkPlagiarismRisk);
router.post('/suggest-links', suggestLinks);
router.post('/generate-code-snippet', generateCodeSnippet);
router.post('/convert-format', convertFormat);
router.post('/generate-pros-cons', generateProsCons);
router.post('/generate-case-study', generateCaseStudy);
router.post('/generate-interview-qna', generateInterviewQnA);
router.post('/studio-chat', studioChat);
router.post('/research-step', executeResearchStep);

// Version 3.2 Knowledge Intelligence Layer Endpoints
router.post('/ingest-knowledge', ingestKnowledge);
router.get('/list-knowledge', listKnowledge);
router.delete('/delete-knowledge/:documentId', deleteKnowledge);
router.post('/verify-content', verifyContent);
router.post('/evaluate-content', evaluateContent);
router.get('/list-workflows', listWorkflows);
router.post('/save-workflow', saveWorkflow);
router.post('/run-workflow', runWorkflow);

export default router;

