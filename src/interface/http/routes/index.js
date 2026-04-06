import { Router } from "express";
import { healthController } from "../controllers/healthController.js";
import { catalogController } from "../controllers/catalogController.js";
import { authController } from "../controllers/authController.js";
import { profileController } from "../controllers/profileController.js";
import { validate } from "../middleware/validate.js";
import { requireCustomerJwt } from "../middleware/requireCustomerJwt.js";
import { registerBodySchema, loginBodySchema } from "../validations/authSchemas.js";
import { patchProfileBodySchema } from "../validations/profileSchemas.js";

/**
 * @param {import("../../../main/composition.js").AppContext} ctx
 */
export function createRoutes(ctx) {
  const r = Router();

  r.get("/health", healthController.get(ctx));

  r.post("/api/auth/register", validate({ body: registerBodySchema }), authController.register(ctx));
  r.post("/api/auth/login", validate({ body: loginBodySchema }), authController.login(ctx));
  r.post("/api/auth/oauth/jwt", authController.oauthJwt(ctx));

  r.get("/api/me/profile", requireCustomerJwt(), profileController.get(ctx));
  r.patch(
    "/api/me/profile",
    requireCustomerJwt(),
    validate({ body: patchProfileBodySchema }),
    profileController.patch(ctx)
  );

  r.get("/api/catalog/categories", catalogController.listCategories(ctx));
  r.get("/api/catalog/products", catalogController.listProducts(ctx));
  r.get("/api/catalog/items", catalogController.listItems(ctx));

  return r;
}
