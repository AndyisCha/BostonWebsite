#!/usr/bin/env bash
set -e
WF="${1:-Deploy to Railway (Production, Resilient)}"
echo "🧹 Cancel in-progress runs for workflow: $WF"
gh run list --workflow "$WF" --status in_progress --json databaseId -q '.[].databaseId' | xargs -I{} gh run cancel {} || true
echo "✅ Cancelled."
