import { seoPrompt } from '../../prompts/v1/seo.prompt.js';

export const runSeoAgent = async ({ topic, content, orchestrator }) => {
  const prompt = seoPrompt.buildPrompt({ topic, content });
  const result = await orchestrator.execute({
    prompt,
    feature: 'seo',
    variables: { topic, content },
  });
  return result;
};
