import AiMemory from '../models/aiMemory.model.js';
import { errorHandler } from '../utils/error.js';

export const getMemory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) return next(errorHandler(400, 'User ID is required'));

    let memory = await AiMemory.findOne({ userId });
    if (!memory) {
      // Return default initial memory profile if not yet customized
      memory = new AiMemory({ userId });
    }
    return res.status(200).json({ success: true, memory });
  } catch (error) {
    next(error);
  }
};

export const updateMemory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) return next(errorHandler(400, 'User ID is required'));
    if (req.user.id !== userId && !req.user.isAdmin) {
      return next(errorHandler(403, 'You can only update your own AI memory profile'));
    }

    const {
      brandVoice,
      writingStyle,
      targetAudience,
      preferredLength,
      seoRules,
      customInstructions,
    } = req.body;

    const memory = await AiMemory.findOneAndUpdate(
      { userId },
      {
        $set: {
          brandVoice: brandVoice || 'Professional & Authoritative',
          writingStyle: writingStyle || 'Analytical, active voice, concise paragraphs with high structural density',
          targetAudience: targetAudience || 'Senior Staff Engineers, Tech Executives, & Product Architects',
          preferredLength: preferredLength || '1200+ words (Comprehensive Deep Dive)',
          seoRules: seoRules || 'Include LSI keywords across semantic H2/H3 headings, ensure high keyword relevance, and structure actionable comparison tables',
          customInstructions: customInstructions || 'Avoid generic marketing fluff or repetitive filler. Prioritize concrete architectural insights and code specifications.',
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ success: true, memory, message: 'AI Memory Profile synchronized.' });
  } catch (error) {
    next(error);
  }
};
