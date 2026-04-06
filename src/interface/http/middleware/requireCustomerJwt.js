import { verifyCustomerAccessToken } from "../../../infra/auth/jwt.js";

/**
 * @param {{
 *   authRepo: import("../../../application/ports/repositories/CustomerAuthRepo.js").CustomerAuthRepo,
 *   skipDbSessionCheck: boolean
 * }} deps
 */
export function createRequireCustomerJwt({ authRepo, skipDbSessionCheck }) {
  /**
   * Requires `Authorization: Bearer <JWT>` from login/register (or a trusted JWT exchange).
   * Optionally re-checks DB so revoked/blocked users lose access before token expiry.
   *
   * Sets `req.customerAuth` with `{ userId, customerId, shopId?, role }`.
   */
  return function requireCustomerJwt() {
    /** @type {import("express").RequestHandler} */
    const handler = async (req, res, next) => {
      const raw = req.headers.authorization;
      if (!raw || !raw.startsWith("Bearer ")) {
        return res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "Bearer token required"
          }
        });
      }

      const token = raw.slice("Bearer ".length).trim();
      if (!token) {
        return res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "Bearer token required"
          }
        });
      }

      try {
        const payload = verifyCustomerAccessToken(token);
        const userId = payload.sub;
        const customerId = payload.customerId;

        if (!skipDbSessionCheck) {
          const ok = await authRepo.isCustomerSessionValid(userId, customerId);
          if (!ok) {
            return res.status(401).json({
              error: {
                code: "UNAUTHORIZED",
                message: "Session is no longer valid"
              }
            });
          }
        }

        req.customerAuth = {
          userId,
          customerId,
          shopId: payload.shopId,
          role: payload.role
        };
        next();
      } catch {
        return res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired token"
          }
        });
      }
    };

    return handler;
  };
}
