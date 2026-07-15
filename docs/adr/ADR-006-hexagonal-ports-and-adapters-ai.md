# ADR-006: Hexagonal (Ports & Adapters) AI Architecture

## Status
Accepted (2026-07-15)

## Context & Problem Statement
In conventional MVC Node.js applications, controllers often directly instantiate external SDKs (`new GoogleGenAI()`) and execute database queries (`AiMemory.findOne()`). Over time, domain business rules (like token calculation, claim verification math, and prompt assembly) become tangled with HTTP request parsing and database drivers, making isolated testing and architectural evolution extremely difficult.

## Considered Options
1. **Layered MVC (Controller -> Service -> Model)**: Standard Express separation where services directly import Mongoose and SDKs.
2. **Hexagonal (Ports & Adapters) Architecture**: Structuring the AI engine into concentric rings (`domain/`, `ports/`, `application/`, `adapters/`, `infrastructure/`), where inner layers have zero dependencies on outer infrastructure layers.

## Decision Outcome
We chose the **Hexagonal (Ports & Adapters) Architecture** for the AI subsystem (`api/src/ai/`).

### Rationale
- **Strict Domain Isolation**: Pure business logic (`AIRequestDomain`, verification algorithms) resides in `domain/` with zero imports from Express, Mongoose, or vendor SDKs.
- **Clean Inversion of Control**: Application use cases depend solely on interfaces (`AIProviderPort`, `VectorStorePort`, `JobQueuePort`). Concrete implementations (`GeminiAdapter`, `MongoVectorStoreAdapter`) are injected at runtime by `ProviderFactory` composition root.
- **Architectural Fitness Enforcement**: Automated fitness tests (`fitness.test.js`) run in CI to guarantee that controllers never import provider adapters directly, permanently protecting code modularity.

## Consequences
- **Positive**: Extreme testability (`npm test`), rapid adapter swapping, crystal-clear code boundaries.
- **Negative**: Requires disciplined structuring of new features according to domain boundaries.
