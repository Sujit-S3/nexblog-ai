export const runGrammarAgent = async ({ content, orchestrator }) => {
  const prompt = `Review and verify the following article content for active voice clarity, high syntactic density, and 100% grammar accuracy without altering the core thesis:\n\n${content}`;
  const result = await orchestrator.execute({
    prompt,
    feature: 'grammar',
    variables: { content },
  });
  return result;
};
