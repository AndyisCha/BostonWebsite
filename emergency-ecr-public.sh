#!/usr/bin/env bash
set -e

DF=server/Dockerfile

echo "🚑 Emergency: Switch FROM node:* -> public.ecr.aws/docker/library/node:*"
if [ ! -f "$DF" ]; then
  echo "❌ $DF not found"; exit 1
fi

sed -i 's|FROM[ ]\+node:\([0-9a-zA-Z._-]\+\)|FROM public.ecr.aws/docker/library/node:\1|g' "$DF"

git add "$DF"
git commit -m "🆘 Emergency: Switch base image to ECR Public mirror" || true
git push || true

echo "✅ Dockerfile updated. Re-run build pipeline."
