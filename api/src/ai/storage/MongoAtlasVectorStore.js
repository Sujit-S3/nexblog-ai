import { EmbeddingStoreProvider } from './EmbeddingStoreProvider.js';
import KnowledgeChunk from '../../models/knowledgeChunk.model.js';
import mongoose from 'mongoose';

export class MongoAtlasVectorStore extends EmbeddingStoreProvider {
  constructor() {
    super('MongoAtlasVectorStore');
  }

  async createEmbedding(chunkData) {
    const chunk = await KnowledgeChunk.create(chunkData);
    return chunk;
  }

  async search(queryVector, topK = 5, filter = {}) {
    try {
      // Build MongoDB Atlas $vectorSearch aggregation stage
      const vectorSearchStage = {
        $vectorSearch: {
          index: process.env.ATLAS_VECTOR_INDEX || 'knowledge_vector_index',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: topK * 10,
          limit: topK,
        },
      };

      if (Object.keys(filter).length > 0) {
        vectorSearchStage.$vectorSearch.filter = filter;
      }

      const results = await KnowledgeChunk.aggregate([
        vectorSearchStage,
        {
          $project: {
            documentId: 1,
            userId: 1,
            chunkIndex: 1,
            text: 1,
            metadata: 1,
            similarityScore: { $meta: 'vectorSearchScore' },
          },
        },
      ]);

      return results;
    } catch (err) {
      // If running against local MongoDB or without Atlas Vector index created, fallback gracefully
      console.warn(`[MongoAtlasVectorStore] $vectorSearch fallback triggered: ${err.message}`);
      const candidateChunks = await KnowledgeChunk.find(filter).lean();
      if (!candidateChunks || candidateChunks.length === 0) return [];

      const scoredChunks = candidateChunks.map((chunk) => {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        const vecB = chunk.embedding || [];
        for (let i = 0; i < Math.min(queryVector.length, vecB.length); i++) {
          dotProduct += queryVector[i] * vecB[i];
          normA += queryVector[i] * queryVector[i];
          normB += vecB[i] * vecB[i];
        }
        const simScore = (normA === 0 || normB === 0) ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return {
          ...chunk,
          similarityScore: Number(simScore.toFixed(4)),
        };
      });

      scoredChunks.sort((a, b) => b.similarityScore - a.similarityScore);
      return scoredChunks.slice(0, topK);
    }
  }

  async delete(docOrChunkId) {
    if (mongoose.Types.ObjectId.isValid(docOrChunkId)) {
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
        details: `Atlas Vector Store connected with ${totalChunks} indexed chunks.`,
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
