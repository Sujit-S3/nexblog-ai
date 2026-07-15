# ADR-005: Domain-Driven API Versioning & Zod Contract Schemas

## Status
Accepted (2026-07-15)

## Context & Problem Statement
As the system transitions to an enterprise AI Knowledge & Content Operating System, external integrations, CLI tools, and automated pipelines require stable, versioned API contracts. Flat routing (`/api/ai/*`) without strict runtime input/output validation leads to hidden schema drift, unhelpful 500 errors on malformed inputs, and breaking changes during upgrades.

## Considered Options
1. **Unversioned Flat Routes (`/api/*`)**: Continuing ad-hoc request parsing and manual `if (!req.body.prompt)` checks.
2. **URL-Prefix Versioning with Zod Schemas (`/api/v1/*`)**: Structuring routes by domain (`/api/v1/ai`, `/api/v1/knowledge`, `/api/v1/workflows`) and validating payloads at runtime using Zod schemas (`api/src/schemas/v1/`), auto-generating OpenAPI specs.

## Decision Outcome
We chose **URL-Prefix Versioning with Zod Schemas (`/api/v1/*`)**.

### Rationale
- **Contract Stability**: Isolating endpoints under `/api/v1/*` guarantees that future major architectural enhancements (`/api/v2/*`) will never disrupt existing client workflows or integrations.
- **Type & Schema Safety**: Zod runtime schemas validate incoming headers, params, query strings, and body payloads, immediately returning descriptive `400 Bad Request` envelopes on validation failures before touching controllers or DB layers.
- **Automated Documentation**: Zod schemas drive the live OpenAPI 3.0 generator (`openapi.generator.js`), keeping `/api/v1/docs` (Swagger UI) synchronized 100% with exact code behavior.

## Consequences
- **Positive**: Zero API drift, instant Swagger documentation, backwards compatibility via deprecated legacy wrapper (`/api/ai/*`).
- **Negative**: Minor initial boilerplate for defining Zod schemas across each domain.
