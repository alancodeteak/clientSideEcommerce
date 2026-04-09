// Purpose: OAuth discovery, dev Google start, social sign-in, and callback routes.

import { oauthController } from "../controllers/oauthController.js";

export function mountOauthRoutes(r, deps) {
  const { authLimiter, validate, handlers, oauthDevGoogleStartQuerySchema, oauthSocialBodySchema } = deps;

  r.get("/api/oauth/ok", oauthController.ok());
  r.get("/api/oauth/success", oauthController.success());
  r.get("/api/oauth/sign-in/social", oauthController.signInSocialGet());
  r.get(
    "/api/oauth/dev/google-start",
    authLimiter,
    validate({ query: oauthDevGoogleStartQuerySchema }),
    handlers.devGoogleStart
  );
  r.post(
    "/api/oauth/sign-in/social",
    authLimiter,
    validate({ body: oauthSocialBodySchema }),
    handlers.socialSignIn
  );
  r.get("/api/oauth/callback/google", authLimiter, handlers.googleCallback);
}
