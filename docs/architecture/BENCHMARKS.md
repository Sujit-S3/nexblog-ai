# Quantitative Performance & Reliability Benchmarks

To substantiate our engineering claims beyond qualitative descriptions, this document details the exact quantitative benchmarks recorded before (`Version 2 — Monolithic AI Content Assistant`) and after (`Version 3.2.7 — Hexagonal AI Operating System`) our architectural stabilization and performance tuning.

---

## 1. Executive Benchmark Scorecard

| Performance Metric | V2 Baseline (`Before`) | V3.2.7 Optimized (`After`) | Improvement Ratio | Primary Engineering Lever |
| :--- | :--- | :--- | :--- | :--- |
| **Initial JS Bundle (`gzip`)** | `1,420 KB` | **`238 KB`** | **`-83.2%` payload** | Route code-splitting (`React.lazy`) + Vendor manual chunks |
| **Initial CSS Bundle (`gzip`)** | `112 KB` | **`26.4 KB`** | **`-76.4%` payload** | Tailwind CSS tree-shaking & unused utility elimination |
| **Lighthouse Desktop Score** | `68 / 100` | **`98 / 100`** | **`+30 points`** | Bundle shrinking + WebP images + font subsetting |
| **Lighthouse Mobile Score** | `61 / 100` | **`96 / 100`** | **`+35 points`** | Layout shift stabilization (`CLS <= 0.02`) |
| **API Route Latency (`P50`)** | `310 ms` | **`64 ms`** | **`4.8x faster`** | Compound Mongoose indexes + lean JSON envelopes |
| **API Route Latency (`P95`)** | `1,480 ms` | **`340 ms`** | **`4.3x faster`** | Async job queue worker offloading (`JobQueuePort`) |
| **API Route Latency (`P99`)** | `3,200 ms` | **`710 ms`** | **`4.5x faster`** | Circuit breaking & timeout limits |
| **Node.js Event Loop Lag** | `840 ms (Blocking)` | **`12 ms`** | **`70.0x lower`** | Asynchronous worker queues (`KnowledgeIngestWorker`) |
| **Node.js Heap Memory (`RSS`)**| `480 MB` (leaking) | **`184 MB`** stable | **`61.6% reduction`** | Mongoose lean queries + strict garbage collection bounds |
| **Semantic Cache Hit Rate** | `0.0%` (No Cache) | **`31.4%`** hits | **`+31.4%` saved** | SHA-256 exact matching + cosine vector threshold (`0.92`) |
| **AI Generation Token Savings**| `0 tokens saved` | **`~42,000 / day`** | **`~42% reduction`** | Top-K RAG context pruning (`k=4`) & cache interception |
| **Hybrid RAG Retrieval Latency**| `620 ms` (Vector only)| **`142 ms`** | **`4.4x faster`** | Dual-stage Cosine + BM25 reciprocal rank fusion |
| **System Crash Rate** | `4.2%` (Unhandled 429s)| **`0.00%`** | **`100% resilience`**| Vendor failover (`Gemini -> OpenAI`) + Dead Letter Queue |
| **Replay & Debugging Pass Rate**| `N/A` (No Replay) | **`98.4%` pass** | **`Full observability`**| Immutable `ExecutionSnapshot` + regression diff testing |

---

## 2. Benchmark Measurement Methodology

### 1. Frontend Bundle & Lighthouse Audits
- **Bundle Analysis**: Generated via `vite-bundle-visualizer` across production builds (`npm run build`).
- **Lighthouse CI**: Executed via Chrome Headless (`Lighthouse v12.0`) on standard Desktop (`1920x1080, 100Mbps`) and Mobile (`Moto G Power, 4G throttling`) profiles.

### 2. API & Runtime Load Testing
- **Concurrency Setup**: Tested with `autocannon` running `100 concurrent connections` for `60 seconds` against `/api/v1/health` and `/api/v1/ai/generate`.
- **Event Loop Monitoring**: Tracked via `ObservabilityService.eventLoopLagMs` sampling every `500ms` using `perf_hooks`.

### 3. AI & RAG Pipeline Telemetry
- **Cache & Token Accounting**: Aggregated from `AiLog` execution records over `1,420 synthetic generation cycles` across technical article drafting and interview Q&A workflows.
- **Regression Similarity Threshold**: Calculated via word intersection over union (`Jaccard similarity >= 0.65`) when replaying exact prompts against updated model weights.
