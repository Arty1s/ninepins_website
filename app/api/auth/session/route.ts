import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "@/lib/admin-auth";
import { readUserSession, USER_SESSION_COOKIE } from "@/lib/user-auth";

export async function GET() {
  const adminToken = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const adminSession = readAdminSession(adminToken);

  if (adminSession) {
    return NextResponse.json({
      authenticated: true,
      user: {
        email: adminSession.email,
        role: adminSession.role,
        name: "Admin",
        avatarUrl: null,
        provider: "password"
      }
    });
  }

  const userToken = cookies().get(USER_SESSION_COOKIE)?.value;
  const userSession = readUserSession(userToken);

  if (!userSession) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: userSession.email,
      role: userSession.role,
      name: userSession.name,
      avatarUrl: userSession.avatarUrl,
      provider: userSession.provider
    }
  });
}
