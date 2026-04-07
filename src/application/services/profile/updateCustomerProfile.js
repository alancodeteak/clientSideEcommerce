import { AuthError } from "../../../domain/errors/AuthError.js";
import { NotFoundError } from "../../../domain/errors/NotFoundError.js";
import { getCustomerProfile } from "./getCustomerProfile.js";

/**
 * Purpose: Partially update display name and/or nested address fields; returns the same shape as GET.
 */
export function updateCustomerProfile({ authRepo }) {
  const getProfile = getCustomerProfile({ authRepo });

  return async function execute(client, { customerId, userId, patch }) {
    const existing = await authRepo.getCustomerProfileByCustomerId(client, customerId);
    if (!existing || existing.user_id !== userId) {
      throw new NotFoundError("Profile not found");
    }
    if (existing.is_blocked || existing.is_deleted) {
      throw new AuthError("Invalid credentials");
    }

    const addressPatch =
      patch.address !== undefined && patch.address != null && Object.keys(patch.address).length > 0
        ? patch.address
        : undefined;

    const hasDisplay = patch.displayName !== undefined;
    const hasAddress = addressPatch !== undefined;

    if (hasDisplay || hasAddress) {
      await authRepo.patchCustomerProfile(client, {
        customerId,
        userId,
        displayName: patch.displayName,
        addressPatch
      });
    }

    return getProfile(client, { customerId, userId });
  };
}
