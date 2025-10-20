#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-https://boston-english-server.railway.app}"
FRONTEND_URL="${FRONTEND_URL:-https://boston-website-omega.vercel.app}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; EXIT_CODE=1; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo "🔍 Verifying deployment..."
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo

EXIT_CODE=0

# ====================================
# Backend Health
# ====================================
echo "==> Backend /health"
if curl -sf "$BACKEND_URL/health" >/dev/null; then
  log_success "Backend /health: OK"
else
  log_error "Backend /health: FAILED"
fi

echo "==> Backend /api/v1/health"
if curl -sf "$BACKEND_URL/api/v1/health" | grep -q '"status":"OK"' 2>/dev/null; then
  log_success "Backend /api/v1/health: OK"
  curl -s "$BACKEND_URL/api/v1/health" 2>/dev/null || echo "OK"
else
  log_error "Backend /api/v1/health: FAILED"
fi

# ====================================
# Proxy Check
# ====================================
echo
echo "==> Proxy via /api/proxy/health"
HTTP_CODE=$(curl -s -o /tmp/proxy.json -w "%{http_code}" "$FRONTEND_URL/api/proxy/health" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" == "200" ]; then
  log_success "Proxy: OK (HTTP $HTTP_CODE)"
  cat /tmp/proxy.json 2>/dev/null || echo "OK"
else
  log_error "Proxy: FAILED (HTTP $HTTP_CODE)"
fi

# ====================================
# CORS Check
# ====================================
echo
echo "==> CORS preflight"
CORS_HEADERS=$(curl -sI -X OPTIONS "$BACKEND_URL/api/v1/health" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" 2>/dev/null | tr -d '\r')

if echo "$CORS_HEADERS" | grep -qi 'access-control-allow-origin'; then
  log_success "CORS headers present"
  echo "$CORS_HEADERS" | grep -i 'access-control-' || true
else
  log_error "CORS headers missing"
fi

# ====================================
# CSP Check
# ====================================
echo
echo "==> CSP header"
CSP=$(curl -sI "$FRONTEND_URL" 2>/dev/null | tr -d '\r' | grep -i 'content-security-policy' || echo "")
if [ -n "$CSP" ]; then
  log_success "CSP header present"

  if echo "$CSP" | grep -o "script-src[^;]*" | grep -q "'unsafe-inline'"; then
    log_warning "CSP contains 'unsafe-inline' in script-src"
  else
    log_success "No 'unsafe-inline' in script-src"
  fi
else
  log_warning "CSP header missing"
fi

# ====================================
# Performance
# ====================================
echo
echo "==> Response time"
RT=$(curl -o /dev/null -s -w '%{time_total}\n' "$BACKEND_URL/health" 2>/dev/null || echo "999")
echo "Backend: ${RT}s"

# ====================================
# Summary
# ====================================
echo
if [ $EXIT_CODE -eq 0 ]; then
  log_success "All checks passed!"
else
  log_error "Some checks failed"
fi

exit $EXIT_CODE
