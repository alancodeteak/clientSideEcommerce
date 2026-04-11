function getHandler(ctx) {
  return async (_req, res, next) => {
    try {
      const body = await ctx.getHealth();
      res.json(body);
    } catch (err) {
      next(err);
    }
  };
}

function readyHandler(ctx) {
  return async (_req, res, _next) => {
    try {
      const body = await ctx.getReadiness();
      res.json(body);
    } catch (err) {
      const code = err.statusCode === 503 ? 503 : 500;
      res.status(code).json({
        error: {
          code: "NOT_READY",
          message: err.message || "Service not ready",
          checks: err.checks
        }
      });
    }
  };
}

export const healthController = {
  get: (ctx) => getHandler(ctx),
  ready: (ctx) => readyHandler(ctx),

  forCtx(ctx) {
    return { get: getHandler(ctx), ready: readyHandler(ctx) };
  }
};
