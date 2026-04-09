// Purpose: Composes domain route modules and shared rate limiters for the API.

import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { catalogController } from "../controllers/catalogController.js";
import { healthController } from "../controllers/healthController.js";
import { oauthController } from "../controllers/oauthController.js";
import { profileController } from "../controllers/profileController.js";
import { storefrontAccountController } from "../controllers/storefrontAccountController.js";
import { storefrontCartController } from "../controllers/storefrontCartController.js";
import { storefrontCatalogController } from "../controllers/storefrontCatalogController.js";
import { storefrontCheckoutController } from "../controllers/storefrontCheckoutController.js";
import { storefrontController } from "../controllers/storefrontController.js";
import { storefrontOrdersController } from "../controllers/storefrontOrdersController.js";
import { createLimiter } from "../middleware/createLimiter.js";
import { validate } from "../middleware/validate.js";
import { registerBodySchema, loginBodySchema, oauthJwtBodySchema } from "../validations/authSchemas.js";
import { oauthDevGoogleStartQuerySchema, oauthSocialBodySchema } from "../validations/oauthSchemas.js";
import { patchProfileBodySchema } from "../validations/profileSchemas.js";
import { storefrontLocationBodySchema } from "../validations/storefrontSchemas.js";
import {
  storefrontCategoriesQuerySchema,
  storefrontProductsQuerySchema,
  storefrontProductSlugParamSchema
} from "../validations/storefrontCatalogSchemas.js";
import {
  storefrontAddressPatchSchema,
  storefrontAddressPostSchema,
  storefrontCartItemBodySchema,
  storefrontCartItemPatchSchema,
  storefrontCheckoutBodySchema,
  storefrontOrderIdParamSchema,
  storefrontProfilePostSchema
} from "../validations/storefrontRestSchemas.js";
import { catalogSearchQuerySchema } from "../validations/catalogSearchSchemas.js";
import { mountAuthRoutes } from "./authRoutes.js";
import { mountCatalogRoutes } from "./catalogRoutes.js";
import { mountCoreRoutes } from "./coreRoutes.js";
import { mountOauthRoutes } from "./oauthRoutes.js";
import { mountProfileRoutes } from "./profileRoutes.js";
import { mountStorefrontRoutes } from "./storefrontRoutes.js";

export function createRoutes(ctx) {
  const r = Router();

  const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    maxTest: 10_000,
    maxProd: 60,
    message: "Too many requests. Try again later."
  });

  const cartMutateLimiter = createLimiter({
    windowMs: 60 * 1000,
    maxTest: 10_000,
    maxProd: 120,
    message: "Too many cart updates. Try again later."
  });

  const authHandlers = authController.forCtx(ctx);
  const oauthHandlers = oauthController.forCtx(ctx);
  const profileHandlers = profileController.forCtx(ctx);
  const healthHandlers = healthController.forCtx(ctx);
  const catalogHandlers = catalogController.forCtx(ctx);
  const storefrontCtl = storefrontController.forCtx(ctx);
  const storefrontCat = storefrontCatalogController.forCtx(ctx);
  const storefrontCart = storefrontCartController.forCtx(ctx);
  const storefrontCheckout = storefrontCheckoutController.forCtx(ctx);
  const storefrontAccount = storefrontAccountController.forCtx(ctx);
  const storefrontOrders = storefrontOrdersController.forCtx(ctx);

  mountCoreRoutes(r, { healthGet: healthHandlers.get });

  mountAuthRoutes(r, {
    authLimiter,
    validate,
    handlers: authHandlers,
    registerBodySchema,
    loginBodySchema,
    oauthJwtBodySchema
  });

  mountOauthRoutes(r, {
    authLimiter,
    validate,
    handlers: oauthHandlers,
    oauthDevGoogleStartQuerySchema,
    oauthSocialBodySchema
  });

  mountProfileRoutes(r, {
    requireCustomerJwt: ctx.requireCustomerJwt,
    validate,
    handlers: profileHandlers,
    patchProfileBodySchema
  });

  mountStorefrontRoutes(r, {
    authLimiter,
    cartMutateLimiter,
    requireCustomerJwt: ctx.requireCustomerJwt,
    locationGuard: ctx.locationGuard,
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
  });

  mountCatalogRoutes(r, {
    validate,
    handlers: catalogHandlers,
    catalogSearchQuerySchema
  });

  return r;
}
