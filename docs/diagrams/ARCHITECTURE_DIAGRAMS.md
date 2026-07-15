# Comprehensive C4 & System Architecture Diagrams

This document provides visual engineering evidence of our system boundaries, container interactions, domain ports/adapters, and data flows. Reviewers can evaluate the system architecture directly through these C4 Context, Container, Component, Sequence, and Deployment diagrams.

---

## 1. C4 Context Diagram (`Level 1: System Context`)

Shows the AI Knowledge & Content Operating System in context with external users and third-party AI/Database providers.

```mermaid
C4Context
    title C4 Context Diagram - AI Knowledge & Content Operating System

    Person(author, "Technical Author / Engineer", "Creates technical articles, uploads documentation, and runs AI workflows.")
    Person(admin, "Platform Administrator", "Monitors 30-day health dashboards, readiness gates, and dead letter queues.")

    System_Boundary(ai_os, "AI Knowledge & Content OS") {
        System(system, "Hexagonal AI Operating System", "Orchestrates hybrid RAG, multi-agent workflows, evaluation, and immutable replays.")
    }

    System_Ext(gemini, "Google Gemini API", "Primary LLM provider (gemini-1.5-pro / flash) for content drafting and embeddings.")
    System_Ext(openai, "OpenAI API", "Secondary fallback LLM provider (gpt-4o) for high-concurrency resilience.")
    System_Ext(atlas, "MongoDB Atlas Cloud", "Persists relational entities, vector search embeddings, and immutable execution logs.")

    Rel(author, system, "Drafts content, uploads PDFs/DOCX, and inspects replays via HTTPS")
    Rel(admin, system, "Monitors readiness gates and manages DLQ via HTTPS")
    Rel(system, gemini, "Synthesizes text and generates embeddings via REST API")
    Rel(system, openai, "Routes fallback requests when primary degrades via REST API")
    Rel(system, atlas, "Reads/Writes vectors, chunks, and snapshots via Mongoose Driver")
```

---

## 2. C4 Container Diagram (`Level 2: Container Boundaries`)

Shows the internal architectural containers across the SPA Frontend, Hexagonal API Server, Background Workers, and Storage layers.

```mermaid
C4Container
    title C4 Container Diagram - Application Containers & Hexagonal Boundaries

    Person(user, "User / Reviewer", "Interacts with the platform via browser.")

    Container_Boundary(spa, "Client Frontend") {
        Container(web_app, "React SPA + Vite", "JavaScript / Tailwind CSS", "Provides AI Studio, Knowledge Base upload UI, Workflow Studio, and Health Dashboard.")
    }

    Container_Boundary(backend, "Hexagonal API & Workers") {
        Container(api_server, "Express API Server (v1)", "Node.js / Express / Zod", "Handles versioned REST routes, auth middleware, and delegates to Hexagonal ports.")
        Container(domain_layer, "Pure Domain Core", "Pure ES Modules", "Orchestrates RAG, Branching DAGs, A/B Experiments, and Immutable Replays without vendor SDKs.")
        Container(worker_pool, "Async Queue Workers", "Node.js / JobQueuePort", "Executes background document chunking, vector indexing, and SEO synthesis.")
    }

    Container_Boundary(data_layer, "Persistent Storage") {
        ContainerDb(mongo_atlas, "MongoDB Atlas", "Vector + Relational DB", "Stores Users, Posts, KnowledgeChunks, AiWorkflows, and AiLogs.")
        ContainerDb(cache_layer, "Semantic Cache", "In-Memory / SHA-256 Map", "Intercepts exact and high-cosine similarity prompts instantly (`hit rate >= 25%`).")
    }

    Rel(user, web_app, "Visits SPA routes", "HTTPS / JSON")
    Rel(web_app, api_server, "Invokes REST endpoints (/api/v1/*)", "HTTPS / JSON")
    Rel(api_server, domain_layer, "Calls pure domain orchestration via ports", "Internal Method")
    Rel(api_server, cache_layer, "Checks SHA-256 semantic hash before generation", "Internal Map")
    Rel(domain_layer, worker_pool, "Enqueues heavy async jobs via JobQueuePort", "Event / Queue")
    Rel(domain_layer, mongo_atlas, "Queries & persists domain entities via StoragePort", "Mongoose Driver")
    Rel(worker_pool, mongo_atlas, "Writes vector embeddings and chunks", "Mongoose Driver")
```

---

## 3. C4 Component Diagram (`Level 3: Hexagonal API Components`)

Shows the exact internal breakdown of `api/` into `adapters/`, `ports/`, and `domain/`, providing visual proof of Hexagonal Architecture enforcement (`ADR-005`).

```mermaid
graph TB
    subgraph AdaptersLayer ["Primary Adapters (HTTP / CLI) - api/adapters/"]
        REST[Express v1 Controllers<br/>/api/v1/ai/*, /api/v1/health-dashboard]
        CLI[Automated Scripts<br/>release.js / rollback.sh]
    end

    subgraph PortsLayer ["Hexagonal Interface Ports - api/ports/"]
        AIPort[AIProviderPort<br/>generateText(), embedText()]
        QueuePort[JobQueuePort<br/>addJob(), getDLQStatus()]
        StoragePort[StoragePort<br/>saveLog(), getChunk()]
    end

    subgraph DomainLayer ["Pure Domain Orchestration - api/domain/ & api/ai/"]
        Orchestrator[Orchestrator Engine<br/>Multi-vendor fallback & caching]
        ReplayEngine[Immutable Replay Engine<br/>Non-destructive execution & diffing]
        ExperimentEngine[A/B Experiment Service<br/>Traffic split & composite scoring]
        RAGEngine[Hybrid RAG Engine<br/>Vector Cosine + BM25 Fusion]
        WorkflowEngine[Branching DAG Engine<br/>Node evaluation & error propagation]
    end

    subgraph SecondaryAdapters ["Secondary Adapters (Vendor / Infrastructure) - api/infrastructure/"]
        GeminiAdapter[GeminiProviderAdapter<br/>@google/genai SDK]
        OpenAIAdapter[OpenAIProviderAdapter<br/>openai SDK]
        MongoAdapter[MongoStorageAdapter<br/>Mongoose Models & Zod]
        QueueAdapter[JobQueueProvider<br/>In-Memory / BullMQ]
    end

    REST & CLI --> AIPort & QueuePort & StoragePort
    AIPort & QueuePort & StoragePort --> Orchestrator & ReplayEngine & ExperimentEngine & RAGEngine & WorkflowEngine
    Orchestrator --> AIPort
    ReplayEngine --> StoragePort & AIPort
    ExperimentEngine --> StoragePort
    RAGEngine --> StoragePort & AIPort
    WorkflowEngine --> QueuePort & StoragePort

    AIPort -.->|ProviderFactory| GeminiAdapter & OpenAIAdapter
    StoragePort -.->|Dependency Injection| MongoAdapter
    QueuePort -.->|Dependency Injection| QueueAdapter
```

---

## 4. Sequence Diagram (`Hybrid RAG & Immutable Replay Execution`)

Demonstrates the exact lifecycle of an AI generation request, including semantic cache lookup, hybrid RAG retrieval, vendor execution, and `ExecutionSnapshot` persistence.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / User
    participant Controller as AI Controller (/api/v1/ai/generate)
    participant Cache as Semantic Cache (SHA-256)
    participant RAG as Hybrid RAG Engine
    participant DB as MongoDB Atlas (Vector/BM25)
    participant Provider as AIProviderPort (Gemini/OpenAI)
    participant Replay as AiLog / ExecutionSnapshot

    User->>Controller: POST /api/v1/ai/generate { prompt, feature: 'generate-article' }
    Controller->>Cache: Check SHA-256 hash & Cosine similarity (>0.92)
    alt Cache Hit (Exact / Semantic Match)
        Cache-->>Controller: Return cached completion & tokens saved
        Controller->>Replay: Save log (status: 'cache_hit', tokensOut saved)
        Controller-->>User: 200 OK (Instant Response, $0.00 cost)
    else Cache Miss
        Controller->>RAG: retrieveContext(prompt, k=4)
        RAG->>DB: Execute dual query (Vector Search + BM25 text match)
        DB-->>RAG: Return top-K ranked chunks
        RAG->>RAG: Reciprocal Rank Fusion & context formatting
        RAG-->>Controller: Grounded context string + source citations
        Controller->>Provider: generateText(prompt + grounded context)
        Provider-->>Controller: Return completion text + token metrics
        Controller->>Replay: Persist immutable ExecutionSnapshot (prompt, chunks, provider, cost)
        Controller-->>User: 200 OK (Verified response + citations + logId)
    end
```

---

## 5. Sequence Diagram (`Non-Destructive Replay & Regression Diffing`)

Demonstrates how engineers non-destructively replay historical logs (`/api/v1/ai/logs/:logId/replay`) to verify model updates against regression thresholds (`>= 0.65 similarity`).

```mermaid
sequenceDiagram
    autonumber
    actor Engineer as Platform Engineer
    participant API as Replay Controller (/logs/:logId/replay)
    participant DB as MongoDB (AiLog Collection)
    participant Orchestrator as Orchestrator Engine
    participant Provider as AIProviderPort (Updated Model Version)

    Engineer->>API: POST /api/v1/ai/logs/64f1a.../replay { overrideModel: 'gemini-1.5-pro-002' }
    API->>DB: Fetch Original AiLog & immutable ExecutionSnapshot
    DB-->>API: Return originalSnapshot (request, systemPrompt, retrievedChunks)
    API->>Orchestrator: execute(originalSnapshot.request, isReplay=true, parentLogId=original._id)
    Orchestrator->>Provider: generateText(originalSnapshot.prompt + originalSnapshot.chunks)
    Provider-->>Orchestrator: Return replayCompletion text
    Orchestrator->>Orchestrator: Calculate Jaccard similarity between original and replay
    Orchestrator->>DB: Save child AiLog (isReplay: true, parentLogId, diffReport: { similarity: 0.89, status: 'pass' })
    DB-->>Orchestrator: Child log saved without modifying original log
    Orchestrator-->>API: Return side-by-side originalExecution, replayExecution, and diffReport
    API-->>Engineer: 200 OK (Regression Test Passed: similarity 0.89 >= 0.65 threshold)
```

---

## 6. Entity Relationship Diagram (`ERD: Relational & Vector Knowledge Schema`)

Shows the relational and vector schema structure linking Users, Posts, Knowledge Documents, Chunks, Workflows, Experiments, and Telemetry Logs.

```mermaid
erDiagram
    USER ||--o{ POST : writes
    USER ||--o{ KNOWLEDGE_DOCUMENT : uploads
    USER ||--o{ AI_WORKFLOW : creates
    KNOWLEDGE_DOCUMENT ||--|{ KNOWLEDGE_CHUNK : splits_into
    AI_WORKFLOW ||--o{ AI_LOG : triggers
    AI_LOG ||--o{ AI_LOG : has_child_replay_parentLogId
    AI_EXPERIMENT ||--o{ AI_LOG : tracks_executions

    USER {
        string _id PK
        string username
        string email
        string role
    }

    POST {
        string _id PK
        string title
        string content
        string sha256Hash
        string verificationStatus
        string authorId FK
    }

    KNOWLEDGE_DOCUMENT {
        string _id PK
        string filename
        string fileType
        string status
        number totalChunks
        string ownerId FK
    }

    KNOWLEDGE_CHUNK {
        string _id PK
        string documentId FK
        string chunkText
        number chunkIndex
        floatArray vectorEmbedding
    }

    AI_WORKFLOW {
        string _id PK
        string name
        json nodes
        json edges
        string status
    }

    AI_EXPERIMENT {
        string _id PK
        string name
        string feature
        number trafficSplit
        json variantA
        json variantB
        string winner
    }

    AI_LOG {
        string _id PK
        string prompt
        string completion
        string status
        number latencyMs
        number costUsd
        boolean isReplay
        string parentLogId FK
        json executionSnapshot
        json diffReport
    }
```
