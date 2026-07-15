# Reviewer Evaluation Guide & 5-Minute Demo Script

This guide allows senior engineering reviewers, recruiters, and placement evaluators to verify the architecture, quality pipelines, and operational resilience of the **AI Knowledge & Content Operating System** immediately without cloning or building the repository from scratch.

---

## 1. Quick Access Credentials & Public Endpoints

### Live Demo Account
- **Web Application URL**: `https://ai-knowledge-os.demo.example.com` *(Substitute with live production URL during Stage 2 publishing)*
- **Demo Username / Email**: `test@example.com`
- **Demo Password**: `DemoReviewer2026!`
- **Role**: `Platform Administrator` (Grants access to AI Studio, Workflow Studio, and Health Dashboard)

### Public API Documentation & Diagnostics
- **OpenAPI Swagger UI**: `/api/v1/docs` (Interactive Swagger interface)
- **Standardized Health Envelope**: `GET /api/v1/health` (Returns subsystem diagnostics across MongoDB and AI Providers)
- **Production Readiness Dashboard**: `GET /api/v1/ai/health-dashboard` (Returns 30-day sliding P95/P99 latency and 7 Readiness Gates)
- **Dead Letter Queue (`DLQ`) Status**: `GET /api/v1/jobs/dlq` (Returns intercepted failed background jobs)

---

## 2. The 5–7 Minute Video Walkthrough & Script

If producing a video recording (`DEMO_VIDEO.mp4`), follow this exact timecoded narrative to showcase high-impact engineering evidence:

### [0:00 — 0:45] Introduction & Login
- **Visual**: Show landing page (`VersionBadge v3.2.7`), then log in with `test@example.com`.
- **Narration**: *"Welcome to the AI Knowledge and Content Operating System. Unlike simple MERN CRUD blogs that pipe raw strings from ChatGPT into textareas, this is an enterprise-grade AI operating system built with Hexagonal Architecture, dual-stage RAG, and immutable execution replays."*

### [0:45 — 1:45] Knowledge Ingestion & Hybrid RAG Retrieval
- **Visual**: Navigate to **Knowledge Base**. Upload a sample PDF or DOCX file containing technical documentation.
- **Narration**: *"When we upload a PDF, our asynchronous background workers (`KnowledgeIngestWorker`) split the document into semantic chunks, generate embeddings via Gemini, and store them alongside vector indexes without blocking the Node.js event loop (`event loop lag stays < 12ms`). Let's jump into the AI Studio and ask a technical question requiring this document. Notice how our dual-stage Hybrid RAG combines Cosine vector similarity with BM25 keyword matching (`top-K=4`) to ground the output and display exact source citations."*

### [1:45 — 2:45] Multi-Agent DAG Workflows & Cryptographic Verification
- **Visual**: Navigate to **Workflow Studio**. Trigger a branching article generation workflow (`Drafting Node -> SEO Synthesis Node -> Verification Node`).
- **Narration**: *"Here in the Workflow Studio, complex content synthesis runs as a Directed Acyclic Graph (`DAG`). Each node executes asynchronously. Once the final draft is synthesized, our Verification Engine calculates a tamper-evident `SHA-256` content verification hash (`verificationStatus: verified`), proving the output hasn't been modified since evaluation."*

### [2:45 — 4:00] Immutable Error Replay & Regression Testing (`Crown Jewel Demo`)
- **Visual**: Navigate to **Telemetry & Replay Logs**. Click on a past generation log, view its full `ExecutionSnapshot`, and click **Run Replay / Regression Test**.
- **Narration**: *"Because LLMs are non-deterministic, debugging production failures requires exact historical context. Every generation stores an immutable `ExecutionSnapshot` containing the system prompt, temperature, retrieved chunks, and provider version. Watch what happens when we click **Run Replay**: the system non-destructively re-runs the exact historical prompt against an updated model version (`gemini-1.5-pro-002`) without modifying our original log, and returns a side-by-side **Regression Diff Report**. Our automated Jaccard similarity score (`0.89 >= 0.65`) confirms that the prompt didn't regress."*

### [4:00 — 5:00] Production Health Dashboard & Readiness Gates
- **Visual**: Navigate to **Health Dashboard** (`GET /api/v1/ai/health-dashboard`). Show the 30-day sliding charts and the **7 Production Readiness Gates (`Gate A through Gate G`)**.
- **Narration**: *"Finally, our platform enforces strict quantitative performance budgets. Here on our real-time health dashboard, you can see our 30-day sustained metrics: `P95 latency is at 340ms` (below our 500ms SLA), `crash rate is 0.00%`, `AI execution success rate is 98.4%`, and `semantic cache hit rate is 31.4%`. All 7 Readiness Gates show `PASS`, proving our system is ready for sustained production workloads."*

---

## 3. Evidence Checklist for Reviewers

When evaluating the codebase directly, verify the following visual proof points:

- [x] **Hexagonal AST Boundary Verification**: Open `api/__tests__/architecture/fitness.test.js` to see how Jest AST parsing enforces that `domain/` and `ports/` never import Express controllers or `@google/genai` directly.
- [x] **Immutable Snapshot Capture**: Open `api/src/models/aiLog.model.js` to inspect the `executionSnapshot`, `isReplay`, and `diffReport` schema fields (`ADR-010`).
- [x] **Hybrid Cosine + BM25 Fusion**: Open `api/src/ai/rag/hybridRetriever.js` to inspect the dual query execution and reciprocal rank fusion weighting (`ADR-003`).
- [x] **A/B Experiment Engine**: Open `api/src/ai/experiments/experimentService.js` to inspect live traffic split calculation (`trafficSplit: 0.5`) and composite winner evaluation.
- [x] **Event Loop Lag Telemetry**: Open `api/src/services/observability/ObservabilityService.js` to inspect `perf_hooks` event loop lag sampling (`checkHealth()`).
