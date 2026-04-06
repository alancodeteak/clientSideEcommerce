import { z } from "zod";

const addressPatchSchema = z
  .object({
    line1: z.string().max(500).nullable().optional(),
    line2: z.string().max(500).nullable().optional(),
    landmark: z.string().max(500).nullable().optional(),
    city: z.string().max(200).nullable().optional(),
    state: z.string().max(200).nullable().optional(),
    postalCode: z.string().max(32).nullable().optional(),
    country: z.string().max(200).nullable().optional(),
    lat: z.number().gte(-90).lte(90).nullable().optional(),
    lng: z.number().gte(-180).lte(180).nullable().optional(),
    raw: z.string().max(8000).nullable().optional()
  })
  .strict();

/** `PATCH /api/me/profile` — only include fields to change (partial nested address). */
export const patchProfileBodySchema = z
  .object({
    displayName: z.string().max(120).nullable().optional(),
    address: addressPatchSchema.optional()
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.address !== undefined && Object.keys(val.address).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "address must include at least one field when provided",
        path: ["address"]
      });
    }
  });
