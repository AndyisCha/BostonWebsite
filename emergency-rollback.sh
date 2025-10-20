#!/usr/bin/env bash
set -e
echo "↩️  Rolling back last Railway deployment..."
npm i -g @railway/cli
railway rollback --yes
echo "✅ Rolled back."
