export const contradictionDetector = {
  /**
   * Evaluate alignment or contradiction between a claim and retrieved evidence
   */
  evaluate({ claimText, evidenceChunks = [] }) {
    if (!evidenceChunks || evidenceChunks.length === 0 || !evidenceChunks[0]) {
      return {
        status: 'UNVERIFIED',
        confidenceScore: 45,
        reason: 'No authoritative anchor found in vector knowledge base.',
        sourceAnchor: null,
      };
    }

    const topChunk = evidenceChunks[0];
    const topScore = topChunk.similarityScore || 0;
    const chunkTextLower = (topChunk.text || '').toLowerCase();
    const claimLower = (claimText || '').toLowerCase();

    // Check numerical contradiction (e.g., if claim claims 1500ms while anchor states 12ms)
    const claimNums = claimLower.match(/\b\d+(\.\d+)?(ms|s|%|x|×|\$|usd|kb|mb|gb)\b/gi) || [];
    const chunkNums = chunkTextLower.match(/\b\d+(\.\d+)?(ms|s|%|x|×|\$|usd|kb|mb|gb)\b/gi) || [];

    let hasNumberMismatch = false;
    if (claimNums.length > 0 && chunkNums.length > 0) {
      for (const cNum of claimNums) {
        // If claim specifies a number unit that is directly contradicted in top chunk
        if (!chunkTextLower.includes(cNum) && (claimLower.includes('latency') || claimLower.includes('reduction') || claimLower.includes('overhead'))) {
          // Check if difference is severe (e.g. 1500ms vs 12ms)
          const cVal = parseFloat(cNum);
          const chunkVals = chunkNums.map(n => parseFloat(n)).filter(v => !isNaN(v));
          if (chunkVals.length > 0 && Math.abs(cVal - chunkVals[0]) > cVal * 0.3) {
            hasNumberMismatch = true;
          }
        }
      }
    }

    const sourceAnchor = {
      documentTitle: topChunk.metadata?.title || topChunk.metadata?.source || 'Knowledge Anchor',
      page: topChunk.metadata?.page || 1,
      heading: topChunk.metadata?.heading || 'Section Header',
      section: topChunk.metadata?.section || 'Chunk 1',
    };

    if (hasNumberMismatch) {
      return {
        status: 'CONTRADICTED',
        confidenceScore: 22,
        reason: `Numerical assertion conflicts with anchor chunk: "${topChunk.text.slice(0, 90)}..."`,
        sourceAnchor,
      };
    }

    if (topScore >= 0.55 || (topScore >= 0.38 && claimNums.some(n => chunkTextLower.includes(n)))) {
      const computedConf = Math.min(99, Math.round((topScore * 0.45 + 0.54) * 100));
      return {
        status: 'VERIFIED',
        confidenceScore: computedConf,
        reason: 'Verified against ground-truth vector index.',
        sourceAnchor,
      };
    }

    return {
      status: 'UNVERIFIED',
      confidenceScore: Math.round(topScore * 100) || 52,
      reason: 'Partial semantic correlation; manual verification recommended.',
      sourceAnchor: topScore > 0.25 ? sourceAnchor : null,
    };
  },
};
