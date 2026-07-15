# Changelog

## [v1.0.1] - 2026-07-15

### Added
- Automated Release Pipeline ('scripts/release.js', 'scripts/rollback.sh')
- Immutable AI Error Replay Engine with ExecutionSnapshots ('/api/v1/ai/logs/:logId/replay')
- AI Experiment Framework for Prompt and Provider A/B testing ('/api/v1/ai/experiments')
- Production Validation Dashboard ('/api/v1/ai/health-dashboard') evaluating all 7 Readiness Gates
- Architectural Decision History ('ARCHITECTURE_DECISIONS.md') covering ADR-001 through ADR-016

### Changed
- Enforced Hexagonal Architecture boundary fitness verification ('fitness.test.js')
- Standardized API v1 response envelopes and error handling middleware

All notable changes to the AI Knowledge & Content Operating System will be documented in this file.

