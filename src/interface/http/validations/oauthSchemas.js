import { z } from "zod";

/** `POST /api/oauth/sign-in/social` — Google only (replaces prior Better Auth shape). */
export const oauthSocialBodySchema = z
  .object({
    provider: z.literal("google"),
    disableRedirect: z.boolean().optional(),
    callbackURL: z.string().url().optional(),
    additionalData: z
      .object({
        shopId: z.string().uuid().optional()
      })
      .strict()
      .optional()
  })
  .strict();
