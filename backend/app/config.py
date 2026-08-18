from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    frontend_origin: str = "http://localhost:3003"
    frontend_origins: str = ""

    admin_email: str = "admin@kkhlohovec.sk"
    admin_password: str = "admin123"
    session_secret: str = "change-this-long-random-string"
    cookie_secure: bool = False

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
    kolky_import_id_to: int = 44050
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


@lru_cache
def get_settings() -> Settings:
    return Settings()
