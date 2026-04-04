import bcrypt from "@node-rs/bcrypt";

export async function hashPassword(plain) {
  return await bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain, hash) {
  if (!hash) return false;
  return await bcrypt.verify(plain, hash);
}
