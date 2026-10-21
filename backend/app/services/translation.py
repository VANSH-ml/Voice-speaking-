"""
Translation service with pluggable providers.
Providers: mock | mymemory | google_free | libre | google | microsoft
"""

from __future__ import annotations

import logging
import uuid

import httpx

from app.core.config import get_settings
from app.schemas.requests import TranslateRequest
from app.schemas.responses import TranslateResponse
from app.services.language_data import get_language_name

logger = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(30.0)


# ── Public API ────────────────────────────────────────────────────────────────

async def translate_text(req: TranslateRequest) -> TranslateResponse:
    settings = get_settings()
    provider = settings.translation_provider

    source = req.source_language if req.source_language != "auto" else "auto"

    if provider == "mymemory":
        return await _translate_mymemory(req.text, source, req.target_language)
    if provider == "google_free":
        return await _translate_google_free(req.text, source, req.target_language)
    if provider == "google":
        return await _translate_google(req.text, source, req.target_language)
    if provider == "microsoft":
        return await _translate_microsoft(req.text, source, req.target_language)
    if provider == "libre":
        return await _translate_libre(req.text, source, req.target_language)

    # Default: mock
    return _translate_mock(req.text, source, req.target_language)


# ── Mock provider ─────────────────────────────────────────────────────────────

def _translate_mock(text: str, source: str, target: str) -> TranslateResponse:
    """Returns the original text with a clear demo prefix so it's obvious this is mock."""
    source_name = get_language_name(source) if source != "auto" else "Auto-detected"
    target_name = get_language_name(target)
    translated = (
        f"[Mock translation → {target_name}]\n\n{text}\n\n"
        f"⚠️  Configure a real translation provider in .env to get actual translations."
    )
    return TranslateResponse(
        original_text=text,
        translated_text=translated,
        source_language=source,
        source_language_name=source_name,
        target_language=target,
        target_language_name=target_name,
        provider="mock",
        characters_translated=len(text),
    )


# ── LibreTranslate ────────────────────────────────────────────────────────────

async def _translate_libre(text: str, source: str, target: str) -> TranslateResponse:
    settings = get_settings()
    payload: dict = {"q": text, "source": source, "target": target, "format": "text"}
    if settings.libre_translate_api_key:
        payload["api_key"] = settings.libre_translate_api_key

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            f"{settings.libre_translate_url.rstrip('/')}/translate",
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()

    translated = data.get("translatedText", "")
    detected_source = data.get("detectedLanguage", {}).get("language", source)
    actual_source = detected_source if source == "auto" else source

    return TranslateResponse(
        original_text=text,
        translated_text=translated,
        source_language=actual_source,
        source_language_name=get_language_name(actual_source),
        target_language=target,
        target_language_name=get_language_name(target),
        provider="libre",
        characters_translated=len(text),
    )


# ── MyMemory (free, no API key, 5000 words/day) ───────────────────────────────

async def _translate_mymemory(text: str, source: str, target: str) -> TranslateResponse:
    # MyMemory needs an explicit source — use "Autodetect" via the detected code
    # If source is "auto", try a best-effort with the first 500 chars (API limit)
    truncated = text[:500]

    # If source is auto, MyMemory doesn't support auto-detect, so we detect
    # using the detection service or default to "en"
    if source == "auto":
        from app.services.detection import detect_language
        det = detect_language(text)
        source = det.language_code if det.language_code != "und" else "en"

    langpair = f"{source}|{target}"

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(
            "https://api.mymemory.translated.net/get",
            params={"q": truncated, "langpair": langpair},
            headers={"User-Agent": "Mozilla/5.0"},
        )
        resp.raise_for_status()
        data = resp.json()

    translated = data.get("responseData", {}).get("translatedText", "")

    # Handle long text: MyMemory has a 500-char limit per request.
    # If the original is longer, translate in chunks and join.
    if len(text) > 500 and translated:
        chunks = [text[i:i+500] for i in range(0, len(text), 500)]
        translated_parts = []
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            for chunk in chunks:
                resp = await client.get(
                    "https://api.mymemory.translated.net/get",
                    params={"q": chunk, "langpair": langpair},
                    headers={"User-Agent": "Mozilla/5.0"},
                )
                if resp.status_code == 200:
                    part = resp.json().get("responseData", {}).get("translatedText", "")
                    translated_parts.append(part)
                else:
                    translated_parts.append(chunk)  # fallback to original
        translated = " ".join(translated_parts)

    if not translated:
        raise RuntimeError("MyMemory returned an empty translation")

    return TranslateResponse(
        original_text=text,
        translated_text=translated,
        source_language=source,
        source_language_name=get_language_name(source),
        target_language=target,
        target_language_name=get_language_name(target),
        provider="mymemory",
        characters_translated=len(text),
    )


# ── Google Translate (free, no API key) ───────────────────────────────────────
#
# Uses the same public web endpoint that translate.google.com uses.
# No API key, no billing. Rate-limited but fine for personal use.

async def _translate_google_free(text: str, source: str, target: str) -> TranslateResponse:
    params: dict = {
        "client": "gtx",
        "sl": source,
        "tl": target,
        "dt": "t",
        "q": text,
    }

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(
            "https://translate.googleapis.com/translate_a/single",
            params=params,
            headers={"User-Agent": "Mozilla/5.0"},
        )
        resp.raise_for_status()
        data = resp.json()

    # Response format: [[["translated chunk","original chunk",...],...], ..., ["detected_source_lang"]]
    translated_chunks = []
    for chunk in data[0]:
        if chunk and chunk[0]:
            translated_chunks.append(chunk[0])
    translated = "".join(translated_chunks)

    # data[2] is the detected source language code (e.g. "en")
    detected = data[2] if len(data) > 2 and data[2] else source
    actual_source = detected if source == "auto" else source

    return TranslateResponse(
        original_text=text,
        translated_text=translated,
        source_language=actual_source,
        source_language_name=get_language_name(actual_source),
        target_language=target,
        target_language_name=get_language_name(target),
        provider="google_free",
        characters_translated=len(text),
    )


# ── Google Cloud Translation (official, requires API key) ─────────────────────

async def _translate_google(text: str, source: str, target: str) -> TranslateResponse:
    settings = get_settings()
    params = {"q": text, "target": target, "key": settings.google_translate_api_key, "format": "text"}
    if source != "auto":
        params["source"] = source

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            "https://translation.googleapis.com/language/translate/v2",
            params=params,
        )
        resp.raise_for_status()
        data = resp.json()

    translation = data["data"]["translations"][0]
    translated = translation["translatedText"]
    detected = translation.get("detectedSourceLanguage", source)
    actual_source = detected if source == "auto" else source

    return TranslateResponse(
        original_text=text,
        translated_text=translated,
        source_language=actual_source,
        source_language_name=get_language_name(actual_source),
        target_language=target,
        target_language_name=get_language_name(target),
        provider="google",
        characters_translated=len(text),
    )


# ── Microsoft Azure Translator ────────────────────────────────────────────────

async def _translate_microsoft(text: str, source: str, target: str) -> TranslateResponse:
    settings = get_settings()
    headers = {
        "Ocp-Apim-Subscription-Key": settings.azure_translator_key,
        "Ocp-Apim-Subscription-Region": settings.azure_translator_region,
        "Content-Type": "application/json",
        "X-ClientTraceId": str(uuid.uuid4()),
    }
    params = {"api-version": "3.0", "to": target}
    if source != "auto":
        params["from"] = source

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            f"{settings.azure_translator_endpoint}/translate",
            headers=headers,
            params=params,
            json=[{"Text": text}],
        )
        resp.raise_for_status()
        data = resp.json()

    result = data[0]
    translated = result["translations"][0]["text"]
    detected = result.get("detectedLanguage", {}).get("language", source)
    actual_source = detected if source == "auto" else source

    return TranslateResponse(
        original_text=text,
        translated_text=translated,
        source_language=actual_source,
        source_language_name=get_language_name(actual_source),
        target_language=target,
        target_language_name=get_language_name(target),
        provider="microsoft",
        characters_translated=len(text),
    )
