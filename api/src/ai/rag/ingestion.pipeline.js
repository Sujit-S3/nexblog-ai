import KnowledgeDocument from '../../models/knowledgeDocument.model.js';
import { documentProcessor } from '../../services/documentProcessor.service.js';
import { embeddingService } from '../../services/embedding.service.js';
import { getEmbeddingStore } from '../storage/storeFactory.js';
import crypto from 'crypto';

export const ingestionPipeline = {
  /**
   * Execute full ingestion pipeline for an uploaded file, raw text, or web URL
   */
  async ingestDocument({ userId = 'anonymous', title, author, source, sourceUrl, fileType, buffer, rawTextInput }) {
    let doc = null;
    const store = getEmbeddingStore();

    try {
      // 1. Create initial Document record in 'processing' state
      doc = await KnowledgeDocument.create({
        userId,
        title: title || source || 'Untitled Document',
        author: author || 'Unknown Creator',
        source: source || 'Direct Ingestion',
        sourceUrl: sourceUrl || null,
        fileType: fileType || 'txt',
        status: 'processing',
        checksum: 'pending',
      });

      // 2. Parse raw content based on input source
      let rawText = '';
      let pageCount = 1;
      let extractedTitle = title;
      let extractedAuthor = author;

      if (buffer && fileType && fileType !== 'url') {
        const parsed = await documentProcessor.parseBuffer({ buffer, fileType });
        rawText = parsed.rawText;
        pageCount = parsed.pageCount || 1;
      } else if (fileType === 'url' || sourceUrl) {
        const scraped = await documentProcessor.scrapeUrl(sourceUrl || source);
        rawText = scraped.rawText;
        if (!title) extractedTitle = scraped.title;
        if (!author) extractedAuthor = scraped.author;
      } else if (rawTextInput) {
        rawText = rawTextInput;
      } else {
        throw new Error('No valid buffer, URL, or raw text provided for ingestion.');
      }

      // 3. Clean and normalize
      const cleanText = documentProcessor.cleanAndNormalize(rawText);
      if (!cleanText || cleanText.length < 20) {
        throw new Error('Document text too short or empty after normalization.');
      }

      // 4. Compute document checksum and check for duplicates
      const docChecksum = crypto.createHash('sha256').update(cleanText).digest('hex');
      const existingDoc = await KnowledgeDocument.findOne({ userId, checksum: docChecksum, status: 'ready' });
      if (existingDoc && existingDoc._id.toString() !== doc._id.toString()) {
        // Document already indexed cleanly; remove duplicate processing entry and return existing
        await KnowledgeDocument.findByIdAndDelete(doc._id);
        return {
          success: true,
          duplicate: true,
          document: existingDoc,
          chunksCreated: existingDoc.chunkCount,
        };
      }

      // 5. Chunk text into ~250-word blocks with 35-word overlap
      const chunks = documentProcessor.chunkText(cleanText, 250, 35);
      if (chunks.length === 0) {
        throw new Error('Failed to generate text chunks from document.');
      }

      // 6. Generate embeddings and store each chunk with rich metadata
      let totalWords = 0;
      const allKeywords = new Set();

      for (const chunk of chunks) {
        totalWords += chunk.wordCount;
        const metadata = documentProcessor.extractChunkMetadata({
          chunkText: chunk.text,
          chunkIndex: chunk.chunkIndex,
          documentTitle: extractedTitle || doc.title,
          author: extractedAuthor || doc.author,
          source: doc.source,
          page: Math.ceil((chunk.chunkIndex + 1) / Math.max(1, Math.round(chunks.length / pageCount))),
        });

        metadata.keywords?.forEach(k => allKeywords.add(k));

        const embedding = await embeddingService.generateEmbedding(chunk.text);

        await store.createEmbedding({
          documentId: doc._id,
          userId,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          embedding,
          metadata,
        });
      }

      // 7. Update Document status to 'ready'
      doc.status = 'ready';
      doc.title = extractedTitle || doc.title;
      doc.author = extractedAuthor || doc.author;
      doc.chunkCount = chunks.length;
      doc.checksum = docChecksum;
      doc.metadata = {
        keywords: Array.from(allKeywords).slice(0, 15),
        language: 'en',
        importance: 'high',
        wordCount: totalWords,
      };
      await doc.save();

      return {
        success: true,
        duplicate: false,
        document: doc,
        chunksCreated: chunks.length,
      };
    } catch (err) {
      console.error(`[IngestionPipeline] Error processing document: ${err.message}`, err);
      if (doc && doc._id) {
        await KnowledgeDocument.findByIdAndUpdate(doc._id, {
          status: 'error',
          errorMessage: err.message,
        });
      }
      throw err;
    }
  },

  /**
   * Purge a document and all its indexed chunks from vector store
   */
  async deleteDocument({ documentId, userId }) {
    const store = getEmbeddingStore();
    const doc = await KnowledgeDocument.findOne({ _id: documentId, userId });
    if (!doc) throw new Error('Document not found or unauthorized.');

    await store.delete(documentId);
    await KnowledgeDocument.findByIdAndDelete(documentId);
    return { success: true, documentId };
  },
};
