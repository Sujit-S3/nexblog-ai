# Technical Debt Register

Every mature software platform accumulates technical debt when making conscious engineering trade-offs. We do not hide technical debt; we actively track, quantify, and govern it to ensure architectural integrity and predictability over time.

---

## Technical Debt Tracker

| ID | Description | Impact Area | Priority | Owner | Estimated Effort | Target Release | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TD-001** | In-Memory Job Queue (`queue.service.js`) fallback used during local development when Redis/BullMQ is unavailable. | Scalability & Cluster Persistence | Medium | Platform Engineering | 3 Days | `v3.3.0` | `Tracked` |
| **TD-002** | Direct synchronous method invocations between Knowledge Ingestion and Vector Indexing before Domain Event Bus implementation. | Component Coupling | Medium | Core Backend | 5 Days | `v3.3.0` | `Tracked` |
| **TD-003** | Local BM25/Regex keyword search fallback when MongoDB Vector Search index (`vector_index`) is unconfigured in development. | Retrieval Fidelity | Low | AI/RAG Team | 2 Days | `v3.3.0` | `Tracked` |
| **TD-004** | Hard-coded vendor model fallback chain (`gemini-1.5-pro` -> `gemini-1.5-flash` -> `gpt-4o`) rather than dynamic cost-aware routing table. | AI Cost Optimization | Medium | AI Engineering | 4 Days | `v3.3.0` | `Tracked` |
| **TD-005** | Single-node Mongoose connection pool limit defaults without automated horizontal shard read-replica distribution. | Database Throughput | Low | Infrastructure | 5 Days | `v4.0.0` | `Tracked` |

---

## Governance & Resolution Policy

1. **Mandatory Review**: During every milestone sprint planning session, the Technical Debt Register must be reviewed alongside new feature requests.
2. **20% Capacity Allocation**: A minimum of 20% of engineering effort per release cycle must be allocated to resolving high and medium-priority technical debt items (`TD-XXX`).
3. **Debt Repayment Verification**: Every resolved technical debt item must be accompanied by an automated regression test or architectural boundary test (`fitness.test.js`) preventing re-introduction.
