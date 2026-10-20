from datetime import datetime

from pydantic import BaseModel

from app.schemas.quiz import QuizOut


class FolderOut(BaseModel):
    id: str
    title: str
    created_at: datetime
    quizzes: list[QuizOut] = []
