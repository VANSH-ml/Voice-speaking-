"""Text analysis and summarization services."""

from __future__ import annotations

import math
import re
import logging

from app.schemas.requests import AnalyzeTextRequest, SummarizeRequest
from app.schemas.responses import AnalyzeTextResponse, SummarizeResponse
from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Average reading speed in words per minute
_READING_WPM = 200


def analyze_text(req: AnalyzeTextRequest) -> AnalyzeTextResponse:
    text = req.text

    # Word count: split on whitespace
    words = re.findall(r"\S+", text)
    word_count = len(words)

    # Character counts
    char_count = len(text)
    char_no_spaces = len(text.replace(" ", "").replace("\n", "").replace("\t", ""))

    # Sentence count: split on ., !, ?, … and similar endings
    sentences = re.split(r"[.!?।॥]+", text)
    sentence_count = sum(1 for s in sentences if s.strip())

    # Paragraph count: split on blank lines
    paragraphs = re.split(r"\n\s*\n", text.strip())
    paragraph_count = sum(1 for p in paragraphs if p.strip())

    # Reading time
    reading_seconds = math.ceil((word_count / _READING_WPM) * 60) if word_count else 0
    if reading_seconds < 60:
        reading_label = f"{reading_seconds} sec read"
    else:
        mins = reading_seconds // 60
        secs = reading_seconds % 60
        reading_label = f"{mins} min {secs} sec read" if secs else f"{mins} min read"

    return AnalyzeTextResponse(
        word_count=word_count,
        character_count=char_count,
        character_count_no_spaces=char_no_spaces,
        sentence_count=sentence_count,
        paragraph_count=paragraph_count,
        reading_time_seconds=reading_seconds,
        reading_time_label=reading_label,
    )


async def summarize_text(req: SummarizeRequest) -> SummarizeResponse:
    settings = get_settings()
    provider = settings.summarization_provider

    if provider == "openai":
        return await _summarize_openai(req)

    # Default: extractive fallback (no API needed)
    return _summarize_extractive(req)


def _summarize_extractive(req: SummarizeRequest) -> SummarizeResponse:
    """
    Simple extractive summarizer: picks the first N sentences.
    No ML required. For production, configure the OpenAI provider.
    """
    text = req.text.strip()
    sentences = re.split(r"(?<=[.!?।॥])\s+", text)
    sentences = [s.strip() for s in sentences if s.strip()]

    picked = sentences[: req.max_sentences]
    summary = " ".join(picked)

    original_words = len(re.findall(r"\S+", text))
    summary_words = len(re.findall(r"\S+", summary))

    return SummarizeResponse(
        summary=summary,
        original_word_count=original_words,
        summary_word_count=summary_words,
        provider="extractive (built-in)",
        language=req.language,
    )


async def _summarize_openai(req: SummarizeRequest) -> SummarizeResponse:
    import httpx
    from app.core.config import get_settings

    settings = get_settings()
    prompt = (
        f"Summarize the following text in {req.max_sentences} sentences "
        f"in the same language as the text:\n\n{req.text}"
    )

    async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 300,
                "temperature": 0.3,
            },
        )
        resp.raise_for_status()
        data = resp.json()

    summary = data["choices"][0]["message"]["content"].strip()
    original_words = len(re.findall(r"\S+", req.text))
    summary_words = len(re.findall(r"\S+", summary))

    return SummarizeResponse(
        summary=summary,
        original_word_count=original_words,
        summary_word_count=summary_words,
        provider="openai",
        language=req.language,
    )
