from app.core.config import settings
from app.services.ai_providers.base import AIProvider
from app.services.ai_providers.gemini import GeminiProvider
from app.services.ai_providers.groq import GroqProvider


def get_provider() -> AIProvider:
    if settings.ai_provider == "gemini":
        return GeminiProvider()
    return GroqProvider()
