import { EmbeddingStoreProvider } from './EmbeddingStoreProvider.js';
import KnowledgeChunk from '../../models/knowledgeChunk.model.js';
import mongoose from 'mongoose';

export class LocalCosineVectorStore extends EmbeddingStoreProvider {
  constructor() {
    super('LocalCosineStore');
  }

  async createEmbedding(chunkData) {
    const chunk = await KnowledgeChunk.create(chunkData);
    return chunk;
  }

  /**
   * Compute exact cosine similarity between query vector and candidate chunk embedding
   */
  _cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async search(queryVector, topK = 5, filter = {}) {
    // Retrieve candidate chunks matching metadata filters (e.g. userId or documentId)
    const queryFilter = { ...filter };
    if (queryFilter.documentId && typeof queryFilter.documentId === 'string' && mongoose.Types.ObjectId.isValid(queryFilter.documentId)) {
      queryFilter.documentId = new mongoose.Types.ObjectId(queryFilter.documentId);
    }

    const candidateChunks = await KnowledgeChunk.find(queryFilter).lean();
    if (!candidateChunks || candidateChunks.length === 0) return [];

    // Calculate cosine similarity for each candidate
    const scoredChunks = candidateChunks.map((chunk) => {
      const simScore = this._cosineSimilarity(queryVector, chunk.embedding);
      return {
        ...chunk,
        similarityScore: Number(simScore.toFixed(4)),
      };
    });

    // Sort descending by similarity score and return topK
    scoredChunks.sort((a, b) => b.similarityScore - a.similarityScore);
    return scoredChunks.slice(0, topK);
  }

  async delete(docOrChunkId) {
    if (mongoose.Types.ObjectId.isValid(docOrChunkId)) {
      // Try deleting specific chunk first, or all chunks belonging to documentId
      const res = await KnowledgeChunk.deleteMany({
        $or: [{ _id: docOrChunkId }, { documentId: docOrChunkId }],
      });
      return res.deletedCount > 0;
    }
    return false;
  }

  async update(chunkId, data) {
    const updated = await KnowledgeChunk.findByIdAndUpdate(chunkId, { $set: data }, { new: true }).lean();
    return updated;
  }

  async health() {
    try {
      const totalChunks = await KnowledgeChunk.countDocuments();
      return {
        status: 'healthy',
        provider: this.providerName,
        details: `Local Cosine Store active with ${totalChunks} total chunks indexed.`,
      };
    } catch (err) {
      return {
        status: 'degraded',
        provider: this.providerName,
        details: err.message,
      };
    }
  }
}
