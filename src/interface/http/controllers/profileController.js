import { withClient, withTx } from "../../../infra/db/tx.js";

export const profileController = {
  get: (ctx) => async (req, res, next) => {
    try {
      const { customerId, userId } = req.customerAuth;
      const result = await withClient((client) =>
        ctx.getCustomerProfile(client, { customerId, userId })
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  patch: (ctx) => async (req, res, next) => {
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
  }
};
