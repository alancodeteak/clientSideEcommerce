import { requireShopId } from "../../../application/services/catalog/catalogShopId.js";
import { withClient } from "../../../infra/db/tx.js";
/**
 * Purpose: This file handles storefront cart HTTP endpoints.
 * It uses authenticated customer scope,
 * then calls cart services and sends JSON HTTP responses.
 */

function getOrCreateHandler(ctx) {
  return async (req, res, next) => {
    try {
      const shopId = requireShopId(req.shopId);
      const scope = { customerId: req.customerAuth.customerId };
      const out = await withClient((c) => ctx.storefrontCart.createOrGetCart(c, shopId, scope));
      res.json(out);
    } catch (err) {
      next(err);
    }
  };
}

function getHandler(ctx) {
  return async (req, res, next) => {
    try {
      const shopId = requireShopId(req.shopId);
      const scope = { customerId: req.customerAuth.customerId };
      const out = await withClient((c) => ctx.storefrontCart.getCartContents(c, shopId, scope));
      res.json(out);
    } catch (err) {
      next(err);
    }
  };
}

function addItemHandler(ctx) {
  return async (req, res, next) => {
    try {
      const shopId = requireShopId(req.shopId);
      const scope = { customerId: req.customerAuth.customerId };
      const row = await withClient((c) => ctx.storefrontCart.addItem(c, shopId, scope, req.body));
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  };
}

function patchItemHandler(ctx) {
  return async (req, res, next) => {
    try {
      const shopId = requireShopId(req.shopId);
      const scope = { customerId: req.customerAuth.customerId };
      const row = await withClient((c) =>
        ctx.storefrontCart.updateItemQuantity(c, shopId, scope, req.params.itemId, req.body.quantity)
      );
      res.json(row);
    } catch (err) {
      next(err);
    }
  };
}

function deleteItemHandler(ctx) {
  return async (req, res, next) => {
    try {
      const shopId = requireShopId(req.shopId);
      const scope = { customerId: req.customerAuth.customerId };
      await withClient((c) => ctx.storefrontCart.removeItem(c, shopId, scope, req.params.itemId));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export const storefrontCartController = {
  getOrCreate: (ctx) => getOrCreateHandler(ctx),
  get: (ctx) => getHandler(ctx),
  addItem: (ctx) => addItemHandler(ctx),
  patchItem: (ctx) => patchItemHandler(ctx),
  deleteItem: (ctx) => deleteItemHandler(ctx),

  forCtx(ctx) {
    return {
      getOrCreate: getOrCreateHandler(ctx),
      get: getHandler(ctx),
      addItem: addItemHandler(ctx),
      patchItem: patchItemHandler(ctx),
      deleteItem: deleteItemHandler(ctx)
    };
  }
};
