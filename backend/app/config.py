from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    frontend_origin: str = "http://localhost:3003"

    admin_email: str = "admin@kkhlohovec.sk"
    admin_password: str = "admin123"
    session_secret: str = "change-this-long-random-string"
    cookie_secure: bool = False

    kkhc_data_dir: str = ".data"

    kolky_import_secret: str = ""
    kolky_import_from: str = "2026-07-01"
    kolky_import_to: str = ""
    kolky_import_query: str = "Hlohovec"
    kolky_import_urls: str = ""
    kolky_import_index_urls: str = "https://vysledky.kolky.sk/"

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    @property
    def data_dir(self) -> Path:
        return Path(self.kkhc_data_dir)


@lru_cache
def get_settings() -> Settings:
    return Settings()

