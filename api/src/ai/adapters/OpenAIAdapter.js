import AIProviderPort from '../ports/AIProviderPort.interface.js';
import { generateOpenAI } from '../providers/openai.provider.js';

/**
 * OpenAIAdapter
 * Concrete adapter implementing AIProviderPort for OpenAI GPT models.
 */
export class OpenAIAdapter extends AIProviderPort {
  constructor(defaultModel = 'gpt-4o-mini') {
    super('openai', defaultModel);
  }

  async generate({ prompt, systemInstruction = '', model = undefined, options = {} }) {
    const targetModel = model || this.defaultModel;
    const result = await generateOpenAI({
      prompt,
      systemInstruction,
      model: targetModel,
    });
    return result;
  }
}

export default OpenAIAdapter;
