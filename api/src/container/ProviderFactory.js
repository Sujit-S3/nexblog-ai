import GeminiAdapter from '../ai/adapters/GeminiAdapter.js';
import OpenAIAdapter from '../ai/adapters/OpenAIAdapter.js';
import LocalAdapter from '../ai/adapters/LocalAdapter.js';
import MongoVectorStoreAdapter from '../ai/adapters/MongoVectorStoreAdapter.js';
import profileManager from '../config/profiles/ProfileManager.js';

/**
 * ProviderFactory (Composition Root & Dependency Container)
 * Instantiates, caches, and resolves AI providers, vector stores, and services.
 * Controllers and use cases request dependencies via this container instead of ad-hoc instantiation.
 */
class ProviderFactory {
  constructor() {
    this.adapters = new Map();
    this.vectorStore = new MongoVectorStoreAdapter();
  }

  /**
   * Retrieve or create a specific AI provider adapter by name (`gemini`, `openai`, `local`).
   * @param {string} providerName
   */
  getProvider(providerName) {
    const key = providerName.toLowerCase();
    if (!this.adapters.has(key)) {
      if (key === 'gemini') {
        this.adapters.set(key, new GeminiAdapter());
      } else if (key === 'openai') {
        this.adapters.set(key, new OpenAIAdapter());
      } else {
        this.adapters.set(key, new LocalAdapter());
      }
    }
    return this.adapters.get(key);
  }

  /**
   * Get the primary default provider based on environment and profile hierarchy.
   */
  getDefaultProvider() {
    if (process.env.GEMINI_API_KEY) {
      return this.getProvider('gemini');
    }
    if (process.env.OPENAI_API_KEY) {
      return this.getProvider('openai');
    }
    return this.getProvider('local');
  }

  /**
   * Retrieve the configured Vector Store port adapter.
   */
  getVectorStore() {
    return this.vectorStore;
  }
}

export const providerFactory = new ProviderFactory();
export default providerFactory;
