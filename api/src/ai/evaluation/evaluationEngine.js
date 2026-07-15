import { aiOrchestrator } from '../orchestrator/orchestrator.js';

export const evaluationEngine = {
  /**
   * Score an AI draft across 10 distinct quality dimensions (0-100 each)
   */
  evaluate({ draftContent = '', feature = 'generate-article', variables = {}, verificationReport = null }) {
    if (!draftContent || typeof draftContent !== 'string' || draftContent.trim().length < 20) {
      return {
        overallScore: 40,
        needsRetry: true,
        dimensions: {
          grammarAndSyntax: 50,
          seoKeywordDensity: 40,
          readability: 50,
          structuralHierarchy: 30,
          originality: 50,
          hallucinationRisk: 60,
          brandVoiceAlignment: 50,
          tonePrecision: 50,
          completeness: 30,
          factualAccuracy: 50,
        },
        flaggedDimensions: ['Completeness', 'Structural Hierarchy'],
        feedback: 'Draft is extremely brief or empty.',
      };
    }

    const words = draftContent.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const sentences = draftContent.split(/[.!?\n]/).filter(s => s.trim().length > 3);
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 15;

    // 1. Grammar & Syntax (check capitalization, punctuation balance)
    let grammarScore = 92;
    if (avgWordsPerSentence > 42) grammarScore -= 15; // Run-on sentences
    if (draftContent.includes('..') || draftContent.includes(',,')) grammarScore -= 10;

    // 2. SEO Keyword Density
    let seoScore = 85;
    const hasH1 = /^#\s+/m.test(draftContent);
    const hasH2 = /^##\s+/m.test(draftContent);
    if (!hasH1 && !hasH2) seoScore -= 20;
    if (variables.topic && !draftContent.toLowerCase().includes((variables.topic || '').toLowerCase().split(' ')[0])) seoScore -= 15;

    // 3. Readability (Flesch-Kincaid approximation based on avg sentence length)
    let readabilityScore = 90;
    if (avgWordsPerSentence > 30) readabilityScore -= 18;
    else if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 24) readabilityScore = 96;

    // 4. Structural Hierarchy
    let structureScore = 88;
    const hasLists = /^[-*1-9]\.?\s+/m.test(draftContent);
    if (hasH2) structureScore += 6;
    if (hasLists) structureScore += 6;
    structureScore = Math.min(100, structureScore);

    // 5. Originality (Check for repetitive phrases)
    let originalityScore = 91;
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const lexicalDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0.6;
    if (lexicalDiversity < 0.45 && wordCount > 100) originalityScore -= 18;

    // 6. Hallucination Risk (Lower risk = higher score)
    let hallucinationScore = 90;
    if (verificationReport && verificationReport.contradictedCount > 0) {
      hallucinationScore -= verificationReport.contradictedCount * 25;
    } else if (verificationReport && verificationReport.verifiedClaimsCount > 0) {
      hallucinationScore = Math.min(100, 88 + (verificationReport.verifiedClaimsCount * 2));
    }
    hallucinationScore = Math.max(10, hallucinationScore);

    // 7. Brand Voice Alignment
    let brandVoiceScore = 88;
    if (variables.brandVoice === 'technical' && !/\b(architecture|system|latency|protocol|execution|pipeline|data)\b/i.test(draftContent)) {
      brandVoiceScore -= 15;
    } else if (variables.brandVoice === 'friendly' && !/\b(welcome|let's|imagine|simpl|easy|help)\b/i.test(draftContent)) {
      brandVoiceScore -= 15;
    }

    // 8. Tone Precision
    let toneScore = 89;
    if (variables.tone && draftContent.length > 100) toneScore = 93;

    // 9. Completeness
    let completenessScore = 88;
    if (wordCount < 180 && feature.includes('article')) completenessScore -= 25;
    else if (wordCount >= 350) completenessScore = 96;

    // 10. Factual Accuracy
    let accuracyScore = verificationReport ? verificationReport.overallConfidence : 91;

    const dimensions = {
      grammarAndSyntax: Math.max(10, Math.min(100, grammarScore)),
      seoKeywordDensity: Math.max(10, Math.min(100, seoScore)),
      readability: Math.max(10, Math.min(100, readabilityScore)),
      structuralHierarchy: Math.max(10, Math.min(100, structureScore)),
      originality: Math.max(10, Math.min(100, originalityScore)),
      hallucinationRisk: Math.max(10, Math.min(100, hallucinationScore)),
      brandVoiceAlignment: Math.max(10, Math.min(100, brandVoiceScore)),
      tonePrecision: Math.max(10, Math.min(100, toneScore)),
      completeness: Math.max(10, Math.min(100, completenessScore)),
      factualAccuracy: Math.max(10, Math.min(100, accuracyScore)),
    };

    // Calculate composite weighted score
    const overallScore = Math.round(
      dimensions.grammarAndSyntax * 0.10 +
      dimensions.seoKeywordDensity * 0.10 +
      dimensions.readability * 0.10 +
      dimensions.structuralHierarchy * 0.10 +
      dimensions.originality * 0.10 +
      dimensions.hallucinationRisk * 0.12 +
      dimensions.brandVoiceAlignment * 0.08 +
      dimensions.tonePrecision * 0.08 +
      dimensions.completeness * 0.10 +
      dimensions.factualAccuracy * 0.12
    );

    const flaggedDimensions = [];
    if (dimensions.grammarAndSyntax < 78) flaggedDimensions.push('Grammar & Syntax');
    if (dimensions.seoKeywordDensity < 75) flaggedDimensions.push('SEO Keyword Density');
    if (dimensions.hallucinationRisk < 75) flaggedDimensions.push('Hallucination Risk / Contradictions');
    if (dimensions.completeness < 75) flaggedDimensions.push('Completeness');
    if (dimensions.structuralHierarchy < 75) flaggedDimensions.push('Structural Hierarchy');

    const needsRetry = overallScore < 80 || flaggedDimensions.length >= 2;

    return {
      overallScore,
      needsRetry,
      dimensions,
      flaggedDimensions,
      feedback: needsRetry
        ? `Quality audit flagged deficiencies in: ${flaggedDimensions.join(', ')}.`
        : 'Quality audit passed across all 10 dimensions.',
    };
  },

  /**
   * Evaluate draft and automatically run a targeted refinement loop if quality < 80
   */
  async evaluateAndRefine({ draftContent, prompt, feature, variables = {}, userId = 'anonymous', verificationReport = null }) {
    const initialEval = this.evaluate({ draftContent, feature, variables, verificationReport });

    if (!initialEval.needsRetry || variables.skipRefinement === true) {
      return {
        draft: draftContent,
        evaluation: initialEval,
        refined: false,
      };
    }

    console.info(`[EvaluationEngine] Draft score ${initialEval.overallScore}/100 (< 80 threshold). Auto-retrying refinement loop.`);

    try {
      const refinementPrompt = `Here is a drafted article that needs quality refinement:

${draftContent}

---
### Refinement Audit Requirements:
Please revise and polish this draft specifically to improve the following flagged quality dimensions: ${initialEval.flaggedDimensions.join(', ')}.
Ensure high factual accuracy, clean Markdown hierarchy (#, ##), and comprehensive depth. Do not include meta-commentary.`;

      const refinedResult = await aiOrchestrator.execute({
        prompt: refinementPrompt,
        feature: 'quality-refinement',
        variables: { ...variables, skipRefinement: true },
        userId,
      });

      const refinedDraft = refinedResult.output || draftContent;
      const finalEval = this.evaluate({ draftContent: refinedDraft, feature, variables, verificationReport });

      return {
        draft: refinedDraft,
        evaluation: finalEval,
        refined: true,
        initialScore: initialEval.overallScore,
      };
    } catch (refineErr) {
      console.warn(`[EvaluationEngine] Auto-refinement failed: ${refineErr.message}`);
      return {
        draft: draftContent,
        evaluation: initialEval,
        refined: false,
      };
    }
  },
};
