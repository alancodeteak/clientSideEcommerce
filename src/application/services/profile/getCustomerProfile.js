import { AuthError } from "../../../domain/errors/AuthError.js";
import { NotFoundError } from "../../../domain/errors/NotFoundError.js";

/**
 * Purpose: Load the authenticated storefront customer profile (display name + linked address).
 */
export function getCustomerProfile({ authRepo }) {
  return async function execute(client, { customerId, userId }) {
    const row = await authRepo.getCustomerProfileByCustomerId(client, customerId);
    if (!row || row.user_id !== userId) {
      throw new NotFoundError("Profile not found");
    }
    if (row.is_blocked || row.is_deleted) {
      throw new AuthError("Invalid credentials");
    }

    return {
      customer: {
        id: row.id,
        displayName: row.display_name
      },
      address: row.address
    };
  };
}
