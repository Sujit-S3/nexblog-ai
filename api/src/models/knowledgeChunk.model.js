import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true, // Numeric vector representation (e.g. 64-dim local hash or 768-dim Gemini vector)
    },
    metadata: {
      title: { type: String, default: '' },
      author: { type: String, default: '' },
      page: { type: Number, default: 1 },
      heading: { type: String, default: 'Section Header' },
      section: { type: String, default: '' },
      keywords: [{ type: String }],
      language: { type: String, default: 'en' },
      importance: { type: String, default: 'high' },
      source: { type: String, default: '' },
      checksum: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Compound index for fast user/document lookups
knowledgeChunkSchema.index({ userId: 1, documentId: 1, chunkIndex: 1 });

const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
export default KnowledgeChunk;
