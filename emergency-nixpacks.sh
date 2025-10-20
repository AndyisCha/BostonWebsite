#!/usr/bin/env bash
set -e

echo "🚑 Emergency: Switch to Nixpacks (disable Dockerfile)"
if [ -f server/Dockerfile ]; then
  mv server/Dockerfile server/Dockerfile.dockerhub-backup
fi

cat > server/nixpacks.toml <<'EOF'
[phases.setup]
nixPkgs = ['nodejs-18_x', 'npm-9_x', 'openssl']

[phases.install]
cmds = ['npm ci --only=production']

[phases.build]
cmds = ['npx prisma generate', 'npm run build']

[start]
cmd = 'npm start'

[env]
NODE_ENV = 'production'
EOF

git add server/Dockerfile.dockerhub-backup server/nixpacks.toml 2>/dev/null || true
git commit -m "🆘 Emergency: Switch to Nixpacks due to DockerHub outage" || true
git push || true

echo "Trigger Railway redeploy..."
npm i -g @railway/cli
railway up --service boston-server --detach || true
echo "✅ Nixpacks fallback pushed."
