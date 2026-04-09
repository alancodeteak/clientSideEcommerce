import { describe, it, expect, vi } from "vitest";
import { createUpdateStorefrontProfile } from "../../src/application/services/profile/updateStorefrontProfile.js";

describe("updateStorefrontProfile", () => {
  it("maps duplicate phone database error to conflict error", async () => {
    const authRepo = {
      getCustomerProfileByCustomerId: vi.fn().mockResolvedValue({
        id: "cust-1",
        user_id: "user-1"
      }),
      updateUserPhone: vi.fn().mockRejectedValue({
        code: "23505",
        constraint: "users_phone_key"
      })
    };
    const run = createUpdateStorefrontProfile({ authRepo });

    await expect(
      run({}, { userId: "user-1", customerId: "cust-1", phone: "+919999999999" })
    ).rejects.toMatchObject({
      code: "CONFLICT",
      statusCode: 409,
      message: "Phone number is already in use"
    });
  });
});
