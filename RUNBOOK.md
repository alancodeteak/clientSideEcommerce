# Operations runbook (Phase 4)

Short reference for deploy, health checks, and common production tasks.

## Deploy

1. Set `NODE_ENV=production` and satisfy `src/config/env.js` validation (JWT secrets, `TRUST_PROXY`, `DATABASE_SSL_REJECT_UNAUTHORIZED`, etc.).
2. Run DB migrations: `npm run db:migrate` against production `DATABASE_URL`.
3. Start the process (systemd, Docker, Kubernetes, etc.) with env injected from your secret store — not committed `.env` files.
4. Send `SIGTERM` for rolling restarts; the server **drains HTTP**, closes Socket.IO (if loaded), **Redis**, and the **Postgres pool** gracefully.

## Rollback

1. Deploy the previous image/commit.
2. Run migrations only if the rollback requires a DB revision (prefer backward-compatible migrations).
3. Invalidate catalog cache if schema or product data changed unexpectedly: `POST /storefront/catalog/cache/invalidate` with `CATALOG_CACHE_INVALIDATE_TOKEN` (see OpenAPI).

## Health and metrics

| Endpoint | Use |
|----------|-----|
| `GET /health` | Liveness — process up (no dependency checks). |
| `GET /health/ready` | Readiness — Postgres (and Redis if `REDIS_URL` is set). Use for orchestrator readiness probes. |
| `GET /metrics` | JSON request counters. Protect with `METRICS_SCRAPE_TOKEN` in production (`Authorization: Bearer` or `X-Metrics-Token`). |

## Secrets rotation

- Rotate `JWT_SECRET` / `JWT_REFRESH_SECRET` on a schedule; force users to re-login after rotation.
- Rotate DB credentials in the host and `DATABASE_URL`; restart app.
- Rotate `CATALOG_CACHE_INVALIDATE_TOKEN`, `METRICS_SCRAPE_TOKEN`, OAuth client secrets similarly.

## Smoke test after deploy

```bash
chmod +x scripts/smoke-api.sh
BASE_URL=https://your-api.example.com SHOP_ID=<shop-uuid> bash scripts/smoke-api.sh
```

If metrics require a token: `METRICS_TOKEN=<secret> bash scripts/smoke-api.sh`.

## Load testing (manual)

For serious load, use k6, Locust, or Artillery against staging — target catalog → cart → checkout paths. Watch `/metrics`, DB connection count, and Redis latency.

## WebSockets (if enabled)

Socket.IO attaches when the package is installed. Restrict CORS origins in production and authenticate room joins if the API is public — see `src/infra/realtime/socketServer.js`.
