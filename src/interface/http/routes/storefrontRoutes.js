// Purpose: Storefront location, catalog, cart, checkout, account, and orders.

import { z } from "zod";

const cartItemIdParamSchema = z.object({
  itemId: z.string().uuid()
});

export function mountStorefrontRoutes(r, deps) {
  const {
    authLimiter,
    cartMutateLimiter,
    requireCustomerJwt,
    locationGuard,
    validate,
    storefrontLocationBodySchema,
    storefrontCategoriesQuerySchema,
    storefrontProductsQuerySchema,
    storefrontProductSlugParamSchema,
    storefrontCartItemBodySchema,
    storefrontCartItemPatchSchema,
    storefrontCheckoutBodySchema,
    storefrontProfilePostSchema,
    storefrontAddressPostSchema,
    storefrontAddressPatchSchema,
    storefrontOrderIdParamSchema,
    storefrontCtl,
    storefrontCat,
    storefrontCart,
    storefrontCheckout,
    storefrontAccount,
    storefrontOrders
  } = deps;

  r.post(
    "/storefront/location/check",
    authLimiter,
    validate({ body: storefrontLocationBodySchema }),
    storefrontCtl.checkLocation
  );

  r.get(
    "/storefront/categories",
    validate({ query: storefrontCategoriesQuerySchema }),
    storefrontCat.listCategories
  );
  r.get(
    "/storefront/products",
    validate({ query: storefrontProductsQuerySchema }),
    storefrontCat.listProducts
  );
  r.get(
    "/storefront/products/:slug",
    validate({ params: storefrontProductSlugParamSchema }),
    storefrontCat.getProductBySlug
  );

  r.post("/storefront/cart", requireCustomerJwt, storefrontCart.getOrCreate);
  r.get("/storefront/cart", requireCustomerJwt, storefrontCart.get);
  r.post(
    "/storefront/cart/items",
    requireCustomerJwt,
    cartMutateLimiter,
    validate({ body: storefrontCartItemBodySchema }),
    storefrontCart.addItem
  );
  r.patch(
    "/storefront/cart/items/:itemId",
    requireCustomerJwt,
    cartMutateLimiter,
    validate({ params: cartItemIdParamSchema, body: storefrontCartItemPatchSchema }),
    storefrontCart.patchItem
  );
  r.delete(
    "/storefront/cart/items/:itemId",
    requireCustomerJwt,
    cartMutateLimiter,
    validate({ params: cartItemIdParamSchema }),
    storefrontCart.deleteItem
  );

  r.post(
    "/storefront/checkout",
    authLimiter,
    cartMutateLimiter,
    requireCustomerJwt,
    locationGuard,
    validate({ body: storefrontCheckoutBodySchema }),
    storefrontCheckout.post
  );

  r.post(
    "/storefront/profile",
    requireCustomerJwt,
    validate({ body: storefrontProfilePostSchema }),
    storefrontAccount.postProfile
  );
  r.get("/storefront/address", requireCustomerJwt, storefrontAccount.getAddress);
  r.post(
    "/storefront/address",
    requireCustomerJwt,
    validate({ body: storefrontAddressPostSchema }),
    storefrontAccount.postAddress
  );
  r.patch(
    "/storefront/address",
    requireCustomerJwt,
    validate({ body: storefrontAddressPatchSchema }),
    storefrontAccount.patchAddress
  );

  r.get("/storefront/orders", requireCustomerJwt, storefrontOrders.list);
  r.get(
    "/storefront/orders/:id",
    requireCustomerJwt,
    validate({ params: storefrontOrderIdParamSchema }),
    storefrontOrders.getById
  );
}
