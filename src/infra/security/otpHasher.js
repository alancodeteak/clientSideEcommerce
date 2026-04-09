import bcrypt from "@node-rs/bcrypt";

const OTP_BCRYPT_ROUNDS = 8;

export async function hashOtpCode(code) {
  return bcrypt.hash(String(code), OTP_BCRYPT_ROUNDS);
}

export async function verifyOtpCode(code, hash) {
  if (!hash) return false;
  return bcrypt.verify(String(code), hash);
}
