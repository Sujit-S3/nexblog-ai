# Release Governance & Definition of Done

To prevent scope creep, ensure operational predictability, and guarantee architectural hygiene, every formal version release of the AI Knowledge & Content Operating System must comply with the strict **Definition of Done** and structured **Release Governance Artifacts**.

---

## 1. Universal Definition of Done (`DoD`)

No version release (`v3.3`, `v3.4`, `v4.0`, etc.) can be marked completed or deployed to production unless all 10 explicit criteria are verified and signed off:

```text
Definition of Done Check-Off

[✓] 1. Architecture Implemented: Code strictly adheres to Hexagonal Ports & Adapters hierarchy.
[✓] 2. Tests Passing: 100% pass rate across all unit, integration, and AST fitness test suites.
[✓] 3. Documentation Updated: Architecture diagrams, ADRs, and API documentation reflect exact changes.
[✓] 4. OpenAPI Regenerated: `GET /api/v1/docs/openapi.json` returns valid 3.0.3 specification matching routes.
[✓] 5. Lighthouse Target Met: Desktop and Mobile performance scores >= 95.
[✓] 6. Performance Budget Respected: Initial JS <= 250KB, API P95 <= 450ms, memory heap <= 512MB.
[✓] 7. Security Scan Clean: Zero High or Critical OWASP/dependency vulnerabilities detected.
[✓] 8. Telemetry Integrated: All new endpoints and domain actions emit structured logs, metrics, and traces.
[✓] 9. Rollback Tested: `scripts/rollback.sh <previous_tag>` verified in staging before production push.
[✓] 10. Release Notes Generated: `CHANGELOG.md` updated with exact semantic version and categorizations.
```

---

## 2. Mandatory Release Governance Artifacts

Every formal release package must produce six essential governance components documented in the repository before production cut-over:

### 1. `CHANGELOG.md` Entry
Follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and Semantic Versioning (`vX.Y.Z`). Categorizes changes under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`.

### 2. Migration Guide (`docs/deployment/migrations/`)
Documents step-by-step instructions for database schema transformations, Mongoose model index builds (`createIndexes()`), and environment variable additions (`.env.example`).

### 3. Rollback Plan (`docs/deployment/rollbacks/`)
Specifies the exact rollback command (`scripts/rollback.sh <tag>`), database rollback scripts (if migrations occurred), and data reconciliation steps.

### 4. Known Issues (`docs/deployment/KNOWN_ISSUES.md`)
Explicitly lists any non-blocking defects, minor UX quirks, or tracked technical debt items (`TD-XXX`) remaining in the release.

### 5. Breaking Changes Schedule
If breaking changes occur across versioned API endpoints (`/api/v1` vs `/api/v2`), a 90-day deprecation warning window and header notification policy (`Deprecation: true`) must be enforced.

### 6. Release Notes Summary
A polished executive summary suitable for engineering review, highlighting business value, latency improvements, and architectural milestones achieved.
