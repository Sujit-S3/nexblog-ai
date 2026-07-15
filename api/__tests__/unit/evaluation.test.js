import AIRequestDomain from '../../src/ai/domain/AIRequest.domain.js';

describe('AI Evaluation & Factual Claim Verification Unit Tests', () => {
  test('AIRequestDomain validates input prompt constraints accurately', () => {
    expect(() => new AIRequestDomain({ prompt: '' })).toThrow();
    expect(() => new AIRequestDomain({ prompt: 123 })).toThrow();

    const valid = new AIRequestDomain({ prompt: 'Write an article on advanced state management in React.' });
    expect(valid.prompt).toBe('Write an article on advanced state management in React.');
    expect(valid.feature).toBe('generate-article');
  });

  test('Output token estimation and tier-based cost calculation scale predictably', () => {
    const tokensOut = AIRequestDomain.estimateOutputTokens('Here is a four hundred character output response representing ten sentences.');
    expect(tokensOut).toBeGreaterThan(10);

    const costStandard = AIRequestDomain.calculateCostUsd('gemini-1.5-flash', 2000, 1000);
    const costPro = AIRequestDomain.calculateCostUsd('gemini-1.5-pro', 2000, 1000);

    expect(costPro).toBeGreaterThan(costStandard);
  });
});
