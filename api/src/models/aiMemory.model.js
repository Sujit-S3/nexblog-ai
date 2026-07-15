import mongoose from 'mongoose';

const aiMemorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    brandVoice: {
      type: String,
      default: 'Professional & Authoritative',
    },
    writingStyle: {
      type: String,
      default: 'Analytical, active voice, concise paragraphs with high structural density',
    },
    targetAudience: {
      type: String,
      default: 'Senior Staff Engineers, Tech Executives, & Product Architects',
    },
    preferredLength: {
      type: String,
      default: '1200+ words (Comprehensive Deep Dive)',
    },
    seoRules: {
      type: String,
      default: 'Include LSI keywords across semantic H2/H3 headings, ensure high keyword relevance, and structure actionable comparison tables',
    },
    customInstructions: {
      type: String,
      default: 'Avoid generic marketing fluff or repetitive filler. Prioritize concrete architectural insights and code specifications.',
    },
  },
  { timestamps: true }
);

const AiMemory = mongoose.model('AiMemory', aiMemorySchema);

export default AiMemory;
