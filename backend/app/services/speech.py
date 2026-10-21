"""
Text-to-speech service with pluggable providers.
Providers: browser | mock | google | azure | elevenlabs
"""

from __future__ import annotations

import base64
import logging

import httpx

from app.core.config import get_settings
from app.schemas.requests import SpeechRequest
from app.schemas.responses import SpeechResponse
from app.services.language_data import LANGUAGES, get_language

logger = logging.getLogger(__name__)
_TIMEOUT = httpx.Timeout(60.0)


# ── Public API ────────────────────────────────────────────────────────────────

async def generate_speech(req: SpeechRequest) -> SpeechResponse:
    settings = get_settings()
    provider = settings.tts_provider

    if provider == "google":
        return await _tts_google(req)
    if provider == "azure":
        return await _tts_azure(req)
    if provider == "elevenlabs":
        return await _tts_elevenlabs(req)
    if provider == "browser":
        return _tts_browser(req)
    return _tts_mock(req)


# ── Browser Web Speech API ────────────────────────────────────────────────────

def _tts_browser(req: SpeechRequest) -> SpeechResponse:
    """
    Returns a config object the frontend uses to call window.speechSynthesis.
    No audio is generated server-side.
    """
    lang_meta = get_language(req.language.split("-")[0])
    bcp47 = lang_meta.bcp47_tts if lang_meta else req.language

    rate_map = {"natural": 1.0, "slow_clear": 0.75, "storytelling": 0.9}
    rate = rate_map.get(req.style, 1.0) * req.speed

    return SpeechResponse(
        mode="browser_speech",
        browser_speech_config={
            "text": req.text,
            "lang": bcp47,
            "rate": round(rate, 2),
            "pitch": 1.0,
            "volume": 1.0,
        },
        voice_used=bcp47,
        language=bcp47,
        provider="browser",
    )


# ── Mock provider ─────────────────────────────────────────────────────────────

def _tts_mock(_req: SpeechRequest) -> SpeechResponse:
    return SpeechResponse(
        mode="unavailable",
        provider="mock",
        language=_req.language,
        browser_speech_config=None,
    )


# ── Google Cloud TTS ──────────────────────────────────────────────────────────

async def _tts_google(req: SpeechRequest) -> SpeechResponse:
    settings = get_settings()
    lang_meta = get_language(req.language.split("-")[0])
    bcp47 = lang_meta.bcp47_tts if lang_meta else req.language

    rate_map = {"natural": 1.0, "slow_clear": 0.7, "storytelling": 0.85}
    rate = rate_map.get(req.style, 1.0) * req.speed

    payload = {
        "input": {"text": req.text},
        "voice": {
            "languageCode": bcp47,
            "name": req.voice_id or "",
            "ssmlGender": "NEUTRAL",
        },
        "audioConfig": {
            "audioEncoding": "MP3",
            "speakingRate": rate,
        },
    }

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            "https://texttospeech.googleapis.com/v1/text:synthesize",
            params={"key": settings.google_tts_api_key},
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()

    audio_b64 = data.get("audioContent", "")
    return SpeechResponse(
        mode="audio_data",
        audio_base64=audio_b64,
        audio_format="mp3",
        voice_used=req.voice_id or bcp47,
        language=bcp47,
        provider="google",
    )


# ── Azure Cognitive Speech ────────────────────────────────────────────────────

async def _tts_azure(req: SpeechRequest) -> SpeechResponse:
    settings = get_settings()
    lang_meta = get_language(req.language.split("-")[0])
    bcp47 = lang_meta.bcp47_tts if lang_meta else req.language

    rate_map = {"natural": "+0%", "slow_clear": "-25%", "storytelling": "-15%"}
    rate_str = rate_map.get(req.style, "+0%")

    voice_name = req.voice_id or f"{bcp47}-Neural"
    ssml = (
        f'<speak version="1.0" xml:lang="{bcp47}">'
        f'<voice name="{voice_name}">'
        f'<prosody rate="{rate_str}">{req.text}</prosody>'
        f"</voice></speak>"
    )

    token_url = (
        f"https://{settings.azure_speech_region}.api.cognitive.microsoft.com"
        f"/sts/v1.0/issuetoken"
    )
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        token_resp = await client.post(
            token_url,
            headers={"Ocp-Apim-Subscription-Key": settings.azure_speech_key},
        )
        token_resp.raise_for_status()
        token = token_resp.text

        synth_url = (
            f"https://{settings.azure_speech_region}.tts.speech.microsoft.com"
            f"/cognitiveservices/v1"
        )
        audio_resp = await client.post(
            synth_url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/ssml+xml",
                "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
            },
            content=ssml.encode("utf-8"),
        )
        audio_resp.raise_for_status()
        audio_bytes = audio_resp.content

    return SpeechResponse(
        mode="audio_data",
        audio_base64=base64.b64encode(audio_bytes).decode(),
        audio_format="mp3",
        voice_used=voice_name,
        language=bcp47,
        provider="azure",
    )


# ── ElevenLabs ────────────────────────────────────────────────────────────────

async def _tts_elevenlabs(req: SpeechRequest) -> SpeechResponse:
    """
    ElevenLabs supports a limited set of languages; falls back to browser speech
    when the language is not supported.
    """
    settings = get_settings()

    # ElevenLabs multilingual model: eleven_multilingual_v2
    voice_id = req.voice_id or "21m00Tcm4TlvDq8ikWAM"  # default "Rachel"

    payload = {
        "text": req.text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": settings.elevenlabs_api_key,
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if resp.status_code == 422:
            # Language likely unsupported — fall back to browser
            return _tts_browser(req)
        resp.raise_for_status()
        audio_bytes = resp.content

    return SpeechResponse(
        mode="audio_data",
        audio_base64=base64.b64encode(audio_bytes).decode(),
        audio_format="mp3",
        voice_used=voice_id,
        language=req.language,
        provider="elevenlabs",
    )


# ── Available voices helper ───────────────────────────────────────────────────

def get_browser_tts_languages() -> list[dict]:
    """Return languages known to work with browser Web Speech API."""
    return [
        {"code": lang.bcp47_tts, "name": lang.name, "flag": lang.flag}
        for lang in LANGUAGES
        if lang.tts_browser
    ]
