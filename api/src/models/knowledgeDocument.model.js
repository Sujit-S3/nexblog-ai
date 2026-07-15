import mongoose from 'mongoose';

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: 'Unknown Creator',
    },
    source: {
      type: String,
      required: true, // e.g., 'PDF Upload', 'DOCX Upload', 'Markdown File', 'Web Scrape (URL)'
    },
    sourceUrl: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'md', 'txt', 'url'],
      required: true,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'error'],
      default: 'processing',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    checksum: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      keywords: [{ type: String }],
      language: { type: String, default: 'en' },
      importance: { type: String, enum: ['high', 'medium', 'low'], default: 'high' },
      wordCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
export default KnowledgeDocument;
