"""
Application configuration loaded from environment variables.
All secret keys are read server-side only — never exposed to the frontend.
"""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Translation
    translation_provider: Literal["mymemory", "google_free", "google", "microsoft", "libre", "mock"] = "mymemory"
    google_translate_api_key: str = ""
    azure_translator_key: str = ""
    azure_translator_region: str = "eastus"
    azure_translator_endpoint: str = "https://api.cognitive.microsofttranslator.com"
    libre_translate_url: str = "https://libretranslate.com"
    libre_translate_api_key: str = ""

    # TTS
    tts_provider: Literal["google", "azure", "elevenlabs", "browser", "mock"] = "browser"
    google_tts_api_key: str = ""
    azure_speech_key: str = ""
    azure_speech_region: str = "eastus"
    elevenlabs_api_key: str = ""

    # Detection
    detection_provider: Literal["lingua", "fasttext", "mock"] = "lingua"

    # Summarization
    summarization_provider: Literal["openai", "none"] = "none"
    openai_api_key: str = ""

    # Limits
    max_text_length: int = 10_000
    max_requests_per_minute: int = 60

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
