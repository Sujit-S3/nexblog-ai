export const generateGemini = async ({ prompt, systemInstruction = '', model = 'gemini-1.5-flash' }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  const start = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const output = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const latencyMs = Date.now() - start;

  // Extract usage metadata or approximate token counts
  const tokensIn = data.usageMetadata?.promptTokenCount || Math.ceil((prompt.length + systemInstruction.length) / 4);
  const tokensOut = data.usageMetadata?.candidatesTokenCount || Math.ceil(output.length / 4);
  
  // Approximate Gemini Flash cost ($0.075 / 1M input tokens, $0.30 / 1M output tokens)
  const costUsd = Number(((tokensIn * 0.075 / 1000000) + (tokensOut * 0.30 / 1000000)).toFixed(6));

  return {
    output,
    model,
    provider: 'gemini',
    tokensIn,
    tokensOut,
    latencyMs,
    costUsd,
  };
};
