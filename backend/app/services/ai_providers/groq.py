"""Groq provider (OpenAI-compatible API, free tier, no card required)."""

from __future__ import annotations

import json
import logging

from openai import AsyncOpenAI

from app.core.config import settings
from app.services.ai_providers.base import SYSTEM_PROMPT, coerce_questions

logger = logging.getLogger(__name__)


class GroqProvider:
    name = "groq"

    async def parse(self, raw: str) -> list[Question]:
        if not settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY is empty")
        logger.info("groq request: model=%s input_chars=%d", settings.groq_model, len(raw))
        client = AsyncOpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1")
        resp = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": raw},
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=8000,
        )
        text = (resp.choices[0].message.content or "").strip()
        text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(text)
        items = data.get("questions", data if isinstance(data, list) else [])
        return coerce_questions(items, "groq")
