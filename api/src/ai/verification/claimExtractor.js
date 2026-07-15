export const claimExtractor = {
  /**
   * Extract verifiable factual claims from a text document, broken down by paragraph
   * @param {string} draftContent - The full markdown article or draft text
   * @returns {Array<Object>} Array of paragraphs with extracted claim sentences
   */
  extractClaimsByParagraph(draftContent = '') {
    if (!draftContent || typeof draftContent !== 'string') return [];

    const rawParagraphs = draftContent.split(/\n{2,}/).filter((p) => {
      const clean = p.trim();
      return clean.length > 25 && !clean.startsWith('```') && !clean.startsWith('|');
    });

    const paragraphAudits = [];

    rawParagraphs.forEach((paragraph, pIndex) => {
      const cleanPara = paragraph.trim();
      const sentences = cleanPara.split(/(?<=[.!?])\s+/).filter(Boolean);
      const claims = [];

      sentences.forEach((sentence) => {
        const cleanSent = sentence.trim();
        // A sentence is considered a verifiable factual assertion if it contains numbers, percentages, timeframes, or definitive verbs/statistics
        const isStatistical = /\b(\d+%|\d+\.?\d*(ms|s|hours|days|x|×|\$|USD|€|GB|MB|KB|tokens|users|teams|leaders))\b/i.test(cleanSent);
        const isDefinitive = /\b(proves|demonstrates|guarantees|reduces|increases|outperforms|requires|separates|eliminates|satisfies|yields)\b/i.test(cleanSent);
        const isReference = /\b(according to|study by|benchmark|NIST|IEEE|O'Reilly|report|survey)\b/i.test(cleanSent);

        if (isStatistical || isDefinitive || isReference || cleanSent.length > 45) {
          claims.push({
            text: cleanSent,
            isStatistical,
            isDefinitive,
            isReference,
          });
        }
      });

      paragraphAudits.push({
        paragraphIndex: pIndex + 1,
        text: cleanPara,
        claims: claims.slice(0, 4), // Cap at top 4 claims per paragraph
      });
    });

    return paragraphAudits;
  },
};
