import { NotFoundError } from "../../../domain/errors/NotFoundError.js";
import { haversineMeters } from "../../../domain/geo/haversineMeters.js";
import { shopAllowsCustomers } from "../auth/shopPolicy.js";

/**
 * Purpose: Decide if a delivery point is within the configured radius of the shop’s address hub.
 * @param {{ shopServiceAreaRepo: import("../../ports/repositories/ShopServiceAreaRepo.js").ShopServiceAreaRepo, maxRadiusM: number }} deps
 */
export function createCheckShopServiceArea({ shopServiceAreaRepo, maxRadiusM }) {
  /**
   * @param {{ shopId: string, lat: number, lng: number }} input
   */
  return async function checkShopServiceArea(input) {
    const { shopId, lat, lng } = input;
    const row = await shopServiceAreaRepo.getShopHubForServiceCheck(shopId);
    if (!row) {
      throw new NotFoundError("Shop not found");
    }

    const shopRow = {
      status: row.status,
      is_active: row.is_active,
      is_blocked: row.is_blocked,
      is_deleted: row.is_deleted
    };

    if (!shopAllowsCustomers(shopRow)) {
      return {
        inServiceArea: false,
        distanceM: null,
        maxRadiusM,
        code: "SHOP_UNAVAILABLE",
        message: "This shop is not available for orders."
      };
    }

    const hubLat = row.hub_lat;
    const hubLng = row.hub_lng;
    if (hubLat == null || hubLng == null) {
      return {
        inServiceArea: false,
        distanceM: null,
        maxRadiusM,
        code: "SHOP_LOCATION_MISSING",
        message: "This shop has no delivery location configured."
      };
    }

    const distanceM = haversineMeters(lat, lng, hubLat, hubLng);
    const roundedM = Math.round(distanceM);
    const inServiceArea = distanceM <= maxRadiusM;

    return {
      inServiceArea,
      distanceM: roundedM,
      maxRadiusM,
      code: inServiceArea ? "IN_AREA" : "OUT_OF_AREA",
      message: inServiceArea ? "Within delivery range." : "Outside delivery range."
    };
  };
}
