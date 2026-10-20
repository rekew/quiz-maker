"""Gemini provider (kept as fallback, selectable via AI_PROVIDER=gemini)."""

from __future__ import annotations

import json
import logging

from app.core.config import settings
from app.services.ai_providers.base import SYSTEM_PROMPT, coerce_questions

logger = logging.getLogger(__name__)


class GeminiProvider:
    name = "gemini"

    async def parse(self, raw: str) -> list[Question]:
        from google import genai

        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is empty")
        logger.info("gemini request: model=%s input_chars=%d", settings.gemini_model, len(raw))
        client = genai.Client(api_key=settings.gemini_api_key)
        interaction = await client.aio.interactions.create(
            model=settings.gemini_model,
            input=f"{SYSTEM_PROMPT}\n\nINPUT:\n{raw}",
        )
        text = (interaction.output_text or "").strip()
        text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(text)
        items = data.get("questions", data if isinstance(data, list) else [])
        return coerce_questions(items, "gemini")
