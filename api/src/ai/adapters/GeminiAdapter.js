import AIProviderPort from '../ports/AIProviderPort.interface.js';
import { generateGemini } from '../providers/gemini.provider.js';

/**
 * GeminiAdapter
 * Concrete adapter implementing AIProviderPort for Google Gemini models.
 */
export class GeminiAdapter extends AIProviderPort {
  constructor(defaultModel = 'gemini-1.5-flash') {
    super('gemini', defaultModel);
  }

  async generate({ prompt, systemInstruction = '', model = undefined, options = {} }) {
    const targetModel = model || this.defaultModel;
    const result = await generateGemini({
      prompt,
      systemInstruction,
      model: targetModel,
    });
    return result;
  }
}

export default GeminiAdapter;
