import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { updateFileUserSettings } from "@/lib/file-user-store";
import { createLocalMemberSession, readUserSession, USER_SESSION_COOKIE } from "@/lib/user-auth";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = readUserSession(cookies().get(USER_SESSION_COOKIE)?.value || "");
  if (!session) return NextResponse.json({ ok: false, message: "Najprv sa prihlás." }, { status: 401 });
  const body = await request.json() as { email?: string; currentPassword?: string; newPassword?: string };
  const result = await updateFileUserSettings(session.email, body.email || "", body.currentPassword || "", body.newPassword || undefined);
  if (!result.ok) {
    const messages = { not_found: "Účet sa nenašiel.", invalid_password: "Aktuálne heslo nie je správne.", invalid_email: "Zadaj platný e-mail.", exists: "Tento e-mail už používa iný účet." };
    return NextResponse.json({ ok: false, message: messages[result.reason] }, { status: 400 });
  }
  const response = NextResponse.json({ ok: true, message: "Nastavenia boli uložené." });
  response.cookies.set(USER_SESSION_COOKIE, createLocalMemberSession(result.user.email, result.user.name, "password", result.user.accountType), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
