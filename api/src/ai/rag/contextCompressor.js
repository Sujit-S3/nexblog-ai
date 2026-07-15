export const contextCompressor = {
  /**
   * Deduplicate, sort, and compress candidate chunks into a clean, token-capped prompt context block
   * @param {Array<Object>} chunks - Candidate retrieved chunks
   * @param {number} maxWords - Approximate word budget for injected context (default ~1500 words)
   * @returns {Object} { formattedContext: string, selectedChunks: Array<Object>, totalWords: number }
   */
  compress(chunks = [], maxWords = 1500) {
    if (!chunks || chunks.length === 0) {
      return { formattedContext: '', selectedChunks: [], totalWords: 0 };
    }

    // 1. Deduplicate by exact checksum or high text substring overlap
    const seenHashes = new Set();
    const uniqueChunks = [];

    for (const chunk of chunks) {
      const hash = chunk.metadata?.checksum || chunk.text?.slice(0, 50).toLowerCase();
      if (!seenHashes.has(hash)) {
        seenHashes.add(hash);
        uniqueChunks.push(chunk);
      }
    }

    // 2. Sort descending by similarity score
    uniqueChunks.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));

    // 3. Assemble compressed context string with clear citation anchors
    const selectedChunks = [];
    let currentWords = 0;
    const formattedBlocks = [];

    for (const chunk of uniqueChunks) {
      const wordsInChunk = (chunk.text || '').split(/\s+/).length;
      if (currentWords + wordsInChunk > maxWords && selectedChunks.length > 0) {
        break; // Stop adding when we hit our budget
      }

      currentWords += wordsInChunk;
      selectedChunks.push(chunk);

      const anchor = `[Citation Anchor: ${chunk.metadata?.title || chunk.metadata?.source || 'Document'} | Section: ${chunk.metadata?.heading || chunk.metadata?.section || '1'} | Score: ${(chunk.similarityScore * 100).toFixed(1)}%]`;
      formattedBlocks.push(`${anchor}\n${chunk.text.trim()}`);
    }

    return {
      formattedContext: formattedBlocks.join('\n\n---\n\n'),
      selectedChunks,
      totalWords: currentWords,
    };
  },
};
