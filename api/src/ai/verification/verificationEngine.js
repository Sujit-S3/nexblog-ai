import { claimExtractor } from './claimExtractor.js';
import { evidenceRetriever } from './evidenceRetriever.js';
import { contradictionDetector } from './contradictionDetector.js';

export const verificationEngine = {
  /**
   * Run full verification audit across all paragraphs of a draft document
   */
  async verifyDraft({ draftContent, userId = 'anonymous', documentId = null }) {
    if (!draftContent || typeof draftContent !== 'string') {
      return {
        overallConfidence: 100,
        verifiedClaimsCount: 0,
        unverifiedCount: 0,
        contradictedCount: 0,
        paragraphAudits: [],
      };
    }

    const paragraphAudits = claimExtractor.extractClaimsByParagraph(draftContent);
    let totalScore = 0;
    let totalClaims = 0;
    let verifiedCount = 0;
    let unverifiedCount = 0;
    let contradictedCount = 0;

    const auditedParagraphs = [];

    for (const para of paragraphAudits) {
      const auditedClaims = [];
      let paraScoreSum = 0;

      for (const claim of para.claims) {
        const evidence = await evidenceRetriever.findEvidenceForClaim({
          claimText: claim.text,
          userId,
          documentId,
        });

        const evaluation = contradictionDetector.evaluate({
          claimText: claim.text,
          evidenceChunks: evidence.evidenceChunks,
        });

        auditedClaims.push({
          text: claim.text,
          status: evaluation.status,
          confidenceScore: evaluation.confidenceScore,
          reason: evaluation.reason,
          sourceAnchor: evaluation.sourceAnchor,
        });

        paraScoreSum += evaluation.confidenceScore;
        totalScore += evaluation.confidenceScore;
        totalClaims += 1;

        if (evaluation.status === 'VERIFIED') verifiedCount++;
        else if (evaluation.status === 'CONTRADICTED') contradictedCount++;
        else unverifiedCount++;
      }

      // If paragraph had no specific factual claims extracted, baseline at 92% confidence
      const paragraphConfidence = para.claims.length > 0
        ? Math.round(paraScoreSum / para.claims.length)
        : 92;

      auditedParagraphs.push({
        paragraphIndex: para.paragraphIndex,
        text: para.text,
        paragraphConfidence,
        claims: auditedClaims,
      });
    }

    const overallConfidence = totalClaims > 0
      ? Math.round(totalScore / totalClaims)
      : 95;

    return {
      overallConfidence,
      verifiedClaimsCount: verifiedCount,
      unverifiedCount,
      contradictedCount,
      paragraphAudits: auditedParagraphs,
    };
  },
};
