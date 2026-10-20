import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql://quiz:quiz@localhost:5432/quizdb")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    ai_provider: str = os.getenv("AI_PROVIDER", "groq")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    ai_chunk_size: int = int(os.getenv("AI_CHUNK_SIZE", "15"))
    ai_chunk_chars: int = int(os.getenv("AI_CHUNK_CHARS", "6000"))
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")


settings = Settings()
