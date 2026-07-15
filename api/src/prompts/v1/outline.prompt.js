export const outlinePrompt = {
  version: 'v1.0.0',
  author: 'NexBlog AI Flagship Architecture Team',
  createdAt: '2026-07-14',
  description: 'Specialized prompt for the Outline Agent to structure a comprehensive H1/H2/H3 blueprint based on research facts.',
  variables: ['topic', 'researchFacts', 'preferredLength'],
  buildPrompt: ({ topic = '', researchFacts = '', preferredLength = '1200+ words' }) => `
You are the NexBlog AI Autonomous Outline Agent.
Based on the following research facts:
---
${researchFacts}
---

Create an authoritative, high-density editorial outline for an article titled: "${topic}".
Target word budget: ${preferredLength}.

Format exactly in clear Markdown:
# ${topic}: Flagship Architectural Exploration

## 1. Executive Introduction & Problem Statement (Target: 200 words)
- Key thesis points and immediate industry context.

## 2. Core Architectural Foundations & Principles (Target: 350 words)
### 2.1 Component Isolation & Scalability
### 2.2 Semantic Observability & Telemetry

## 3. Technical Implementation Specification & Code Structure (Target: 400 words)
- Strategy for code blocks and concrete configurations.
- Comparative Trade-offs Table (Legacy vs. Flagship approach).

## 4. Strategic Recommendations & Conclusion (Target: 250 words)
- Action items and next steps.
`.trim(),
};
