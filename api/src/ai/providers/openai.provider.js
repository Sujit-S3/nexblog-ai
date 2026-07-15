export const generateOpenAI = async ({ prompt, systemInstruction = '', model = 'gpt-4o-mini' }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured in environment variables');
  }

  const start = Date.now();
  const url = 'https://api.openai.com/v1/chat/completions';

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const output = data.choices?.[0]?.message?.content || '';
  const latencyMs = Date.now() - start;

  const tokensIn = data.usage?.prompt_tokens || Math.ceil((prompt.length + systemInstruction.length) / 4);
  const tokensOut = data.usage?.completion_tokens || Math.ceil(output.length / 4);

  // Approximate gpt-4o-mini cost ($0.15 / 1M input tokens, $0.60 / 1M output tokens)
  const costUsd = Number(((tokensIn * 0.15 / 1000000) + (tokensOut * 0.60 / 1000000)).toFixed(6));

  return {
    output,
    model,
    provider: 'openai',
    tokensIn,
    tokensOut,
    latencyMs,
    costUsd,
  };
};
