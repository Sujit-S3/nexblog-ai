# ADR-001: Selection of MongoDB as Primary Document & Vector Storage Engine

## Status
Accepted (2026-07-15)

## Context & Problem Statement
The AI Knowledge & Content Operating System requires storing heterogeneous, highly dynamic data schemas including user workspaces, rich article drafts, hierarchical comments, AI memory invariants, telemetry logs, and high-dimensional vector embeddings (`Number[]` for RAG chunks). We evaluated whether to use a relational database (PostgreSQL with `pgvector`), a dedicated vector database alongside a SQL database, or a unified NoSQL document store with vector support.

## Considered Options
1. **PostgreSQL + pgvector**: Relational integrity with vector similarity extensions.
2. **PostgreSQL + Pinecone/Qdrant**: Split architecture with relational metadata in SQL and vectors in a specialized cloud database.
3. **MongoDB Atlas / Mongoose**: Unified document store supporting flexible JSON schemas, nested subdocuments, high-throughput writes for telemetry/logging, and built-in exact/approximate vector cosine similarity search.

## Decision Outcome
We chose **MongoDB with Mongoose** as our unified primary database and vector storage layer.

### Rationale
- **Single Source of Truth**: Eliminates network split-brain risks and synchronization latency between separate metadata and vector databases.
- **Flexible AI Schemas**: AI workflow DAG nodes, plugin manifests, and document chunks vary widely in structure; schema-less document collections handle these effortlessly while Mongoose enforces application-level validation where needed.
- **High-Throughput Telemetry**: MongoDB handles append-heavy logging (`AiLog`, `TelemetryLog`) and exact vector similarity ranking (`MongoVectorStoreAdapter`) with minimal overhead.

## Consequences
- **Positive**: Simplified DevOps deployment (`MONGO` connection string), zero multi-database join latency, rapid feature iteration.
- **Negative**: Lack of strict database-level relational foreign key constraints.
- **Mitigation**: We enforce strict schema invariants and referential integrity using Mongoose models and Zod runtime validators at the API layer.
