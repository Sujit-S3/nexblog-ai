import { getEmbeddingStore } from '../storage/storeFactory.js';
import { embeddingService } from '../../services/embedding.service.js';
import { contextCompressor } from './contextCompressor.js';

export const retrieverService = {
  /**
   * Retrieve and rerank top-K grounded chunks for a query using hybrid vector/lexical scoring
   */
  async retrieve({ query, userId, documentId, topK = 5, filter = {} }) {
    if (!query || typeof query !== 'string') {
      return { formattedContext: '', selectedChunks: [], totalWords: 0, hits: 0 };
    }

    const store = getEmbeddingStore();
    const queryVector = await embeddingService.generateEmbedding(query);

    // Build filter query
    const searchFilter = { ...filter };
    if (userId && userId !== 'anonymous') searchFilter.userId = userId;
    if (documentId) searchFilter.documentId = documentId;

    // 1. Vector Search for candidate pool (2x topK for reranking buffer)
    const candidateChunks = await store.search(queryVector, topK * 2, searchFilter);
    if (!candidateChunks || candidateChunks.length === 0) {
      return { formattedContext: '', selectedChunks: [], totalWords: 0, hits: 0 };
    }

    // 2. Hybrid Lexical Reranker
    const queryWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    const reranked = candidateChunks.map((chunk) => {
      const textLower = (chunk.text || '').toLowerCase();
      const keywords = chunk.metadata?.keywords || [];

      // Lexical bonus computation
      let lexicalHits = 0;
      for (const word of queryWords) {
        if (textLower.includes(word) || keywords.includes(word)) {
          lexicalHits++;
        }
      }
      const lexicalScore = queryWords.length > 0 ? (lexicalHits / queryWords.length) : 0;

      // Hybrid score: 75% vector cosine similarity + 25% exact keyword hit density
      const hybridScore = (chunk.similarityScore * 0.75) + (lexicalScore * 0.25);

      return {
        ...chunk,
        similarityScore: Number(hybridScore.toFixed(4)),
        vectorScore: chunk.similarityScore,
        lexicalScore: Number(lexicalScore.toFixed(4)),
      };
    });

    // 3. Sort by reranked hybrid score
    reranked.sort((a, b) => b.similarityScore - a.similarityScore);

    // 4. Compress and deduplicate context window
    const compressed = contextCompressor.compress(reranked.slice(0, topK), 1500);

    return {
      ...compressed,
      hits: compressed.selectedChunks.length,
    };
  },
};
