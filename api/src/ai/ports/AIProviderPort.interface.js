/**
 * AIProviderPort Interface
 * Hexagonal port defining the contract for all AI generation adapters.
 * Ensures the core domain remains decoupled from Gemini, OpenAI, Anthropic, or local inference specifics.
 */
export class AIProviderPort {
  /**
   * @param {string} providerName - Identifier (e.g., 'gemini', 'openai', 'local')
   * @param {string} defaultModel - Default model name (e.g., 'gemini-1.5-flash')
   */
  constructor(providerName, defaultModel) {
    this.providerName = providerName;
    this.defaultModel = defaultModel;
  }

  /**
   * Generate text or structured output given prompt and system instructions.
   * @param {Object} params
   * @param {string} params.prompt - The input user prompt
   * @param {string} [params.systemInstruction] - System instruction/persona
   * @param {string} [params.model] - Specific model override
   * @param {Object} [params.options] - Temperature, maxTokens, etc.
   * @returns {Promise<{ output: string, model: string, provider: string, tokensIn: number, tokensOut: number, latencyMs: number, costUsd: number }>}
   */
  async generate({ prompt, systemInstruction = '', model = undefined, options = {} }) {
    throw new Error(`Method generate() must be implemented by adapter ${this.providerName}`);
  }
}

export default AIProviderPort;
