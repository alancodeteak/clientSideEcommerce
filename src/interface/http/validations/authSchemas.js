import { z } from "zod";

export const registerBodySchema = z.object({
  shopId: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().max(120).optional().nullable()
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
