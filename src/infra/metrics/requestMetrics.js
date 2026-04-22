// Purpose: Lightweight in-process HTTP counters for dashboards (Phase 3 observability).
import { getCacheMetricsSnapshot } from "./cacheMetrics.js";
import { getOutboxMetricsSnapshot } from "./outboxMetrics.js";

let requestsTotal = 0;
/** @type {Map<string, number>} key = `${method} ${routeKey}|${statusClass}` */
const buckets = new Map();

function routeKey(req) {
  const p = req.route?.path;
  if (p) return p;
  const u = req.originalUrl || req.url || "";
  const q = u.indexOf("?");
  return q >= 0 ? u.slice(0, q) : u;
}

function statusClass(code) {
  if (code >= 500) return "5xx";
  if (code >= 400) return "4xx";
  if (code >= 300) return "3xx";
  return "2xx";
}

/**
 * Counts requests after response finishes. Mount early in the Express stack.
 */
export function requestMetricsMiddleware(req, res, next) {
  res.on("finish", () => {
    requestsTotal += 1;
    const rk = routeKey(req);
    const key = `${req.method} ${rk}|${statusClass(res.statusCode)}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  });
  next();
}

export function getMetricsSnapshot() {
  return {
    requests_total: requestsTotal,
    by_method_route_status: Object.fromEntries(buckets),
    cache: getCacheMetricsSnapshot(),
    outbox: getOutboxMetricsSnapshot()
  };
}
