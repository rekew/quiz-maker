import uuid

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app import db
from app.models.folder import Folder
from app.models.quiz import Quiz
from app.repositories.quiz_repo import QuizRepository
from app.schemas.folder import FolderOut


class FolderRepository:
    def __init__(self, quiz_repo: QuizRepository | None = None) -> None:
        self._quiz_repo = quiz_repo or QuizRepository()

    async def list(self) -> list[FolderOut]:
        async with db.SessionLocal() as session:
            rows = (
                await session.scalars(
                    select(Folder)
                    .options(
                        selectinload(Folder.quizzes).selectinload(Quiz.folder)
                    )
                    .order_by(Folder.created_at.desc())
                )
            ).all()
            return [self._to_out(f) for f in rows]

    async def delete(self, folder_id: str) -> bool:
        try:
            uid = uuid.UUID(folder_id)
        except ValueError:
            return False
        async with db.SessionLocal() as session:
            folder = await session.get(Folder, uid)
            if not folder:
                return False
            await session.delete(folder)
            await session.commit()
            return True

    def _to_out(self, folder: Folder) -> FolderOut:
        quizzes = sorted(folder.quizzes, key=lambda q: (q.position is None, q.position or 0))
        return FolderOut(
            id=str(folder.id),
            title=folder.title,
            created_at=folder.created_at,
            quizzes=[self._quiz_repo._to_out(q) for q in quizzes],
        )


folder_repo = FolderRepository()
