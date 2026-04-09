// Purpose: Small helpers so error JSON matches the same shape everywhere (e.g. rate limits).

export function sendTooManyRequests(res, message) {
  res.status(429).json({
    error: {
      code: "TOO_MANY_REQUESTS",
      message
    }
  });
}
