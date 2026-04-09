// Purpose: This file handles catalog API requests and returns categories, products, and search results.
function shopIdFromRequest(req) {
  return req.shopId ?? req.query.shopId ?? req.headers["x-shop-id"];
}

function createListProductsHandler() {
  return (ctx) => async (req, res, next) => {
    try {
      const items = await ctx.listProducts(shopIdFromRequest(req), {
        categoryId: req.query.categoryId
      });
      res.json({ items });
    } catch (err) {
      next(err);
    }
  };
}

const listProductsHandler = createListProductsHandler();

function listCategoriesHandler(ctx) {
  return async (req, res, next) => {
    try {
      const categories = await ctx.listCategories(shopIdFromRequest(req), {
        parentId: req.query.parentId
      });
      res.json({ categories });
    } catch (err) {
      next(err);
    }
  };
}

function searchHandler(ctx) {
  return async (req, res, next) => {
    try {
      const result = await ctx.searchCatalog(shopIdFromRequest(req), req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export const catalogController = {
  listCategories: (ctx) => listCategoriesHandler(ctx),

  listProducts: listProductsHandler,

  listItems: listProductsHandler,

  search: (ctx) => searchHandler(ctx),

  forCtx(ctx) {
    const listProducts = listProductsHandler(ctx);
    return {
      listCategories: listCategoriesHandler(ctx),
      listProducts,
      listItems: listProducts,
      search: searchHandler(ctx)
    };
  }
};
