// Purpose: Authenticated customer profile (me) routes.

export function mountProfileRoutes(r, deps) {
  const { requireCustomerJwt, validate, handlers, patchProfileBodySchema } = deps;

  r.get("/api/me/profile", requireCustomerJwt, handlers.get);
  r.patch(
    "/api/me/profile",
    requireCustomerJwt,
    validate({ body: patchProfileBodySchema }),
    handlers.patch
  );
}
