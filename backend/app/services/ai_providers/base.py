from __future__ import annotations

import logging
from typing import Any, Protocol

from pydantic import ValidationError

from app.schemas.quiz import Question, parse_question

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You normalize quiz text into strict JSON.
Return ONLY valid JSON, no markdown, no comments:
{"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "correctIndices": [0]}]}
Rules: keep original language, 2-6 options, correctIndices lists ALL 0-based indices of correct options (several for "choose 2/3" questions, exactly one otherwise).
Return ALL questions from the input, do not skip or summarize, keep original order.
If input marks correct like "correct: d", "Answer: B", "[CORRECT ANSWER: A]" or "(correct)", resolve them into correctIndices.
For matching-type questions, rewrite them as a normal question with options.
"""


class AIProvider(Protocol):
    name: str

    async def parse(self, raw: str) -> list[Question]:
        ...


def coerce_questions(items: Any, provider: str) -> list[Question]:
    """Validate model items one by one; skip invalid instead of failing the chunk."""
    if not isinstance(items, list):
        return []
    out: list[Question] = []
    skipped = 0
    for it in items:
        try:
            out.append(parse_question(it))
        except (ValidationError, TypeError, AttributeError):
            skipped += 1
    if skipped:
        logger.warning("%s: skipped %d invalid items", provider, skipped)
    return out
