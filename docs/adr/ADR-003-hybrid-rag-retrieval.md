# ADR-003: Hybrid RAG Retrieval Strategy

## Status
Accepted (2026-07-15)

## Context & Problem Statement
When generating technical content, case studies, or documentation, generic LLMs suffer from hallucinations and outdated domain knowledge. Pure semantic vector search alone often misses exact keyword references, part numbers, or specific acronyms, while keyword search misses conceptual synonyms.

## Considered Options
1. **No RAG (System Prompting Only)**: Relying entirely on LLM parametric memory.
2. **Pure Vector Cosine Similarity Search**: Chunking documents and ranking solely by vector dot product.
3. **Hybrid RAG Retrieval**: Combining semantic vector similarity scoring (`VectorStorePort`) with exact metadata/keyword filtering and automated citation anchoring.

## Decision Outcome
We chose **Hybrid RAG Retrieval**.

### Rationale
- **Precision & Recall**: By pre-filtering chunks via workspace/document ID metadata and ranking via exact cosine similarity ($s \ge 0.35$), the retriever retrieves high-relevance chunks while filtering out noisy out-of-domain context.
- **Automated Verification**: Retrieved chunks are injected as numbered citation anchors (`[Source 1: title - L12]`). The post-generation verification engine verifies extracted claims against these exact anchors, calculating a factual confidence score.

## Consequences
- **Positive**: Eliminates ungrounded hallucinations, provides verifiable audit trails for technical writers.
- **Negative**: Increases prompt token consumption and requires background embedding generation for uploaded documents.
- **Mitigation**: We offload document ingestion and embedding indexing to asynchronous background workers (`JobQueueProvider`).
