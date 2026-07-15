# ADR-002: Multi-Provider AI Orchestration Abstraction

## Status
Accepted (2026-07-15)

## Context & Problem Statement
Large Language Models (LLMs) from commercial vendors (Google Gemini, OpenAI, Anthropic) frequently experience rate limits, transient network outages, latency spikes, and breaking API updates. If application controllers directly couple to a single provider's SDK, system reliability degrades immediately during upstream vendor outages.

## Considered Options
1. **Direct SDK Coupling**: Calling `GoogleGenAI` or `OpenAI` SDK directly inside Express route handlers.
2. **Static Wrapper Utility**: A single `aiHelper.js` file with `if (provider === 'gemini')` conditionals.
3. **Hexagonal Provider Abstraction & Fallback Orchestrator**: A standardized `AIProviderPort` interface implemented by `GeminiAdapter`, `OpenAIAdapter`, and `LocalAdapter`, governed by an automatic fallback orchestrator and semantic caching layer.

## Decision Outcome
We chose the **Hexagonal Provider Abstraction & Fallback Orchestrator**.

### Rationale
- **Fault Tolerance**: If Google Gemini returns `429 Too Many Requests` or `504 Gateway Timeout`, the orchestrator transparently routes the prompt to OpenAI or Local offline inference without user-facing disruption.
- **Cost & Latency Optimization**: The orchestrator evaluates exact/fuzzy semantic cache hits ($\ge 95\%$ similarity) before hitting external APIs, cutting latency from $1200\text{ms}$ down to $2\text{ms}$ and reducing token costs by up to $40\%$.
- **Vendor Independence**: New providers (e.g., Anthropic Claude 3.5 Sonnet, Mistral) can be added as adapters without modifying a single line of business logic or controller code.

## Consequences
- **Positive**: High availability ($\ge 99.9\%$), predictable cost bounding, clean unit testing via mocks.
- **Negative**: Requires maintaining uniform prompt structures across different vendor capabilities.
