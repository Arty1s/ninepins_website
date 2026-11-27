from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Values that must never be accepted as production secrets
# (previously hardcoded defaults that leaked via the public repo).
FORBIDDEN_SECRET_VALUES = {
    "kkhc-admin-2026-08",
    "3b95cbe520e5d75f68f9d5a7ad98aefeddea0b6d81418948962b19fd1bd6809f",
    "kkhc-fastapi-session-2026-08-rotated",
    "replace-with-a-random-salt",
    "replace-with-a-pbkdf2-sha256-hash",
    "change-this-long-random-string",
    "change-this-long-random-string-too",
    "changeme",
    "",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    frontend_origin: str = "http://localhost:3003"
    frontend_origins: str = ""

    admin_email: str = "prezidentkkz@gmail.com"
    # No defaults on purpose: the app refuses to start without real values.
    admin_password_salt: str = Field(min_length=8)
    admin_password_hash: str = Field(min_length=32)
    session_secret: str = Field(min_length=32)
    cookie_secure: bool = True

    # Local-dev only logins (michaela/clen). Always off unless explicitly enabled.
    demo_login_enabled: bool = False

    kkhc_data_dir: str = ".data"

    next_public_supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_live_state_table: str = "kkhc_live_state"
    supabase_storage_bucket: str = "gallery"

    kolky_import_secret: str = ""
    kolky_import_from: str = "2025-09-01"
    kolky_import_to: str = "2027-06-30"
    kolky_import_query: str = "Hlohovec"
    kolky_import_urls: str = ""
    kolky_import_index_urls: str = "https://vysledky.kolky.sk/archive,https://vysledky.kolky.sk/"
    kolky_import_cache_file: str = "fixtures/kolky-hlohovec-matches.json"
    kolky_import_id_from: int = 43000
    kolky_import_id_to: int = 47000
    kolky_auto_import_enabled: bool = False
    kolky_auto_import_interval_seconds: int = 60 * 60 * 24

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    @property
    def supabase_url(self) -> str:
        return self.next_public_supabase_url.rstrip("/")

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def data_dir(self) -> Path:
        return Path(self.kkhc_data_dir)

    @property
    def allowed_origins(self) -> list[str]:
        origins = [self.frontend_origin, "http://127.0.0.1:3003", "http://localhost:3003"]
        origins.extend(item.strip() for item in self.frontend_origins.split(",") if item.strip())
        return list(dict.fromkeys(origin.rstrip("/") for origin in origins if origin))

    @field_validator("admin_password_salt", "admin_password_hash", "session_secret")
    @classmethod
    def _reject_leaked_or_placeholder_secrets(cls, value: str) -> str:
        if not value or not value.strip() or value.strip() in FORBIDDEN_SECRET_VALUES:
            raise ValueError(
                "Refusing to start with a missing, placeholder or previously leaked secret. "
                "Set a real ADMIN_PASSWORD_SALT / ADMIN_PASSWORD_HASH / SESSION_SECRET."
            )
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
