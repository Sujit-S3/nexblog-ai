import { writerPrompt } from '../../prompts/v1/writer.prompt.js';

export const runWriterAgent = async ({ topic, outline, researchFacts, preferredLength, seoRules, orchestrator }) => {
  const prompt = writerPrompt.buildPrompt({ topic, outline, researchFacts, preferredLength, seoRules });
  const result = await orchestrator.execute({
    prompt,
    feature: 'generate-article',
    variables: { topic, outline, researchFacts, preferredLength, seoRules },
  });
  return result;
};
