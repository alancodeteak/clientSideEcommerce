import { z } from "zod";

const shopRefine = {
  message: "Provide shopSlug or shopId",
  path: ["shopSlug"]
};

export const registerBodySchema = z
  .object({
    shopSlug: z.string().min(1).optional(),
    shopId: z.string().uuid().optional(),
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().max(120).optional().nullable()
  })
  .refine((d) => Boolean(d.shopSlug || d.shopId), shopRefine);

export const loginBodySchema = z
  .object({
    shopSlug: z.string().min(1).optional(),
    shopId: z.string().uuid().optional(),
    email: z.string().email(),
    password: z.string().min(6)
  })
  .refine((d) => Boolean(d.shopSlug || d.shopId), shopRefine);
