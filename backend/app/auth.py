import hashlib
import hmac
import time
from typing import Any

from fastapi import HTTPException, Request, Response, status
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from backend.app.config import get_settings
from backend.app.storage import read_club_data

ADMIN_SESSION_COOKIE = "kkhc_admin_session"
USER_SESSION_COOKIE = "kkhc_user_session"

# Local-dev only credentials. Active only when DEMO_LOGIN_ENABLED=true.
DEMO_MEMBER_PASSWORDS = {"clen123", "michaela123"}
DEMO_MEMBER_EMAILS = {"clen@kkhlohovec.sk", "michaela@kkhlohovec.sk"}

SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

# Login brute-force protection: max attempts per (IP, e-mail) in a window.
LOGIN_ATTEMPT_LIMIT = 10
LOGIN_ATTEMPT_WINDOW_SECONDS = 600
_login_attempts: dict[str, list[float]] = {}


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(get_settings().session_secret, salt="kkhc-fastapi-session")


def create_session(email: str, role: str, name: str | None = None) -> str:
    payload: dict[str, Any] = {"email": email.lower(), "role": role}
    if name:
        payload["name"] = name
    return _serializer().dumps(payload)


def read_session_token(token: str | None) -> dict[str, Any] | None:
    if not token:
        return None
    try:
        payload = _serializer().loads(token, max_age=SESSION_MAX_AGE_SECONDS)
    except (BadSignature, SignatureExpired):
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

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        settings.admin_password_salt.encode("utf-8"),
        100_000,
        dklen=32,
    ).hex()
    if normalized == settings.admin_email.lower() and hmac.compare_digest(password_hash, settings.admin_password_hash):
        return {"email": settings.admin_email.lower(), "role": "admin", "name": "Admin"}

    if settings.demo_login_enabled and normalized in DEMO_MEMBER_EMAILS and password in DEMO_MEMBER_PASSWORDS:
        member_email = "michaela@kkhlohovec.sk" if normalized == "clen@kkhlohovec.sk" else normalized
        member = next((item for item in read_club_data().members if item.email.lower() == member_email), None)
        return {"email": member_email, "role": "member", "name": member.name if member else "Michaela Vavrová"}

    return None


def _login_attempt_key(client_ip: str, email: str) -> str:
    return f"{client_ip}|{email.strip().lower()}"


def is_login_blocked(client_ip: str, email: str) -> bool:
    now = time.monotonic()
    attempts = [ts for ts in _login_attempts.get(_login_attempt_key(client_ip, email), []) if now - ts < LOGIN_ATTEMPT_WINDOW_SECONDS]
    _login_attempts[_login_attempt_key(client_ip, email)] = attempts
    return len(attempts) >= LOGIN_ATTEMPT_LIMIT


def record_login_attempt(client_ip: str, email: str, success: bool) -> None:
    key = _login_attempt_key(client_ip, email)
    if success:
        _login_attempts.pop(key, None)
        return
    _login_attempts.setdefault(key, []).append(time.monotonic())
