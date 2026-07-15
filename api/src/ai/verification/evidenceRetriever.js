import { retrieverService } from '../rag/retriever.service.js';

export const evidenceRetriever = {
  /**
   * Retrieve top supporting or refuting evidence chunks for a specific claim
   */
  async findEvidenceForClaim({ claimText, userId, documentId }) {
    if (!claimText || typeof claimText !== 'string') {
      return { evidenceChunks: [], maxScore: 0 };
    }

    try {
      const retrieval = await retrieverService.retrieve({
        query: claimText,
        userId,
        documentId,
        topK: 3,
      });

      const chunks = retrieval.selectedChunks || [];
      const maxScore = chunks.length > 0 ? chunks[0].similarityScore || 0 : 0;

      return {
        evidenceChunks: chunks,
        maxScore,
      };
    } catch (err) {
      console.warn(`[EvidenceRetriever] Failed to retrieve evidence: ${err.message}`);
      return { evidenceChunks: [], maxScore: 0 };
    }
  },
};
