import { z } from "zod";
import { ValidationError } from "../../../domain/errors/ValidationError.js";

const shopIdSchema = z.string().uuid("shopId must be a valid UUID");

/**
 * @param {{ catalogRepo: import("../../ports/repositories/CatalogRepo.js").CatalogRepo }} deps
 */
export function createListCatalogItems({ catalogRepo }) {
  return async function listCatalogItems(shopId) {
    const parsed = shopIdSchema.safeParse(shopId);
    if (!parsed.success) {
      throw new ValidationError("Invalid or missing shopId", { issues: parsed.error.flatten() });
    }
    return catalogRepo.list(parsed.data);
  };
}
