import MongoVectorStoreAdapter from '../../src/ai/adapters/MongoVectorStoreAdapter.js';

describe('Vector Store Adapter & Cosine Similarity Unit Tests', () => {
  const adapter = new MongoVectorStoreAdapter();

  test('Cosine similarity between identical vectors equals 1.0', () => {
    const vec = [0.1, 0.2, 0.3, 0.4];
    const sim = adapter._cosineSimilarity(vec, vec);
    expect(sim).toBeCloseTo(1.0, 4);
  });

  test('Cosine similarity between orthogonal vectors equals 0.0', () => {
    const vecA = [1, 0, 0, 0];
    const vecB = [0, 1, 0, 0];
    const sim = adapter._cosineSimilarity(vecA, vecB);
    expect(sim).toBeCloseTo(0.0, 4);
  });

  test('Cosine similarity returns 0 when vector norms are zero or length mismatched', () => {
    expect(adapter._cosineSimilarity([0, 0], [1, 1])).toBe(0);
    expect(adapter._cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });
});
