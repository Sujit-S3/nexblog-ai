/**
 * VectorStorePort Interface
 * Hexagonal port defining the contract for vector database indexing and semantic search.
 * Decouples domain RAG retrieval from MongoDB Vector Search, Pinecone, or pgvector.
 */
export class VectorStorePort {
  /**
   * Store a batch of document chunks with their vector embeddings and metadata.
   * @param {string} documentId - Parent document ID
   * @param {Array<{ text: string, chunkIndex: number, embedding: number[], metadata: Object }>} chunks
   * @returns {Promise<number>} - Number of chunks stored
   */
  async storeChunks(documentId, chunks) {
    throw new Error('Method storeChunks() must be implemented by concrete VectorStoreAdapter');
  }

  /**
   * Retrieve the top K most semantically similar chunks for a given embedding.
   * @param {number[]} queryEmbedding - The vector embedding of the query
   * @param {number} topK - Maximum number of chunks to return
   * @param {Object} [filter] - Optional metadata filter (e.g., { documentId: '...' })
   * @returns {Promise<Array<{ text: string, similarity: number, documentId: string, metadata: Object }>>}
   */
  async retrieveSimilar(queryEmbedding, topK = 5, filter = {}) {
    throw new Error('Method retrieveSimilar() must be implemented by concrete VectorStoreAdapter');
  }

  /**
   * Delete all chunks associated with a specific document ID.
   * @param {string} documentId
   * @returns {Promise<boolean>}
   */
  async deleteChunks(documentId) {
    throw new Error('Method deleteChunks() must be implemented by concrete VectorStoreAdapter');
  }
}

export default VectorStorePort;
