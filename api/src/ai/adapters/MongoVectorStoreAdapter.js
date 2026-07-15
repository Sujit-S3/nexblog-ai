import VectorStorePort from '../ports/VectorStorePort.interface.js';
import KnowledgeChunk from '../../models/knowledgeChunk.model.js';

/**
 * MongoVectorStoreAdapter
 * Concrete adapter implementing VectorStorePort using MongoDB and exact cosine similarity scoring.
 */
export class MongoVectorStoreAdapter extends VectorStorePort {
  async storeChunks(documentId, chunks) {
    const operations = chunks.map((chunk) => ({
      updateOne: {
        filter: { documentId, chunkIndex: chunk.chunkIndex },
        update: {
          $set: {
            text: chunk.text,
            embedding: chunk.embedding,
            metadata: chunk.metadata || {},
          },
        },
        upsert: true,
      },
    }));

    const res = await KnowledgeChunk.bulkWrite(operations);
    return res.upsertedCount + res.modifiedCount;
  }

  async retrieveSimilar(queryEmbedding, topK = 5, filter = {}) {
    const query = {};
    if (filter.documentId) {
      query.documentId = filter.documentId;
    }

    const allChunks = await KnowledgeChunk.find(query).select('text embedding documentId chunkIndex metadata').lean();
    if (!allChunks || allChunks.length === 0) {
      return [];
    }

    // Compute exact Cosine Similarity against all target chunks
    const scored = allChunks
      .map((chunk) => {
        const similarity = this._cosineSimilarity(queryEmbedding, chunk.embedding || []);
        return {
          text: chunk.text,
          similarity,
          documentId: chunk.documentId,
          metadata: chunk.metadata || {},
        };
      })
      .filter((item) => item.similarity >= (filter.minSimilarity || 0.35))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return scored;
  }

  async deleteChunks(documentId) {
    const res = await KnowledgeChunk.deleteMany({ documentId });
    return res.acknowledged && res.deletedCount >= 0;
  }

  _cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export default MongoVectorStoreAdapter;
