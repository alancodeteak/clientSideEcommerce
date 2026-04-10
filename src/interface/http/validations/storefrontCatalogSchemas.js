import { z } from "zod";

/**
 * Purpose: This file defines and sanitizes query/param schemas for
 * storefront catalog endpoints so controllers receive safe input.
 */
const uuidOpt = z.preprocess((v) => (v === "" || v == null ? undefined : v), z.string().uuid().optional());
const nonNegativeIntOpt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().int().min(0).optional()
);

export const storefrontCategoriesQuerySchema = z.object({
  parent_id: uuidOpt
});

export const storefrontProductsQuerySchema = z.object({
  category_id: uuidOpt,
  brand_id: uuidOpt,
  search: z.preprocess((v) => {
    if (v == null || v === "") return undefined;
    return String(v).trim().slice(0, 200);
  }, z.string().optional()),
  limit: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(1).max(100).optional()),
  cursor: z.preprocess((v) => (v === "" || v == null ? undefined : String(v)), z.string().max(500).optional()),
  min_price_minor: nonNegativeIntOpt,
  max_price_minor: nonNegativeIntOpt,
  availability: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.enum(["in_stock", "out_of_stock", "unknown"]).optional()
  ),
  sort_by: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.enum(["price", "created_at", "name"]).optional()
  ),
  sort_order: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.enum(["asc", "desc"]).optional()
  )
}).superRefine((data, ctx) => {
  if (
    Number.isInteger(data.min_price_minor) &&
    Number.isInteger(data.max_price_minor) &&
    data.min_price_minor > data.max_price_minor
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["min_price_minor"],
      message: "min_price_minor must be less than or equal to max_price_minor"
    });
  }

  if (data.cursor && data.sort_by && data.sort_by !== "created_at") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["cursor"],
      message: "cursor pagination is only supported with sort_by=created_at"
    });
  }
});

export const storefrontProductSlugParamSchema = z.object({
  slug: z.string().min(1).max(128)
});
