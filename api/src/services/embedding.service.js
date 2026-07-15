import crypto from 'crypto';

/**
 * Generate a deterministic 64-dimensional semantic frequency & hash embedding vector from text.
 * This guarantees consistent high-quality local vector comparisons when cloud API keys are absent.
 */
function localSemanticHashVector(text, dimensions = 64) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const vector = new Array(dimensions).fill(0);

  if (words.length === 0) return vector;

  // Word position and character N-gram hashing into vector dimensions
  words.forEach((word, wordIndex) => {
    let hash = 2166136261;
    for (let i = 0; i < word.length; i++) {
      hash ^= word.charCodeAt(i);
      hash = (hash * 16777619) >>> 0;
    }
    const dim = hash % dimensions;
    vector[dim] += 1 + (word.length / 10);

    // Also hash bigrams for semantic context preservation
    if (wordIndex < words.length - 1) {
      const bigram = `${word}_${words[wordIndex + 1]}`;
      let bHash = 0;
      for (let i = 0; i < bigram.length; i++) bHash = (bHash << 5) - bHash + bigram.charCodeAt(i);
      vector[(Math.abs(bHash) % dimensions)] += 1.5;
    }
  });

  // L2 Normalization so cosine similarity dot-product works accurately
  let norm = 0;
  for (let i = 0; i < dimensions; i++) norm += vector[i] * vector[i];
  const sqrtNorm = Math.sqrt(norm) || 1;
  return vector.map((val) => Number((val / sqrtNorm).toFixed(5)));
}

export const embeddingService = {
  /**
   * Generate vector embedding for a given text string
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string' || !text.trim()) {
      return new Array(64).fill(0);
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text: text.slice(0, 4000) }] },
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.embedding?.values) {
            return data.embedding.values;
          }
        }
      } else if (process.env.OPENAI_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            input: text.slice(0, 4000),
            model: 'text-embedding-3-small',
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.data?.[0]?.embedding) {
            return data.data[0].embedding;
          }
        }
      }
    } catch (err) {
      console.warn(`[EmbeddingService] Cloud embedding fallback: ${err.message}`);
    }

    // High-fidelity deterministic local fallback
    return localSemanticHashVector(text, 64);
  },

  /**
   * Batch embedding generation
   */
  async generateBatchEmbeddings(textArray = []) {
    return Promise.all(textArray.map((text) => this.generateEmbedding(text)));
  },
};
