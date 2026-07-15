import AIProviderPort from '../ports/AIProviderPort.interface.js';
import { generateLocal } from '../providers/local.provider.js';

/**
 * LocalAdapter
 * Concrete adapter implementing AIProviderPort for local offline/mock inference.
 */
export class LocalAdapter extends AIProviderPort {
  constructor(defaultModel = 'local-intelligence-v1') {
    super('local', defaultModel);
  }

  async generate({ prompt, systemInstruction = '', model = undefined, options = {} }) {
    const targetModel = model || this.defaultModel;
    const result = await generateLocal({
      prompt,
      systemInstruction,
      feature: options.feature || 'studio-chat',
      variables: options.variables || {},
    });
    return {
      ...result,
      model: targetModel,
      provider: 'local',
    };
  }
}

export default LocalAdapter;
