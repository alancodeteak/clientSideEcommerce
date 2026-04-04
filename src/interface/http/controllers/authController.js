import { withClient, withTx } from "../../../infra/db/tx.js";

export const authController = {
  register: (ctx) => async (req, res, next) => {
    try {
      const result = await withTx((client) => ctx.registerCustomer(client, req.body));
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  login: (ctx) => async (req, res, next) => {
    try {
      const result = await withClient((client) => ctx.loginCustomer(client, req.body));
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};
