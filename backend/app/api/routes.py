"""
All FastAPI route handlers.
Each endpoint validates input via Pydantic, calls the appropriate service,
and returns a typed response or a structured error.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.schemas.requests import (
    AnalyzeTextRequest,
    DetectLanguageRequest,
    SpeechRequest,
    SummarizeRequest,
    TranslateRequest,
)
from app.schemas.responses import (
    AnalyzeTextResponse,
    DetectLanguageResponse,
    ErrorResponse,
    HealthResponse,
    LanguageInfo,
    LanguagesResponse,
    SpeechResponse,
    SummarizeResponse,
    TranslateResponse,
)
from app.services import analysis, detection, speech, translation
from app.services.language_data import LANGUAGES

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Health ─────────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        version="1.0.0",
        providers={
            "detection": settings.detection_provider,
            "translation": settings.translation_provider,
            "tts": settings.tts_provider,
            "summarization": settings.summarization_provider,
        },
    )


# ── Languages ─────────────────────────────────────────────────────────────────

@router.get("/languages", response_model=LanguagesResponse, tags=["Languages"])
async def get_languages() -> LanguagesResponse:
    settings = get_settings()
    tts_all = settings.tts_provider in ("google", "azure", "elevenlabs")

    lang_list = [
        LanguageInfo(
            code=lang.code,
            name=lang.name,
            native_name=lang.native_name,
            flag=lang.flag,
            supports_tts=lang.tts_browser or tts_all,
            supports_translation=True,
        )
        for lang in LANGUAGES
    ]
    return LanguagesResponse(
        languages=lang_list,
        total=len(lang_list),
        tts_provider=settings.tts_provider,
        translation_provider=settings.translation_provider,
    )


# ── Detect Language ───────────────────────────────────────────────────────────

@router.post(
    "/detect-language",
    response_model=DetectLanguageResponse,
    tags=["Detection"],
    responses={422: {"model": ErrorResponse}},
)
async def detect_language(req: DetectLanguageRequest) -> DetectLanguageResponse:
    if not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Text must not be empty.",
        )
    try:
        return detection.detect_language(req.text)
    except Exception as exc:
        logger.exception("Detection error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Language detection failed: {exc}",
        ) from exc


# ── Translate ─────────────────────────────────────────────────────────────────

@router.post(
    "/translate",
    response_model=TranslateResponse,
    tags=["Translation"],
    responses={422: {"model": ErrorResponse}, 502: {"model": ErrorResponse}},
)
async def translate(req: TranslateRequest) -> TranslateResponse:
    if req.source_language != "auto" and req.source_language == req.target_language:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Source and target languages must be different.",
        )
    try:
        return await translation.translate_text(req)
    except Exception as exc:
        logger.exception("Translation error")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Translation failed: {exc}",
        ) from exc


# ── Speech ────────────────────────────────────────────────────────────────────

@router.post(
    "/speech",
    response_model=SpeechResponse,
    tags=["Speech"],
    responses={422: {"model": ErrorResponse}, 502: {"model": ErrorResponse}},
)
async def generate_speech(req: SpeechRequest) -> SpeechResponse:
    try:
        return await speech.generate_speech(req)
    except Exception as exc:
        logger.exception("TTS error")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Speech synthesis failed: {exc}",
        ) from exc


# ── Analyze Text ──────────────────────────────────────────────────────────────

@router.post(
    "/analyze-text",
    response_model=AnalyzeTextResponse,
    tags=["Analysis"],
)
async def analyze_text(req: AnalyzeTextRequest) -> AnalyzeTextResponse:
    return analysis.analyze_text(req)


# ── Summarize ─────────────────────────────────────────────────────────────────

@router.post(
    "/summarize",
    response_model=SummarizeResponse,
    tags=["Analysis"],
    responses={502: {"model": ErrorResponse}},
)
async def summarize(req: SummarizeRequest) -> SummarizeResponse:
    try:
        return await analysis.summarize_text(req)
    except Exception as exc:
        logger.exception("Summarization error")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Summarization failed: {exc}",
        ) from exc
