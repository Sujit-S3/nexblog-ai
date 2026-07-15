/**
 * AIRequest Domain Entity
 * Pure domain model encapsulating AI prompt calculation, cost estimation, and validation rules.
 * Zero external infrastructure or framework dependencies.
 */
export class AIRequestDomain {
  constructor({ prompt, systemInstruction = '', model = 'gemini-1.5-flash', feature = 'generate-article', variables = {} }) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('AIRequestDomain: prompt is required and must be a string');
    }
    this.prompt = prompt.trim();
    this.systemInstruction = systemInstruction.trim();
    this.model = model;
    this.feature = feature;
    this.variables = variables;
  }

  /**
   * Approximate input tokens based on character length (~4 characters per token).
   * Used when exact tokenizer counts are unavailable.
   */
  estimateInputTokens() {
    const totalChars = this.prompt.length + this.systemInstruction.length;
    return Math.max(1, Math.ceil(totalChars / 4));
  }

  /**
   * Approximate output tokens based on character length.
   */
  static estimateOutputTokens(outputText = '') {
    return Math.max(1, Math.ceil(outputText.length / 4));
  }

  /**
   * Calculate approximate cost in USD based on model pricing tier.
   */
  static calculateCostUsd(model, tokensIn, tokensOut) {
    let pricePerMillionIn = 0.075; // default flash tier
    let pricePerMillionOut = 0.30;

    if (model && model.includes('pro')) {
      pricePerMillionIn = 3.50;
      pricePerMillionOut = 10.50;
    } else if (model && model.includes('gpt-4')) {
      pricePerMillionIn = 5.00;
      pricePerMillionOut = 15.00;
    } else if (model && model.includes('local')) {
      pricePerMillionIn = 0;
      pricePerMillionOut = 0;
    }

    const cost = ((tokensIn * pricePerMillionIn) / 1000000) + ((tokensOut * pricePerMillionOut) / 1000000);
    return Number(cost.toFixed(6));
  }
}

export default AIRequestDomain;
