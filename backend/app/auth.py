from typing import Any

from fastapi import HTTPException, Request, Response, status
from itsdangerous import BadSignature, URLSafeSerializer

from app.config import get_settings
from app.storage import read_club_data

ADMIN_SESSION_COOKIE = "kkhc_admin_session"
USER_SESSION_COOKIE = "kkhc_user_session"
DEMO_MEMBER_PASSWORDS = {"clen123", "michaela123"}
DEMO_MEMBER_EMAILS = {"clen@kkhlohovec.sk", "michaela@kkhlohovec.sk"}


def _serializer() -> URLSafeSerializer:
    return URLSafeSerializer(get_settings().session_secret, salt="kkhc-fastapi-session")


def create_session(email: str, role: str, name: str | None = None) -> str:
    payload: dict[str, Any] = {"email": email.lower(), "role": role}
    if name:
        payload["name"] = name
    return _serializer().dumps(payload)


def read_session_token(token: str | None) -> dict[str, Any] | None:
    if not token:
        return None
    try:
        payload = _serializer().loads(token)
    except BadSignature:
        return None
    return payload if isinstance(payload, dict) else None


def read_request_session(request: Request) -> dict[str, Any] | None:
    admin = read_session_token(request.cookies.get(ADMIN_SESSION_COOKIE))
    user = read_session_token(request.cookies.get(USER_SESSION_COOKIE))
    return admin or user


def require_admin(request: Request) -> dict[str, Any]:
    session = read_session_token(request.cookies.get(ADMIN_SESSION_COOKIE))
    if not session or session.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return session


def set_session_cookie(response: Response, email: str, role: str, name: str | None = None) -> None:
    settings = get_settings()
    cookie_name = ADMIN_SESSION_COOKIE if role == "admin" else USER_SESSION_COOKIE
    response.set_cookie(
        key=cookie_name,
        value=create_session(email, role, name),
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=60 * 60 * 8,
        path="/",
    )


def clear_session_cookies(response: Response) -> None:
    response.delete_cookie(ADMIN_SESSION_COOKIE, path="/")
    response.delete_cookie(USER_SESSION_COOKIE, path="/")


def authenticate(email: str, password: str) -> dict[str, str] | None:
    settings = get_settings()
    normalized = email.strip().lower()

    if normalized == settings.admin_email.lower() and password == settings.admin_password:
        return {"email": settings.admin_email.lower(), "role": "admin", "name": "Admin"}

    if normalized in DEMO_MEMBER_EMAILS and password in DEMO_MEMBER_PASSWORDS:
        member_email = "michaela@kkhlohovec.sk" if normalized == "clen@kkhlohovec.sk" else normalized
        member = next((item for item in read_club_data().members if item.email.lower() == member_email), None)
        return {"email": member_email, "role": "member", "name": member.name if member else "Michaela Vavrová"}

    return None

