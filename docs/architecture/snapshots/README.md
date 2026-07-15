# Architectural Documentation Snapshots

As the AI Knowledge & Content Operating System evolves across major milestones, this folder preserves **immutable historical snapshots** of the architecture. Instead of maintaining a single continuously overwritten document, reviewers can trace exact architectural decisions, structural topologies, and capabilities across versions.

---

## Snapshot Registry

| Version Snapshot | Milestone Title | Primary Engineering Focus | Key Architectural Additions |
| :--- | :--- | :--- | :--- |
| **`V1.md`** | Basic MERN Blog | CRUD Blog Platform | Express REST, Mongoose, React SPA, JWT Auth |
| **`V2.md`** | AI Content Assistant | Prompt Generation & Synthesis | Basic Gemini API integration, article generator |
| **`V3.md`** | AI Knowledge Operating System | Hybrid RAG & Workflows | Vector/Keyword RAG, DAG Workflows, Knowledge Base |
| **`V3.2.md`** | Hexagonal Architecture Boundary | Clean Architecture Refactor | Ports (`ports/`) & Adapters (`adapters/`), AST Fitness |
| **`V3.2.5.md`** | Engineering Stabilization | Queue & Observability Abstraction| `JobQueuePort`, `ObservabilityService`, Split Telemetry |
| **`V3.2.6.md`** | Resilience & Evaluation | Feature Flags & Circuit Breakers | `FeatureFlagService`, `Zod` validation, AST enforcement |
| **`V3.2.7.md`** | Production Validation Baseline | Replay Engine & Readiness Gates | Immutable Replay Engine, A/B Testing, 7 Readiness Gates |
| **`V3.3.md`** *(Next)* | AI Operations Center | Miniature Datadog + LangSmith | Live Traffic Canvas, Replay & Experiment Hub |
| **`V3.4.md`** *(Future)* | Real-Time Collaboration | CRDTs & Operational Transforms | Live Cursors, Presence, Shared Editing, Versioning |
| **`V4.0.md`** *(Future)* | Enterprise Platform | Multi-Tenant Organization Layer | SSO, RBAC, Billing, Audit Logs, Marketplace |
