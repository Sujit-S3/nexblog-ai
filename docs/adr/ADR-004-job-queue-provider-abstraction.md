# ADR-004: Decoupled Background Job Queue Abstraction

## Status
Accepted (2026-07-15)

## Context & Problem Statement
Document chunking, embedding generation (`KnowledgeIngestWorker`), multi-step workflow execution, and bulk RAG evaluation are CPU/network-intensive tasks taking 5 to 30 seconds. Executing them synchronously blocks Express event loops, causing HTTP timeouts and degraded concurrency. We need background job processing, but hardcoding Redis/BullMQ adds immediate infrastructure complexity during local developer setup and testing.

## Considered Options
1. **Synchronous Execution**: Running ingestion directly inside Express route controllers.
2. **Direct BullMQ / Redis Coupling**: Hardcoding Redis connections across all queue workers.
3. **Abstract JobQueueProvider Contract**: Defining a clean interface (`JobQueueProvider`) with concrete adapters for `MemoryQueueProvider` (development/testing) and `BullMQQueueProvider` (Redis for production staging/prod).

## Decision Outcome
We chose the **Abstract JobQueueProvider Contract**.

### Rationale
- **Zero Local Friction**: Developers and CI/CD runners can start the OS instantly using `MemoryQueueProvider` without spinning up local Docker Redis containers.
- **Production Scalability**: By setting `DEPLOYMENT_PROFILE=production` or providing `REDIS_URL`, the system switches to `BullMQQueueProvider`, enabling horizontal worker scaling across multiple node instances.
- **Resilience**: Both adapters enforce standard exponential backoff retries (`maxRetries: 3`) and automatically route permanently failed jobs to a Dead Letter Queue (`DLQ`) for inspection.

## Consequences
- **Positive**: Clean separation of infrastructure from worker processing logic, robust failure recovery via DLQ.
- **Negative**: Requires synchronizing queue behavior parity between memory and Redis adapters.
