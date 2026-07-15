import { aiOrchestrator } from '../../src/ai/orchestrator/orchestrator.js';
import providerFactory from '../../src/container/ProviderFactory.js';
import AIRequestDomain from '../../src/ai/domain/AIRequest.domain.js';

describe('AI Orchestrator & Hexagonal Container Unit Tests', () => {
  test('ProviderFactory resolves correct adapter instances without ad-hoc instantiation', () => {
    const gemini = providerFactory.getProvider('gemini');
    const openai = providerFactory.getProvider('openai');
    const local = providerFactory.getProvider('local');

    expect(gemini.providerName).toBe('gemini');
    expect(openai.providerName).toBe('openai');
    expect(local.providerName).toBe('local');
    expect(gemini).toBe(providerFactory.getProvider('gemini')); // Cached singleton
  });

  test('AIRequestDomain calculates correct token estimations and costs across tiers', () => {
    const req = new AIRequestDomain({
      prompt: 'Test prompt with approximately twenty characters.',
      model: 'gemini-1.5-flash',
    });

    const tokensIn = req.estimateInputTokens();
    expect(tokensIn).toBeGreaterThan(0);

    const costFlash = AIRequestDomain.calculateCostUsd('gemini-1.5-flash', 1000, 500);
    expect(costFlash).toBeGreaterThan(0);

    const costLocal = AIRequestDomain.calculateCostUsd('local-intelligence', 1000, 500);
    expect(costLocal).toBe(0);
  });

  test('AIOrchestrator executes local generation fallback gracefully', async () => {
    const result = await aiOrchestrator.execute({
      prompt: 'Explain Hexagonal Architecture concisely.',
      feature: 'generate-article',
      userId: 'test-user',
    });

    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect(typeof result.output).toBe('string');
    expect(result.provider).toBeDefined();
  });
});
