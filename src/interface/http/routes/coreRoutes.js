// Purpose: Root and health endpoints.

export function mountCoreRoutes(r, deps) {
  const { healthGet } = deps;

  r.get("/", (_req, res) => {
    res.json({
      ok: true,
      service: "clientside-ecommerce-api",
      health: "/health",
      oauthAfterLogin: "/api/oauth/success"
    });
  });

  r.get("/health", healthGet);
}
