"""
Language detection service.
Provider: lingua-language-detector (default) | mock
"""

from __future__ import annotations

import logging
from functools import lru_cache

from app.core.config import get_settings
from app.schemas.responses import DetectLanguageResponse
from app.services.language_data import get_language_name

logger = logging.getLogger(__name__)


def _confidence_label(score: float | None) -> str:
    if score is None:
        return "Confidence unavailable"
    if score >= 0.95:
        return "Very high confidence"
    if score >= 0.80:
        return "High confidence"
    if score >= 0.60:
        return "Moderate confidence"
    return "Low confidence"


# ── Lingua detector (singleton) ───────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_lingua_detector():
    """Build and cache the Lingua LanguageDetector (loads ~50 MB once)."""
    from lingua import LanguageDetectorBuilder
    return (
        LanguageDetectorBuilder
        .from_all_languages()
        .with_preloaded_language_models()
        .build()
    )


# ── Public API ────────────────────────────────────────────────────────────────

def detect_language(text: str) -> DetectLanguageResponse:
    settings = get_settings()
    provider = settings.detection_provider

    if provider == "lingua":
        return _detect_lingua(text)
    return _detect_mock(text)


def _detect_lingua(text: str) -> DetectLanguageResponse:
    try:
        detector = _get_lingua_detector()
        result = detector.detect_language_of(text)

        if result is None:
            return DetectLanguageResponse(
                language_code="und",
                language_name="Undetermined",
                confidence=None,
                confidence_label="Language could not be determined",
                is_reliable=False,
            )

        # Lingua returns an ISO 639-1 code via .iso_code_639_1.name.lower()
        code = result.iso_code_639_1.name.lower()
        name = get_language_name(code) or result.name.title()

        # Confidence values via compute_language_confidence_values (returns list)
        confidence_values = detector.compute_language_confidence_values(text)
        score: float | None = None
        alternatives = []
        for i, cv in enumerate(confidence_values[:4]):
            cv_code = cv.language.iso_code_639_1.name.lower()
            cv_name = get_language_name(cv_code) or cv.language.name.title()
            if i == 0:
                score = round(cv.value, 4)
            else:
                alternatives.append({
                    "language_code": cv_code,
                    "language_name": cv_name,
                    "confidence": round(cv.value, 4),
                })

        return DetectLanguageResponse(
            language_code=code,
            language_name=name,
            confidence=score,
            confidence_label=_confidence_label(score),
            alternatives=alternatives,
            is_reliable=(score or 0) >= 0.60,
        )

    except Exception as exc:
        logger.error("Lingua detection error: %s", exc)
        return _detect_mock(text)


def _detect_mock(text: str) -> DetectLanguageResponse:
    """Heuristic mock — detects a handful of scripts deterministically."""
    sample = text[:200]

    # Very rough Unicode-range heuristics for demo / offline testing
    def has_range(start: int, end: int) -> bool:
        return any(start <= ord(c) <= end for c in sample)

    if has_range(0x0900, 0x097F):
        code, name = "hi", "Hindi"
    elif has_range(0x0980, 0x09FF):
        code, name = "bn", "Bengali"
    elif has_range(0x0B80, 0x0BFF):
        code, name = "ta", "Tamil"
    elif has_range(0x0C00, 0x0C7F):
        code, name = "te", "Telugu"
    elif has_range(0x0600, 0x06FF):
        code, name = "ar", "Arabic"
    elif has_range(0x4E00, 0x9FFF):
        code, name = "zh", "Chinese (Simplified)"
    elif has_range(0x3040, 0x30FF):
        code, name = "ja", "Japanese"
    elif has_range(0xAC00, 0xD7AF):
        code, name = "ko", "Korean"
    elif has_range(0x0400, 0x04FF):
        code, name = "ru", "Russian"
    else:
        code, name = "en", "English"

    return DetectLanguageResponse(
        language_code=code,
        language_name=name,
        confidence=None,
        confidence_label="Confidence unavailable (mock provider)",
        is_reliable=True,
    )
