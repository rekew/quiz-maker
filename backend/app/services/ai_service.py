"""AI normalization: raw free-form text -> structured questions.

Large pastes are split into chunks by blank-line paragraphs (no
assumptions about question numbering — any user format works).
Overlapping paragraphs + dedupe by question text keep boundary
questions intact. Provider is selected via AI_PROVIDER (groq | gemini).
"""

from __future__ import annotations

import logging

from fastapi import HTTPException

from app.core.config import settings
from app.schemas.quiz import Question
from app.services.ai_providers.factory import get_provider

logger = logging.getLogger(__name__)

OVERLAP_PARAS = 1
HARD_WINDOW = 6000
HARD_OVERLAP = 500


def split_paragraphs(raw: str) -> list[str]:
    paras: list[str] = []
    current: list[str] = []
    for line in raw.split("\n"):
        if line.strip():
            current.append(line)
        elif current:
            paras.append("\n".join(current).strip())
            current = []
    if current:
        paras.append("\n".join(current).strip())
    return [p for p in paras if p] or [raw.strip()]


def hard_windows(raw: str) -> list[str]:
    chunks: list[str] = []
    start = 0
    while start < len(raw):
        end = min(start + HARD_WINDOW, len(raw))
        chunks.append(raw[start:end])
        if end == len(raw):
            break
        start = end - HARD_OVERLAP
    return chunks


def chunk_text(raw: str, target_chars: int) -> list[str]:
    paras = split_paragraphs(raw)
    if len(paras) <= 1 and len(raw) > target_chars:
        return hard_windows(raw)
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0
    for para in paras:
        if current and current_len + len(para) > target_chars:
            chunks.append("\n\n".join(current))
            current = current[-OVERLAP_PARAS:] if OVERLAP_PARAS else []
            current_len = sum(len(p) for p in current)
        current.append(para)
        current_len += len(para)
    if current:
        chunks.append("\n\n".join(current))
    return chunks or [raw.strip()]


def dedupe(questions: list[Question]) -> tuple[list[Question], int]:
    seen: set[str] = set()
    out: list[Question] = []
    for q in questions:
        key = " ".join(q.question.lower().split())
        if key in seen:
            continue
        seen.add(key)
        out.append(q)
    return out, len(questions) - len(out)


async def normalize(raw: str) -> tuple[list[Question], str]:
    """Returns (questions, provider_used). Raises HTTPException on AI failure."""
    provider = get_provider()
    chunks = chunk_text(raw, max(1000, settings.ai_chunk_chars))
    logger.info("normalize: provider=%s chunks=%d", provider.name, len(chunks))
    questions: list[Question] = []
    for i, chunk in enumerate(chunks, 1):
        try:
            got = await provider.parse(chunk)
        except Exception:
            logger.exception("AI parse failed: provider=%s chunk=%d/%d", provider.name, i, len(chunks))
            raise HTTPException(status_code=502, detail="AI parsing failed. See backend logs for details.")
        logger.info("chunk %d/%d: %d questions via %s", i, len(chunks), len(got), provider.name)
        questions.extend(got)
    questions, dupes = dedupe(questions)
    if not questions:
        logger.warning("AI returned zero questions: provider=%s", provider.name)
        raise HTTPException(status_code=422, detail="AI returned no questions. Check the input format.")
    logger.info(
        "parsed %d questions in %d chunks via %s (deduped %d)",
        len(questions),
        len(chunks),
        provider.name,
        dupes,
    )
    return questions, provider.name
