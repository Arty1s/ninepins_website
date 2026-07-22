import { NextResponse, type NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "kkhc_admin_session";
const USER_SESSION_COOKIE = "kkhc_user_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE) || request.cookies.has(USER_SESSION_COOKIE);
    if (!hasSession) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/prihlasenie";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
