import "server-only";

import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-auth";
import { readUserSession, USER_SESSION_COOKIE } from "@/lib/user-auth";

export function requireAdminSession() {
  const adminSession = readAdminSession(cookies().get(ADMIN_SESSION_COOKIE).value);
  const userSession = readUserSession(cookies().get(USER_SESSION_COOKIE).value);
  const session = adminSession || userSession;

  if (!session || session.role !== "admin") return null;
  return session;
}
