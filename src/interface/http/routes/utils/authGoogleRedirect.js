// Purpose: Short URL /auth/google forwards query to dev Google OAuth start.

import { toSearchParamsString } from "./queryString.js";

export function authGoogleRedirect(req, res) {
  const q = toSearchParamsString(req.query);
  res.redirect(302, q ? `/api/oauth/dev/google-start?${q}` : `/api/oauth/dev/google-start`);
}
