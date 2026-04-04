export const catalogController = {
  listItems: (ctx) => async (req, res, next) => {
    try {
      const shopId = req.query.shopId ?? req.headers["x-shop-id"];
      const items = await ctx.listCatalogItems(shopId);
      res.json({ items });
    } catch (err) {
      next(err);
    }
  }
};
