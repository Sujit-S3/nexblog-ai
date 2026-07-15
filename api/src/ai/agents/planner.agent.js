import { outlinePrompt } from '../../prompts/v1/outline.prompt.js';

export const runOutlineAgent = async ({ topic, researchFacts, preferredLength, orchestrator }) => {
  const prompt = outlinePrompt.buildPrompt({ topic, researchFacts, preferredLength });
  const result = await orchestrator.execute({
    prompt,
    feature: 'outline',
    variables: { topic, researchFacts, preferredLength },
  });
  return result;
};
