import { logger } from "../../config/logger.js";

function routeFromReq(req) {
  return req?.route?.path || req?.originalUrl || req?.url || "";
}

function baseFromReq(req) {
  return {
    requestId: req?.id,
    method: req?.method,
    route: routeFromReq(req),
    shopId: req?.shopId,
    userId: req?.customerAuth?.userId,
    customerId: req?.customerAuth?.customerId
  };
}

export function logApiWarn(event, req, fields = {}, msg = event) {
  logger.warn({ event, ...baseFromReq(req), ...fields }, msg);
}

export function logApiInfo(event, req, fields = {}, msg = event) {
  logger.info({ event, ...baseFromReq(req), ...fields }, msg);
}

export function logApiError(event, req, fields = {}, msg = event) {
  logger.error({ event, ...baseFromReq(req), ...fields }, msg);
}

export function zodIssuesSummary(flattened) {
  if (!flattened) return {};
  const formErrors = Array.isArray(flattened.formErrors) ? flattened.formErrors : [];
  const fieldErrors = flattened.fieldErrors && typeof flattened.fieldErrors === "object" ? flattened.fieldErrors : {};
  return {
    formErrors,
    fieldErrors: Object.fromEntries(
      Object.entries(fieldErrors).map(([k, v]) => [k, Array.isArray(v) ? v.slice(0, 3) : v])
    )
  };
}
