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

export const healthController = {
  get: (ctx) => getHandler(ctx),

  forCtx(ctx) {
    return { get: getHandler(ctx) };
  }
};
