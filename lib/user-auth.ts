import crypto from "crypto";
import type { Session, User } from "@supabase/supabase-js";
import { getAdminEmail } from "@/lib/admin-auth";

export const USER_SESSION_COOKIE = "kkhc_user_session";

type UserSessionPayload = {
  email: string;
  role: "admin" | "member";
  name?: string;
  avatarUrl?: string;
  provider?: string;
  accessToken?: string;
  refreshToken?: string;
  exp: number;
};

function getSecret() {
  return process.env.USER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "kkhc-local-dev-session-secret-change-me";
}

export function createUserSession(user: User, session: Session, provider?: string) {
  const email = (user.email || "").trim().toLowerCase();
  const role = email && email === getAdminEmail() ? "admin" : "member";
  const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 1000 * 60 * 60 * 8;

  return signPayload({
    email,
    role,
    name: getUserName(user),
    avatarUrl: getAvatarUrl(user),
    provider,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    exp: expiresAt
  });
}

export function createDemoMemberSession(email = "michaela@kkhlohovec.sk", name = "Michaela Vavrová") {
  return signPayload({
    email: email.trim().toLowerCase(),
    role: "member",
    name,
    provider: "demo",
    exp: Date.now() + 1000 * 60 * 60 * 8
  });
}

export function readUserSession(token?: string): UserSessionPayload | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as UserSessionPayload;
    if (!parsed.email || parsed.exp < Date.now()) return null;
    if (parsed.role !== "admin" && parsed.role !== "member") return null;
    return parsed;
  } catch {
    return null;
  }
}

function getUserName(user: User): string {
  const metadata = user.user_metadata || {};
  const metadataName = metadata.full_name || metadata.name || metadata.user_name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return user.email?.split("@")[0] || "Člen KK Hlohovec";
}

function getAvatarUrl(user: User): string | undefined {
  const metadata = user.user_metadata || {};
  const avatarUrl = metadata.avatar_url || metadata.picture;
  return typeof avatarUrl === "string" && avatarUrl.trim() ? avatarUrl.trim() : undefined;
}

function signPayload(payload: UserSessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function timingSafeEqual(a: string, b: string) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);
  if (first.length !== second.length) return false;
  return crypto.timingSafeEqual(first, second);
}
