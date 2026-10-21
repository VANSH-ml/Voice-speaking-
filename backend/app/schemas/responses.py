"""Pydantic response models for all API endpoints."""

from typing import Any

from pydantic import BaseModel, Field


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    providers: dict[str, str] = Field(default_factory=dict)


# ── Languages ─────────────────────────────────────────────────────────────────

class LanguageInfo(BaseModel):
    code: str
    name: str
    native_name: str
    flag: str = ""
    supports_tts: bool = False
    supports_translation: bool = True


class LanguagesResponse(BaseModel):
    languages: list[LanguageInfo]
    total: int
    tts_provider: str
    translation_provider: str


# ── Detection ─────────────────────────────────────────────────────────────────

class DetectLanguageResponse(BaseModel):
    language_code: str
    language_name: str
    confidence: float | None = Field(
        None,
        description="Confidence score 0-1, or null if unavailable",
    )
    confidence_label: str = Field(
        "Confidence unavailable",
        description="Human-readable confidence label",
    )
    alternatives: list[dict[str, Any]] = Field(default_factory=list)
    is_reliable: bool = False


# ── Translation ───────────────────────────────────────────────────────────────

class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    source_language_name: str
    target_language: str
    target_language_name: str
    provider: str
    characters_translated: int


# ── Speech ────────────────────────────────────────────────────────────────────

class SpeechResponse(BaseModel):
    mode: str = Field(
        description="'audio_data' | 'browser_speech' | 'unavailable'",
    )
    audio_base64: str | None = None
    audio_format: str | None = None
    browser_speech_config: dict[str, Any] | None = Field(
        None,
        description="Config for Web Speech API when mode='browser_speech'",
    )
    voice_used: str | None = None
    language: str = ""
    provider: str = ""


# ── Analysis ──────────────────────────────────────────────────────────────────

class AnalyzeTextResponse(BaseModel):
    word_count: int
    character_count: int
    character_count_no_spaces: int
    sentence_count: int
    paragraph_count: int
    reading_time_seconds: int
    reading_time_label: str


# ── Summarize ─────────────────────────────────────────────────────────────────

class SummarizeResponse(BaseModel):
    summary: str
    original_word_count: int
    summary_word_count: int
    provider: str
    language: str


# ── Error ─────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
    code: str | None = None
