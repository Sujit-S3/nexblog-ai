// Base abstract class defining standard contract for vector storage & retrieval engines
export class EmbeddingStoreProvider {
  constructor(providerName = 'abstract') {
    if (this.constructor === EmbeddingStoreProvider) {
      throw new Error('Abstract class EmbeddingStoreProvider cannot be instantiated directly.');
    }
    this.providerName = providerName;
  }

  /**
   * Store a chunk with its embedding and rich metadata
   * @param {Object} chunkData - { documentId, chunkIndex, text, embedding, metadata }
   * @returns {Promise<Object>} Created chunk document or identifier
   */
  async createEmbedding(chunkData) {
    throw new Error(`Method createEmbedding() must be implemented by ${this.providerName}`);
  }

  /**
   * Search for top-K similar chunks using vector cosine similarity and/or hybrid lexical filtering
   * @param {Array<number>} queryVector - The numeric embedding vector of the search query
   * @param {number} topK - Number of results to return
   * @param {Object} filter - Optional metadata filtering (e.g. { documentId, userId, language })
   * @returns {Promise<Array<Object>>} Array of matching chunks with similarity scores
   */
  async search(queryVector, topK = 5, filter = {}) {
    throw new Error(`Method search() must be implemented by ${this.providerName}`);
  }

  /**
   * Delete all chunks associated with a given document or chunk ID
   * @param {string} docOrChunkId - Document ID or specific Chunk ID to purge
   * @returns {Promise<boolean>} Success indicator
   */
  async delete(docOrChunkId) {
    throw new Error(`Method delete() must be implemented by ${this.providerName}`);
  }

  /**
   * Update chunk metadata or text contents
   * @param {string} chunkId - Target chunk ID
   * @param {Object} data - Fields to update
   * @returns {Promise<Object>} Updated chunk object
   */
  async update(chunkId, data) {
    throw new Error(`Method update() must be implemented by ${this.providerName}`);
  }

  /**
   * Check diagnostic health status of the storage driver
   * @returns {Promise<Object>} { status: 'healthy' | 'degraded' | 'offline', details: string, provider: string }
   */
  async health() {
    return { status: 'healthy', provider: this.providerName };
  }
}
