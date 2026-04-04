/** @param {import("../../ports/repositories/CustomerAuthRepo.js").ShopRow|null} shop */
export function shopAllowsCustomers(shop) {
  if (!shop) return false;
  return (
    shop.status === "active" &&
    shop.is_active === true &&
    shop.is_blocked === false &&
    shop.is_deleted === false
  );
}
