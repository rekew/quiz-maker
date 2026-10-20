from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


class Question(BaseModel):
    question: str
    options: list[str] = Field(min_length=2)
    correctIndices: list[int] = Field(min_length=1)


def parse_question(raw: dict[str, Any]) -> Question:
    """Accepts new {correctIndices} and legacy {correctIndex} shapes."""
    if "correctIndices" not in raw and "correctIndex" in raw:
        raw = {**raw, "correctIndices": [raw["correctIndex"]]}
    return Question(**raw)


class QuizCreate(BaseModel):
    title: str = "Untitled quiz"
    raw_text: str = Field(min_length=3)


class QuizOut(BaseModel):
    id: str
    title: str
    raw_text: str
    questions: list[Question]
    created_at: datetime
    folder_id: str | None = None
    folder_title: str | None = None
    position: int | None = None


class QuizPage(BaseModel):
    items: list[QuizOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class SplitRequest(BaseModel):
    chunk_size: int = Field(gt=1, le=100)
    folder_title: str | None = Field(default=None, min_length=1, max_length=300)
