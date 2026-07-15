import { researchPrompt } from '../../prompts/v1/research.prompt.js';

export const runResearchAgent = async ({ topic, keywords = [], orchestrator }) => {
  const prompt = researchPrompt.buildPrompt({ topic, keywords });
  const result = await orchestrator.execute({
    prompt,
    feature: 'research',
    variables: { topic, keywords },
  });
  return result;
};
