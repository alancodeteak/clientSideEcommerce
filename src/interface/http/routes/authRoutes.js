// Purpose: Customer auth JSON routes.

export function mountAuthRoutes(r, deps) {
  const {
    authLimiter,
    otpRequestLimiter,
    otpVerifyLimiter,
    validate,
    handlers,
    oauthJwtBodySchema,
    otpRequestBodySchema,
    otpVerifyBodySchema
  } = deps;

  r.post(
    "/api/auth/otp/request",
    otpRequestLimiter ?? authLimiter,
    validate({ body: otpRequestBodySchema }),
    handlers.otpRequest
  );
  r.post(
    "/api/auth/otp/verify",
    otpVerifyLimiter ?? authLimiter,
    validate({ body: otpVerifyBodySchema }),
    handlers.otpVerify
  );
  r.post("/api/auth/oauth/jwt", authLimiter, validate({ body: oauthJwtBodySchema }), handlers.oauthJwt);
}
