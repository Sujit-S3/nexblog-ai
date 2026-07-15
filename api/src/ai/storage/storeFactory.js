import { LocalCosineVectorStore } from './LocalCosineVectorStore.js';
import { MongoAtlasVectorStore } from './MongoAtlasVectorStore.js';

let activeStoreInstance = null;

export const getEmbeddingStore = () => {
  if (activeStoreInstance) return activeStoreInstance;

  if (process.env.USE_ATLAS_VECTOR === 'true' || process.env.ATLAS_VECTOR_INDEX) {
    activeStoreInstance = new MongoAtlasVectorStore();
  } else {
    activeStoreInstance = new LocalCosineVectorStore();
  }

  return activeStoreInstance;
};

export const resetEmbeddingStore = () => {
  activeStoreInstance = null;
};

export const storeFactory = {
  getStore: getEmbeddingStore,
  resetStore: resetEmbeddingStore,
};

