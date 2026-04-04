export async function setTenantContext(client, shopId) {
  if (!shopId) return;
  await client.query("select set_config('app.current_shop_id', $1, true)", [shopId]);
}
