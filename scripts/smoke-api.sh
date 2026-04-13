#!/usr/bin/env bash
# Quick smoke checks against a running API (Phase 4 — before/after deploy).
# Usage:
#   BASE_URL=http://localhost:4100 SHOP_ID=<uuid> bash scripts/smoke-api.sh
# Optional: METRICS_TOKEN must match METRICS_SCRAPE_TOKEN if that env is set on the server.

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4100}"
SHOP_ID="${SHOP_ID:-}"
METRICS_TOKEN="${METRICS_TOKEN:-}"

echo "== Smoke: $BASE_URL =="

echo "-- GET /health"
curl -sfS "$BASE_URL/health" | head -c 300
echo ""
echo ""

echo "-- GET /health/ready"
curl -sfS "$BASE_URL/health/ready" | head -c 400
echo ""
echo ""

if [[ -n "$METRICS_TOKEN" ]]; then
  echo "-- GET /metrics (with token)"
  curl -sfS -H "X-Metrics-Token: $METRICS_TOKEN" "$BASE_URL/metrics" | head -c 400
else
  echo "-- GET /metrics (no token; OK if METRICS_SCRAPE_TOKEN unset on server)"
  curl -sfS "$BASE_URL/metrics" | head -c 400 || true
fi
echo ""
echo ""

if [[ -n "$SHOP_ID" ]]; then
  echo "-- GET /storefront/categories (x-shop-id)"
  curl -sfS -H "x-shop-id: $SHOP_ID" "$BASE_URL/storefront/categories" | head -c 400
  echo ""
else
  echo "-- Skip storefront/categories (set SHOP_ID to test)"
fi

echo ""
echo "== Smoke finished OK =="
