export const runPublisherAgent = async ({ topic, content, seoData, orchestrator }) => {
  const prompt = `Format and prepare the finalized article titled "${topic}" along with its SEO meta tags (${JSON.stringify(seoData)}) for clean cross-platform publication across Medium, Dev.to, and Notion.`
  const result = await orchestrator.execute({
    prompt,
    feature: 'publisher',
    variables: { topic, content, seoData },
  });
  return result;
};
