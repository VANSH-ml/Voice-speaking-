"""Pydantic request models for all API endpoints."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator


class DetectLanguageRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10_000, description="Text to analyse")

    @field_validator("text")
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip()


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10_000)
    source_language: str = Field(
        ...,
        description="BCP-47 language code, e.g. 'en', 'hi', 'auto'",
        pattern=r"^[a-z]{2,3}(-[A-Z]{2,4})?$|^auto$",
    )
    target_language: str = Field(
        ...,
        description="BCP-47 language code, e.g. 'fr', 'de'",
        pattern=r"^[a-z]{2,3}(-[A-Z]{2,4})?$",
    )

    @field_validator("text")
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip()


class SpeechRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5_000)
    language: str = Field(..., description="BCP-47 language code, e.g. 'en-US'")
    voice_id: str | None = Field(None, description="Provider-specific voice identifier")
    speed: float = Field(1.0, ge=0.25, le=4.0, description="Playback speed multiplier")
    style: Literal["natural", "slow_clear", "storytelling"] = "natural"

    @field_validator("text")
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip()


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10_000)


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=50, max_length=10_000)
    language: str = Field("en", description="Language code for the summary output")
    max_sentences: int = Field(3, ge=1, le=10)
