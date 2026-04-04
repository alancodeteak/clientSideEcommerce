import { AuthError } from "../../../domain/errors/AuthError.js";
import { verifyPassword } from "../../../infra/security/passwordHasher.js";
import { signCustomerAccessToken } from "../../../infra/auth/jwt.js";

/**
 * @param {{ authRepo: import("../../ports/repositories/CustomerAuthRepo.js").CustomerAuthRepo }} deps
 */
export function loginCustomer({ authRepo }) {
  /**
   * @param {import("pg").PoolClient} client
   * @param {{ email: string, password: string }} input
   */
  return async function execute(client, input) {
    const { email, password } = input;

    const user = await authRepo.getUserByEmail(client, email);
    if (!user || !user.is_active) {
      throw new AuthError("Invalid credentials");
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      throw new AuthError("Invalid credentials");
    }

    const customer = await authRepo.getCustomerByUserId(client, user.id);
    if (!customer || customer.is_blocked || customer.is_deleted) {
      throw new AuthError("Invalid credentials");
    }

    const shopIds = await authRepo.listShopIdsForCustomer(client, customer.id);

    const accessToken = signCustomerAccessToken({
      userId: user.id,
      customerId: customer.id
    });

    return {
      accessToken,
      role: "customer",
      user: { id: user.id, email: user.email },
      customer: { id: customer.id },
      shopIds
    };
  };
}
