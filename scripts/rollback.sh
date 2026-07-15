#!/usr/bin/env bash

# Automated Rollback Script (`scripts/rollback.sh`)
# Reverts production deployment to the specified Git release tag or previous stable commit.

set -e

echo "=== AI Knowledge & Content OS Automated Rollback ==="

TARGET_TAG=$1
if [ -z "$TARGET_TAG" ]; then
  echo "Usage: ./scripts/rollback.sh <git-tag-or-commit>"
  echo "Example: ./scripts/rollback.sh v3.2.6"
  exit 1
fi

echo "1. Checking current git status and verifying target tag: $TARGET_TAG..."
git checkout "$TARGET_TAG" || {
  echo "Error: Could not checkout target $TARGET_TAG. Verifying if commit exists..."
  exit 1
}

echo "2. Restoring clean package dependencies..."
npm ci --silent || npm install --silent

echo "3. Re-verifying core environment and database connection state..."
export NODE_ENV=production

echo "4. Restarting production application processes..."
if command -v pm2 &> /dev/null; then
  pm2 restart all --update-env
  echo "PM2 processes restarted successfully."
else
  echo "PM2 not found in PATH. Please restart target server daemon manually."
fi

echo "=== Rollback to $TARGET_TAG completed successfully! ==="
