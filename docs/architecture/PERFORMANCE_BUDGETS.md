# Performance Budgets & SLA Framework

To guarantee enterprise-grade responsiveness and operational stability across all production workloads, the AI Knowledge & Content Operating System strictly enforces **Quantitative Performance Budgets**. Any code commit or deployment pipeline that breaches these budgets is automatically flagged and blocked.

---

## 1. Frontend Performance Budgets

Measured via automated build analyzers (`vite-bundle-visualizer`) and Lighthouse Continuous Integration audits across Desktop and Mobile viewports.

| Metric / Asset Category | Budget Limit | Critical Breach Threshold | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| **Initial JavaScript Bundle (`gzip`)** | **`<= 250 KB`** | `> 300 KB` | `Vite build --report` / CI check |
| **Initial CSS Bundle (`gzip`)** | **`<= 30 KB`** | `> 45 KB` | Tailwind CSS Purge / Tree-shaking |
| **Images (`WebP/AVIF compressed`)** | **`<= 100 KB`** per image | `> 200 KB` | Client lazy-loading & responsive sizing |
| **Web Fonts (`woff2 subset`)** | **`<= 50 KB`** total | `> 80 KB` | Self-hosted `font-display: swap` |
| **Lighthouse Performance Score** | **`>= 95`** (Desktop & Mobile) | `< 90` | Automated CI Lighthouse Action |
| **First Contentful Paint (FCP)** | **`<= 1.2 s`** | `> 1.8 s` | Core Web Vitals telemetry |
| **Largest Contentful Paint (LCP)** | **`<= 2.0 s`** | `> 2.5 s` | Core Web Vitals telemetry |
| **Cumulative Layout Shift (CLS)** | **`<= 0.05`** | `> 0.10` | Strict dimensions on dynamic containers |

---

## 2. Backend & Runtime Performance Budgets

Measured via `observabilityService`, continuous event loop lag monitoring, and `ai.controller.js` execution telemetry.

| Runtime Metric | Target Budget | Critical SLA Breach | Enforcement & Alerting |
| :--- | :--- | :--- | :--- |
| **API Route Latency (`P50`)** | **`<= 80 ms`** | `> 150 ms` | HTTP Histogram / Prometheus metrics |
| **API Route Latency (`P95`)** | **`<= 450 ms`** | `> 500 ms` | Readiness Gate E (`/api/v1/ai/health-dashboard`) |
| **API Route Latency (`P99`)** | **`<= 850 ms`** | `> 1200 ms` | High-priority runtime alert (`triggerAlert`) |
| **Node.js Heap Memory Usage** | **`<= 512 MB`** | `> 768 MB` | Memory threshold check / PM2 auto-reload |
| **Node.js Event Loop Lag** | **`<= 50 ms`** | `> 200 ms` (Degraded) | `ObservabilityService` real-time lag tracking |
| **CPU Average Utilization** | **`<= 60%`** | `> 80%` sustained | Server auto-scaling & load balancing |
| **MongoDB Query Duration (`P95`)** | **`<= 40 ms`** | `> 100 ms` | Compound index enforcement (`Zod/Mongoose`) |
| **Job Queue Execution (`async jobs`)**| **`<= 5.0 s`** | `> 15.0 s` | Dead Letter Queue (`DLQ`) interception |

---

## 3. AI & RAG Pipeline Budgets

Measured via `AiLog` execution snapshots (`executionSnapshot`), semantic cache counters, and provider cost tracking.

| AI Pipeline Metric | Target Budget | Critical Limit | Mitigation & Circuit Breaking |
| :--- | :--- | :--- | :--- |
| **Generation Latency (`P95`)** | **`<= 3,500 ms`** | `> 6,000 ms` | Provider timeout & fallback chain |
| **RAG Vector Retrieval Latency** | **`<= 180 ms`** | `> 350 ms` | In-memory semantic cache / index warming |
| **Average Tokens In per Request** | **`<= 1,500 tokens`** | `> 3,500 tokens` | Context pruning & top-K (`k=4`) limit |
| **Average Tokens Out per Request** | **`<= 2,000 tokens`** | `> 4,000 tokens` | `maxOutputTokens` parameter capping |
| **Average Cost per Generation** | **`<= $0.035 USD`** | `> $0.080 USD` | Automatic downgrade to Flash/Mini models |
| **Semantic Cache Hit Rate** | **`>= 25.0%`** | `< 15.0%` | Exact hash (`SHA-256`) & cosine similarity matching |
| **AI Execution Success Rate** | **`>= 98.0%`** | `< 95.0%` | Readiness Gate G / Vendor failover orchestration |
