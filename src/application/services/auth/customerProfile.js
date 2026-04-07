/**
 * One object per active shop membership: customer display name + shop fields from models.
 * @param {{ display_name: string|null }} customer — `customers.display_name`
 * @param {{ id: string, name: string, slug: string }[]} shops — from `shops` joined via memberships
 */
export function buildProfileFromShops(customer, shops) {
  const name = customer.display_name ?? null;
  return shops.map((s) => ({
    name,
    shopName: s.name,
    shopId: s.id,
    shopSlug: s.slug
  }));
}
