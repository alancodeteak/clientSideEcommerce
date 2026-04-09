// Purpose: Google OAuth sign-in and callback routes.

import { oauthController } from "../controllers/oauthController.js";

export function mountOauthRoutes(r, deps) {
  const { authLimiter, validate, handlers, oauthSocialBodySchema } = deps;

  r.post(
    "/api/oauth/sign-in/social",
    authLimiter,
    validate({ body: oauthSocialBodySchema }),
    handlers.socialSignIn
  );
  r.get("/api/oauth/callback/google", authLimiter, handlers.googleCallback);
}
