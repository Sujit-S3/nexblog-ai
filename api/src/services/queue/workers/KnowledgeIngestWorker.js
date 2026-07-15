import { documentProcessor } from '../../documentProcessor.service.js';
import { embeddingService } from '../../embedding.service.js';
import providerFactory from '../../../container/ProviderFactory.js';
import KnowledgeDocument from '../../../models/knowledgeDocument.model.js';
import queueManager from '../QueueManager.js';

/**
 * KnowledgeIngestWorker
 * Background worker responsible for chunking, embedding generation, and vector indexing of uploaded knowledge documents.
 */
export const knowledgeIngestHandler = async (payload, progressCallback = () => {}, job = null) => {
  const { documentId, rawText, title = '', author = '', source = '', userId = 'anonymous' } = payload;
  if (!documentId || !rawText) {
    throw new Error('KnowledgeIngestWorker: documentId and rawText are required payload items.');
  }

  // Step 1: Clean & Normalize (10% progress)
  progressCallback(10);
  const normalized = documentProcessor.cleanAndNormalize(rawText);
  const chunks = documentProcessor.chunkText(normalized, 250, 35);

  if (chunks.length === 0) {
    throw new Error('KnowledgeIngestWorker: Document yielded 0 valid text chunks.');
  }

  // Step 2: Generate Vector Embeddings & Rich Metadata (10% -> 80% progress)
  const chunkRecords = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await embeddingService.generateEmbedding(chunk.text);
    const metadata = documentProcessor.extractChunkMetadata({
      chunkText: chunk.text,
      chunkIndex: chunk.chunkIndex,
      documentTitle: title,
      author,
      source,
    });

    chunkRecords.push({
      text: chunk.text,
      chunkIndex: chunk.chunkIndex,
      embedding,
      metadata: {
        ...metadata,
        userId,
      },
    });

    const currentPct = 10 + Math.floor(((i + 1) / chunks.length) * 70);
    progressCallback(currentPct);
  }

  // Step 3: Store chunks via Hexagonal VectorStorePort (80% -> 90% progress)
  progressCallback(85);
  const vectorStore = providerFactory.getVectorStore();
  const chunksStored = await vectorStore.storeChunks(documentId, chunkRecords);

  // Step 4: Update KnowledgeDocument record in DB (95% progress)
  progressCallback(95);
  try {
    await KnowledgeDocument.findByIdAndUpdate(documentId, {
      status: 'completed',
      chunkCount: chunksStored,
      errorMessage: null,
    });
  } catch (dbErr) {
    console.warn(`KnowledgeIngestWorker: Could not update status on KnowledgeDocument ${documentId}: ${dbErr.message}`);
  }

  progressCallback(100);
  return {
    documentId,
    chunksStored,
    title,
    status: 'completed',
  };
};

/**
 * Register the worker with the active queue provider.
 */
export function registerKnowledgeWorker() {
  const queueProvider = queueManager.getQueueProvider();
  queueProvider.registerWorker('knowledge-ingest', knowledgeIngestHandler);
  console.log('✅ [KnowledgeIngestWorker] Registered background worker on queue: knowledge-ingest');
}

export default {
  handler: knowledgeIngestHandler,
  register: registerKnowledgeWorker,
};
