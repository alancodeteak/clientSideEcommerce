// Purpose: Customer auth JSON routes and short /auth/* aliases.

import { authGoogleRedirect } from "./utils/authGoogleRedirect.js";

export function mountAuthRoutes(r, deps) {
  const { authLimiter, validate, handlers, registerBodySchema, loginBodySchema, oauthJwtBodySchema } = deps;

  r.post("/api/auth/register", authLimiter, validate({ body: registerBodySchema }), handlers.register);
  r.post("/api/auth/login", authLimiter, validate({ body: loginBodySchema }), handlers.login);
  r.post("/api/auth/oauth/jwt", authLimiter, validate({ body: oauthJwtBodySchema }), handlers.oauthJwt);

  r.post("/auth/email/register", authLimiter, validate({ body: registerBodySchema }), handlers.register);
  r.post("/auth/email/login", authLimiter, validate({ body: loginBodySchema }), handlers.login);
  r.post("/auth/logout", handlers.logout);
  r.get("/auth/google", authGoogleRedirect);
}
