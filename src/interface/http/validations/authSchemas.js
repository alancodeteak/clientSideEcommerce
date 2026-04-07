import { z } from "zod";

const passwordSchema = z.string().min(6).max(128);

export const registerBodySchema = z.object({
  shopId: z.string().uuid(),
  email: z.string().email(),
  password: passwordSchema,
  displayName: z.string().max(120).optional().nullable()
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  shopId: z.string().uuid().optional()
});

/** Body optional: `{}` when using `storefront_oauth_exchange` cookie after Google callback. */
export const oauthJwtBodySchema = z
  .object({
    email: z.string().email().optional(),
    shopId: z.string().uuid().optional()
  })
  .strict();
