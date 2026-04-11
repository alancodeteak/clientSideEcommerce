// Purpose: Authenticated customer profile (me) routes.

export function mountProfileRoutes(r, deps) {
  const { requireCustomerJwt, profileMutateLimiter, validate, handlers, patchProfileBodySchema } = deps;

  r.get("/api/me/profile", requireCustomerJwt, handlers.get);
  r.patch(
    "/api/me/profile",
    requireCustomerJwt,
    profileMutateLimiter,
    validate({ body: patchProfileBodySchema }),
    handlers.patch
  );
}
