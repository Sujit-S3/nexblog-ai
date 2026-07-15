#!/usr/bin/env node

/**
 * Automated Release & Changelog Generation Script (`scripts/release.js`)
 * Usage: node scripts/release.js [patch | minor | major]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const bumpType = process.argv[2] || 'patch';
if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('Invalid bump type. Use: patch | minor | major');
  process.exit(1);
}

function runCommand(command, cwd = rootDir) {
  console.log(`\n> Executing: ${command}`);
  return execSync(command, { cwd, encoding: 'utf-8', stdio: 'inherit' });
}

function getCommandOutput(command, cwd = rootDir) {
  return execSync(command, { cwd, encoding: 'utf-8' }).trim();
}

console.log('=== AI Knowledge & Content OS Release Pipeline ===\n');

// 1. Verify working directory is clean (optional skip flag for local testing)
if (!process.env.SKIP_GIT_CHECK) {
  try {
    const status = getCommandOutput('git status --porcelain');
    if (status.length > 0) {
      console.warn('Warning: Working tree is not clean. Ensure all changes are committed before production release.');
    }
  } catch (err) {
    console.warn('Git check skipped or not in git repository.');
  }
}

// 2. Read and bump package.json
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const oldVersion = pkg.version || '3.2.6';
const parts = oldVersion.split('.').map(Number);

if (bumpType === 'major') {
  parts[0]++; parts[1] = 0; parts[2] = 0;
} else if (bumpType === 'minor') {
  parts[1]++; parts[2] = 0;
} else {
  parts[2]++;
}

const newVersion = parts.join('.');
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
console.log(`Version bumped: ${oldVersion} -> ${newVersion}`);

// 3. Generate CHANGELOG.md entry
const changelogPath = path.join(rootDir, 'CHANGELOG.md');
const dateStr = new Date().toISOString().split('T')[0];
const releaseNotes = `## [v${newVersion}] - ${dateStr}

### Added
- Automated Release Pipeline ('scripts/release.js', 'scripts/rollback.sh')
- Immutable AI Error Replay Engine with ExecutionSnapshots ('/api/v1/ai/logs/:logId/replay')
- AI Experiment Framework for Prompt and Provider A/B testing ('/api/v1/ai/experiments')
- Production Validation Dashboard ('/api/v1/ai/health-dashboard') evaluating all 7 Readiness Gates
- Architectural Decision History ('ARCHITECTURE_DECISIONS.md') covering ADR-001 through ADR-016

### Changed
- Enforced Hexagonal Architecture boundary fitness verification ('fitness.test.js')
- Standardized API v1 response envelopes and error handling middleware

`;

let existingChangelog = '';
if (fs.existsSync(changelogPath)) {
  existingChangelog = fs.readFileSync(changelogPath, 'utf-8');
} else {
  existingChangelog = '# Changelog\n\nAll notable changes to the AI Knowledge & Content Operating System will be documented in this file.\n\n';
}

const updatedChangelog = existingChangelog.replace('# Changelog\n\n', `# Changelog\n\n${releaseNotes}`);
fs.writeFileSync(changelogPath, updatedChangelog, 'utf-8');
console.log(`CHANGELOG.md updated with release notes for v${newVersion}`);

console.log(`\nRelease v${newVersion} prepared successfully! Run automated verification tests to confirm readiness.`);
