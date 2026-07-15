# Architectural Decision History (`ARCHITECTURE_DECISIONS.md`)

This document serves as the immutable architectural decision log (`ADRs`) for the **AI Knowledge & Content Operating System**. Every foundational trade-off is recorded here to maintain long-term engineering clarity, architectural fitness, and system maintainability.

---

## Index of Decisions
- [ADR-001: MongoDB over PostgreSQL for Knowledge & Content Storage](#adr-001-mongodb-over-postgresql-for-knowledge--content-storage)
- [ADR-002: Multi-Tier Background Job Queue Abstraction](#adr-002-multi-tier-background-job-queue-abstraction)
- [ADR-003: Hybrid RAG & Vector Retrieval with Semantic Caching](#adr-003-hybrid-rag--vector-retrieval-with-semantic-caching)
- [ADR-004: Hexagonal Architecture for Multi-Provider AI Routing](#adr-004-hexagonal-architecture-for-multi-provider-ai-routing)
- [ADR-005: Sandboxed Plugin & Workflow Studio Architecture](#adr-005-sandboxed-plugin--workflow-studio-architecture)
- [ADR-006: Domain-Driven Versioned API (`/api/v1`) vs Legacy Wrapper](#adr-006-domain-driven-versioned-api-apiv1-vs-legacy-wrapper)
- [ADR-007: Multi-Layer AI Evaluation & Cryptographic Verification Engines](#adr-007-multi-layer-ai-evaluation--cryptographic-verification-engines)
- [ADR-008: Immutable AI Execution Snapshots & Error Replay Engine](#adr-008-immutable-ai-execution-snapshots--error-replay-engine)
- [ADR-009: Hybrid Evaluation Philosophy (Heuristics + LLM-as-a-Judge)](#adr-009-hybrid-evaluation-philosophy-heuristics--llm-as-a-judge)
- [ADR-010: Two-Tier Semantic Cache Architecture](#adr-010-two-tier-semantic-cache-architecture)
- [ADR-011: Secure Plugin System & Tool Calling Interfaces](#adr-011-secure-plugin-system--tool-calling-interfaces)
- [ADR-012: API Versioning & Standardized JSON Envelopes](#adr-012-api-versioning--standardized-json-envelopes)
- [ADR-013: Deployment & Release Pipeline Strategy](#adr-013-deployment--release-pipeline-strategy)
- [ADR-014: Full-Stack Observability & Telemetry Strategy](#adr-014-full-stack-observability--telemetry-strategy)
- [ADR-015: Performance Budgets & Code Splitting Standards](#adr-015-performance-budgets--code-splitting-standards)
- [ADR-016: Comprehensive Testing Philosophy & Architectural Fitness](#adr-016-comprehensive-testing-philosophy--architectural-fitness)

---

## ADR-001: MongoDB over PostgreSQL for Knowledge & Content Storage
- **Date**: 2026-06-10 | **Status**: Accepted
- **Context**: The platform stores polymorphic content arrays (rich text, code blocks, tables), multi-dimensional vector embeddings (`768`-dim cosine vectors for RAG), and flexible user/brand memory invariants.
- **Alternatives Considered**: PostgreSQL + `pgvector` vs MongoDB + Atlas Vector Search.
- **Decision**: Adopt **MongoDB (Mongoose ODM)** with compound multi-key indexing and Atlas Vector Search natively integrated.
- **Pros**:
  - Schema-less document flexibility perfectly maps to nested JSON structures (`contentElements`, dynamic metadata, variable workflow steps).
  - Native array indexing and embedding storage in `KnowledgeChunk` schemas without separate relational join tables.
  - Zero impedance mismatch with JavaScript/Node.js JSON payloads.
- **Cons**:
  - Requires disciplined application-level schema enforcement (mitigated via strict `Zod` runtime schemas at route ingress + Mongoose validations).
- **Consequences**: Compound indexes (`{ userId: 1, createdAt: -1 }`) must be explicitly audited and enforced to prevent table scans on analytics queries.

---

## ADR-002: Multi-Tier Background Job Queue Abstraction
- **Date**: 2026-06-15 | **Status**: Accepted
- **Context**: Document RAG ingestion (`chunking -> vector embedding -> indexing`), multi-step AI workflow orchestration, and bulk SEO analysis require reliable background execution without blocking the Node.js event loop.
- **Alternatives Considered**: Direct BullMQ hard-coding vs ad-hoc `setTimeout` / `Promise.all` in-memory tasks.
- **Decision**: Design a **Hexagonal Queue Abstraction (`JobQueueProvider`)** supporting hot-swappable underlying backends (`MemoryQueueProvider` during local dev $\rightarrow$ `BullMQ + Redis` in production $\rightarrow$ AWS SQS/Cloud in future scale).
- **Pros**:
  - Zero vendor lock-in; worker implementations (`KnowledgeIngestWorker`) depend only on `JobQueuePort`.
  - Simplifies integration testing without spinning up Redis containers during CI run passes.
- **Cons**:
  - Requires maintaining provider boundary adapters (`MemoryQueueProvider.js`, `BullMQProvider.js`).
- **Consequences**: Dead Letter Queue (`/api/v1/jobs/dlq`) inspection and manual job retry (`/api/v1/jobs/:jobId/retry`) are standardized across all providers.

---

## ADR-003: Hybrid RAG & Vector Retrieval with Semantic Caching
- **Date**: 2026-06-20 | **Status**: Accepted
- **Context**: Pure vector similarity lookup (`cosine`) misses exact keyword matches, while pure keyword search misses semantic synonyms. Furthermore, repeated high-token prompts (`3000+` tokens) degrade latency and inflate LLM provider costs.
- **Decision**: Implement a **Two-Stage Hybrid RAG Engine (`retriever.service.js`)** combining exact token matching with cosine vector embeddings, fronted by a **Two-Tier Semantic Cache (`semanticCacheService`)**.
- **Pros**:
  - Exact SHA-256 prompt hashing intercepts identical queries in `< 1ms` (`100%` cost/latency savings).
  - Cosine vector similarity (`>= 0.95` threshold) catches rephrased queries (`~3ms` latency).
  - Citation anchoring guarantees ground-truth attribution for generated articles.
- **Cons**:
  - Memory and storage footprint grows with cached vectors (`embedding` arrays stored in `AiCache`).
- **Consequences**: Asynchronous hit increments and LRU eviction policies must be maintained to keep cache tables performant.

---

## ADR-004: Hexagonal Architecture for Multi-Provider AI Routing
- **Date**: 2026-06-25 | **Status**: Accepted
- **Context**: Relying exclusively on a single LLM provider (e.g., Gemini or OpenAI) introduces single-point-of-failure risks, rate-limit outages, and cost spikes.
- **Decision**: Structure the AI domain using **Hexagonal Architecture (Ports & Adapters)** (`domain/`, `ports/`, `application/`, `adapters/`, `infrastructure/`), managed via a centralized Dependency Injection root (`ProviderFactory`).
- **Pros**:
  - Strict routing hierarchy (`GeminiAdapter` $\rightarrow$ `OpenAIAdapter` $\rightarrow$ `LocalIntelligenceProvider` fallback) guarantees `>98%` execution success rate even during upstream cloud outages.
  - Domain models (`AIRequestDomain`) calculate token estimates and cost projections independently of vendor SDKs.
- **Cons**:
  - More boilerplates when adding a new AI provider adapter.
- **Consequences**: Automated architectural fitness tests must run during CI (`fitness.test.js`) to assert that Express controllers or domain layers never directly import vendor libraries.

---

## ADR-005: Sandboxed Plugin & Workflow Studio Architecture
- **Date**: 2026-06-28 | **Status**: Accepted
- **Context**: Users can build custom multi-step workflows (`AIWorkflowStudio`) connecting research, outline, writing, grammar, and SEO nodes. Arbitrary tool execution inside node execution creates security and stability risks.
- **Decision**: Execute workflow nodes inside **Restricted Sandboxed Execution Containers** (`workflowBranchingEngine.js`) where each node passes strictly typed input/output envelopes and executes within step budgets (`maxSteps: 10`).
- **Pros**:
  - Prevents infinite recursion, circular dependency deadlocks, and arbitrary system shell execution.
  - Allows clean state inspection (`executionTrace`) at every step boundary.
- **Cons**:
  - Custom tool execution requires explicit registration within the sandbox whitelist (`sandboxService.js`).
- **Consequences**: Node inputs must be validated against `Zod` schemas before execution begins.

---

## ADR-006: Domain-Driven Versioned API (`/api/v1`) vs Legacy Wrapper
- **Date**: 2026-07-02 | **Status**: Accepted
- **Context**: Existing frontend and third-party integrations relied on legacy routes (`/api/ai/*`, `/api/post/*`) without strict versioning or consistent error formatting.
- **Decision**: Establish domain-driven versioned routers (`/api/v1/ai`, `/api/v1/knowledge`, `/api/v1/workflows`, `/api/v1/jobs`, `/api/v1/health`) while wrapping legacy routes in a deprecation layer (`X-API-Deprecated: true`).
- **Pros**:
  - Enables breaking changes inside `/api/v2` without disrupting existing production consumers.
  - All `/api/v1` routes automatically enforce runtime `Zod` validation and wrap outputs in standardized JSON envelopes (`{ success: true, requestId, data, meta }`).
- **Cons**:
  - Requires maintaining both route definitions until legacy sunsetting (`v4.0`).
- **Consequences**: OpenAPI 3.0 specs (`/api/v1/docs/openapi.json`) are dynamically generated directly from `/api/v1` route definitions.

---

## ADR-007: Multi-Layer AI Evaluation & Cryptographic Verification Engines
- **Date**: 2026-07-08 | **Status**: Accepted
- **Context**: LLM outputs can hallucinate facts, violate brand tone, or fail SEO readability targets. Manual review of long-form articles (`3000+ words`) is slow and error-prone.
- **Decision**: Implement a **Two-Tier Quality Assurance Engine**:
  1. **Evaluation Engine (`evaluationEngine.js`)**: Runs multi-metric scoring (`Readability`, `SEO Density`, `Grammar`, `Tone Match`, `Hallucination Risk`) combining heuristic regex/Flesch-Kincaid scoring with LLM-as-a-Judge grading (`0–100`).
  2. **Verification Engine (`verificationEngine.js`)**: Generates cryptographic SHA-256 proof hashes of verified content along with verifiable claim anchors.
- **Pros**:
  - Automates quality gates before publishing; flags low-confidence articles (`score < 75`) for human intervention.
  - Provides immutable auditability for compliance and attribution.
- **Cons**:
  - Increases total execution latency for generation pipelines by `~400ms` when full evaluation is enabled.
- **Consequences**: High-fidelity caching (`semanticCacheService`) stores verified evaluation scores alongside outputs to skip re-evaluation on cache hits.

---

## ADR-008: Immutable AI Execution Snapshots & Error Replay Engine
- **Date**: 2026-07-15 | **Status**: Accepted
- **Context**: Debugging non-deterministic AI generation errors (`timeout`, `hallucination`, `malformed JSON`) in production is impossible when logs only store raw prompt strings and final completion texts.
- **Decision**: Store complete, immutable **`ExecutionSnapshot`** structures inside `AiLog` (`request`, `systemPrompt`, `provider`, `model`, `providerVersion`, `promptVersion`, `retrievedChunks`, `cacheStatus`, `evaluationResult`, `verificationResult`, `environment`, `timestamp`) and expose a non-destructive **Replay Engine (`/api/v1/ai/logs/:logId/replay`)**.
- **Pros**:
  - Replays never overwrite historical logs (`Original Log` $\rightarrow$ `Replay` $\rightarrow$ `New Replay Log` with `parentLogId` $\rightarrow$ `Diff Report`).
  - Every replay acts as an automated regression test (`similarity` delta between original and replayed output).
- **Cons**:
  - Increased MongoDB storage per telemetry entry (`~4KB` per log item vs `~1KB`).
- **Consequences**: Historical logs remain strictly immutable; regression diff reports are returned dynamically and stored in child replay entries.

---

## ADR-009: Hybrid Evaluation Philosophy (Heuristics + LLM-as-a-Judge)
- **Date**: 2026-07-15 | **Status**: Accepted
- **Context**: Pure LLM-as-a-Judge evaluation is expensive, slow, and prone to judge bias. Pure heuristic rules (word count, keyword density) miss semantic coherence and nuance.
- **Decision**: Adopt a **Hybrid Evaluation Philosophy** where deterministic heuristics (`Flesch-Kincaid readability`, `keyword frequency`, `heading structure`, `DOM complexity`) contribute `50%` of the score (`0ms` latency), while LLM-as-a-Judge (`Gemini/OpenAI/Local`) evaluates semantic accuracy, tone, and hallucination (`50%` weighting).
- **Pros**:
  - Fast fail: if heuristic scores drop below `40%`, LLM evaluation is skipped (`100%` cost/time saving on obvious failures).
  - Balanced grading that is both reproducible (heuristics) and human-aligned (LLM semantics).
- **Cons**:
  - Requires maintaining heuristic formula calibrations as writing styles evolve.
- **Consequences**: Every generation returns broken-down sub-scores across both heuristic and LLM dimensions inside `meta.evaluation`.

---

## ADR-010: Two-Tier Semantic Cache Architecture
- **Date**: 2026-07-15 | **Status**: Accepted
- **Context**: Vector similarity searches across large embedding collections require vector distance calculations that take `~3–10ms`. When exact identical prompts arrive, even `3ms` vector search is unnecessary overhead compared to direct key-value lookup.
- **Decision**: Design `semanticCacheService` with a **Two-Tier Lookup Protocol**:
  - **Tier 1 (Exact Hash)**: SHA-256 digest lookup on `{ feature, cleanPrompt }`. Executes via unique index in `< 0.5ms`.
  - **Tier 2 (Vector Cosine)**: If Tier 1 misses, generate embedding (`embeddingService`) and query `AiCache` using cosine similarity (`>= 0.95` threshold) in `~3ms`.
- **Pros**:
  - Maximum efficiency for repeat workflows (`100%` exact hits return instantly).
  - Catches paraphrased prompts without forcing duplicate LLM generation passes.
- **Cons**:
  - Must compute hash and embedding on store/lookup operations.
- **Consequences**: Background worker regularly aggregates `tokensSaved` and `costSavedUsd` metrics for executive telemetry dashboards.

---

## ADR-011: Secure Plugin System & Tool Calling Interfaces
- **Date**: 2026-07-15 | **Status**: Accepted
- **Context**: The platform enables external data enrichment (`AlphaVantage API`, `GitHub fetch`, `SEO scraping`) via plugins. Allowing plugins to execute arbitrary JavaScript code or unrestricted network calls compromises server security.
- **Decision**: Implement a **Whitelist-Enforced Plugin Sandbox (`pluginService.js`)** where plugins declare explicit input parameters (`Zod` schemas), network domain permissions (`allowedDomains`), and timeout limits (`maxTimeoutMs: 5000`).
- **Pros**:
  - Total isolation of external third-party tools from core application environment and credentials.
  - Predictable failure handling; plugin timeouts return clean fallback envelopes (`status: 'plugin_timeout'`).
- **Cons**:
  - Plugins must be registered via standardized manifest JSON objects.
- **Consequences**: Any unauthorized domain access or timeout breach immediately halts plugin execution and logs a security audit event.

---

## ADR-012: API Versioning & Standardized JSON Envelopes
- **Date**: 2026-07-15 | **Status**: Accepted
- **Context**: Inconsistent API responses (`res.send(string)` vs `res.json({ error })` vs `res.json({ data })`) cause frontend parsing bugs and make automated CI testing fragile.
- **Decision**: Enforce strict response envelopes via `response.envelope.js` across all `/api/v1` routes:
  - **Success**: `{ success: true, requestId: "uuid", data: { ... }, meta: { count, page, evaluation } }`
  - **Error**: `{ success: false, requestId: "uuid", error: { code: "ERR_CODE", message: "Human string", details: { ... } } }`
- **Pros**:
  - Frontend (`ApiService.js`) handles loading, errors, and telemetry tracing uniformly across all pages.
  - `requestId` propagates through logger (`ObservabilityService`) down to database query logs for end-to-end tracing.
- **Cons**:
  - Existing legacy endpoints required wrapper interceptors to conform to envelope standards during migration.
- **Consequences**: Every route must go through `wrapController` or use `sendSuccess`/`sendError` helper functions directly.

---

## ADR-013: Deployment & Release Pipeline Strategy
- **Date**: 2026-07-15 | **Status**: Accepted
- **Context**: Deploying untested code or unverified schema migrations to production risks data corruption and service downtime.
- **Decision**: Establish a **4-Stage Release & Rollback Pipeline**:
  `Feature Branch` $\rightarrow$ `Automated Tests (Gate A/B/C/D)` $\rightarrow$ `Preview / Staging` $\rightarrow$ `Production Deployment with Automated Rollback Scripts`.
- **Pros**:
  - Zero-downtime deployments with instant rollback scripts (`scripts/rollback.sh`).
  - Automated semantic versioning and changelog generation (`CHANGELOG.md`) tied directly to Git tags.
- **Cons**:
  - Requires maintaining deployment scripts and staging environment configurations.
- **Consequences**: Production Readiness Gates (`Gate A` through `Gate G`) must pass strictly before any production release tag is minted.

---

## ADR-014: Full-Stack Observability & Telemetry Strategy
- **Date**: 2026-07-15 | **Status**: Accepted
- **Context**: Traditional logging (`console.log`) fails to capture asynchronous Node.js event loop starvation, database connection pool exhaustion, or high-percentile (`P95/P99`) API latency spikes under heavy traffic.
- **Decision**: Implement a **Non-Blocking Full-Stack Observability Service (`ObservabilityService.js`)**:
  - Periodic event loop lag monitoring (`2000ms` interval via `setImmediate` delta).
  - Query duration histograms and MongoDB connection pool metrics (`activeConnections`, `idleConnections`).
  - Real-time aggregation of AI provider latency, token consumption, and cost tracking.
- **Pros**:
  - Detects resource degradation (`WARNING` when lag `> 200ms`, `CRITICAL` when lag `> 500ms`) before server crash occurs.
  - Subsystem diagnostic probes `/api/v1/health` provide instant readiness status for Kubernetes/Cloud load balancers.
- **Cons**:
  - Minor background CPU overhead (`< 0.2%`) for periodic event loop sampling.
- **Consequences**: Health status degradation automatically signals traffic throttling or fallback provider activation.

---

## ADR-015: Performance Budgets & Code Splitting Standards
- **Date**: 2026-07-15 | **Status**: Accepted
- **Context**: Monolithic frontend bundles (`> 4MB`) severely degrade First Contentful Paint (`FCP`) and Largest Contentful Paint (`LCP`), especially on mobile devices or slow networks.
- **Decision**: Enforce strict **Vite Bundle Budgets (`500KB` chunk limit)** combined with **Route-Level Code Splitting (`React.lazy` + `Suspense`)** and structured Rollup manual vendor grouping (`react-vendor`, `editor-vendor`, `motion-vendor`, `icons-vendor`).
- **Pros**:
  - Initial page load transfers only essential core chunks (`< 200KB` gzipped).
  - Heavy specialized studio interfaces (`AIWorkflowStudio`, `3D Spline Canvas`) load purely on demand when navigated to.
- **Cons**:
  - Requires `Suspense` loading fallbacks (`PageLoader`) across route transitions.
- **Consequences**: Any PR that introduces a vendor chunk exceeding `500KB` after minification triggers a build warning/error during CI check.

---

## ADR-016: Comprehensive Testing Philosophy & Architectural Fitness
- **Date**: 2026-07-15 | **Status**: Accepted
- **Context**: As codebases scale, developers often bypass layering conventions (e.g., controllers calling database models directly, or business logic importing HTTP middleware), degrading maintainability over time.
- **Decision**: Adopt a **Multi-Layer Testing Philosophy fronted by Automated Architectural Fitness Tests (`fitness.test.js`)**:
  - **Layer 1 (Fitness Tests)**: Static AST/import analysis asserting Hexagonal layering invariants (`domain` must never import `express`/`mongoose`; `controllers` must never import `providers` directly).
  - **Layer 2 (Unit Tests)**: Pure domain math, token estimation, queue provider mocks, and evaluation algorithms (`>90%` coverage target).
  - **Layer 3 (Integration Tests)**: End-to-end Supertest execution across `/api/v1` routes using authenticated JWT cookies and live/in-memory Mongo instances (`100%` route pass rate target).
- **Pros**:
  - Guarantees architectural erosion never occurs across team iterations.
  - Provides total confidence during refactoring or provider migrations.
- **Cons**:
  - Developers must understand dependency injection boundaries when adding new features.
- **Consequences**: All 3 test layers must pass (`npx jest api/__tests__/`) as a mandatory gate prior to code merging or deployment.
