import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "kkhc_admin_session";

const DEFAULT_ADMIN_EMAIL = "admin@kkhlohovec.sk";
const DEFAULT_PASSWORD_SALT = "kkhc-demo-admin-salt";
const DEFAULT_PASSWORD_HASH = "f5a6db06bbedf3e0cad8623e63502b58324bff9727bb7d6990b375b49af90198";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "kkhc-local-dev-session-secret-change-me";
}

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

export async function verifyAdminPassword(email: string, password: string) {
  const expectedEmail = getAdminEmail();
  if (email.trim().toLowerCase() !== expectedEmail) return false;

  const salt = process.env.ADMIN_PASSWORD_SALT || DEFAULT_PASSWORD_SALT;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;
  const actualHash = await hashPassword(password, salt);

  return timingSafeEqual(actualHash, expectedHash);
}

export function createAdminSession(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email: email.trim().toLowerCase(),
      role: "admin",
      exp: Date.now() + 1000 * 60 * 60 * 8
    })
  ).toString("base64url");

  const signature = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readAdminSession(token?: string) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email: string;
      role: string;
      exp: number;
    };

    if (parsed.role !== "admin" || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hashPassword(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, "sha256", (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey.toString("hex"));
    });
  });
}

function timingSafeEqual(a: string, b: string) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);
  if (first.length !== second.length) return false;
  return crypto.timingSafeEqual(first, second);
}
