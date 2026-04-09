import { withClient, withTx } from "../../../infra/db/tx.js";

function getHandler(ctx) {
  return async (req, res, next) => {
    try {
      const { customerId, userId } = req.customerAuth;
      const result = await withClient((client) =>
        ctx.getCustomerProfile(client, { customerId, userId })
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

function patchHandler(ctx) {
  return async (req, res, next) => {
    try {
      const { customerId, userId } = req.customerAuth;
      const result = await withTx((client) =>
        ctx.updateCustomerProfile(client, {
          customerId,
          userId,
          patch: req.body
        })
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const profileController = {
  get: (ctx) => getHandler(ctx),
  patch: (ctx) => patchHandler(ctx),

  forCtx(ctx) {
    return {
      get: getHandler(ctx),
      patch: patchHandler(ctx)
    };
  }
};
