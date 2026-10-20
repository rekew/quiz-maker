import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app import db
from app.models.folder import Folder  # noqa: F401 - register relationship target
from app.models.quiz import Quiz
from app.schemas.quiz import Question, QuizOut, parse_question


class QuizRepository:
    async def create(self, title: str, raw_text: str, questions: list[Question]) -> QuizOut:
        async with db.SessionLocal() as session:
            quiz = Quiz(
                title=title,
                raw_text=raw_text,
                questions=[q.model_dump() for q in questions],
            )
            session.add(quiz)
            await session.commit()
            await session.refresh(quiz)
            return self._to_out(quiz)

    async def list_page(
        self,
        *,
        q: str = "",
        folder_id: uuid.UUID | None = None,
        unfiled: bool = False,
        sort: str = "newest",
        page: int = 1,
        page_size: int = 12,
    ) -> tuple[list[QuizOut], int]:
        query = q.strip()
        conditions = []
        if query:
            conditions.append(Quiz.title.ilike(f"%{query}%"))
        if unfiled:
            conditions.append(Quiz.folder_id.is_(None))
        elif folder_id is not None:
            conditions.append(Quiz.folder_id == folder_id)

        order_by = {
            "newest": (Quiz.created_at.desc(), Quiz.id.asc()),
            "oldest": (Quiz.created_at.asc(), Quiz.id.asc()),
            "title_asc": (Quiz.title.asc(), Quiz.created_at.desc()),
            "title_desc": (Quiz.title.desc(), Quiz.created_at.desc()),
            "questions_desc": (
                func.jsonb_array_length(Quiz.questions).desc(),
                Quiz.created_at.desc(),
            ),
        }[sort]

        async with db.SessionLocal() as session:
            total = await session.scalar(
                select(func.count()).select_from(Quiz).where(*conditions)
            )
            rows = (
                await session.scalars(
                    select(Quiz)
                    .options(selectinload(Quiz.folder))
                    .where(*conditions)
                    .order_by(*order_by)
                    .offset((page - 1) * page_size)
                    .limit(page_size)
                )
            ).all()
            return [self._to_out(r) for r in rows], int(total or 0)

    async def get(self, quiz_id: str) -> QuizOut | None:
        try:
            uid = uuid.UUID(quiz_id)
        except ValueError:
            return None
        async with db.SessionLocal() as session:
            quiz = await session.scalar(
                select(Quiz).options(selectinload(Quiz.folder)).where(Quiz.id == uid)
            )
            return self._to_out(quiz) if quiz else None

    async def delete(self, quiz_id: str) -> bool:
        try:
            uid = uuid.UUID(quiz_id)
        except ValueError:
            return False
        async with db.SessionLocal() as session:
            quiz = await session.get(Quiz, uid)
            if not quiz:
                return False
            await session.delete(quiz)
            await session.commit()
            return True

    @staticmethod
    def _to_out(quiz: Quiz) -> QuizOut:
        folder = quiz.__dict__.get("folder")
        return QuizOut(
            id=str(quiz.id),
            title=quiz.title,
            raw_text=quiz.raw_text,
            questions=[parse_question(q) for q in quiz.questions],
            created_at=quiz.created_at,
            folder_id=str(quiz.folder_id) if quiz.folder_id else None,
            folder_title=folder.title if folder else None,
            position=quiz.position,
        )


quiz_repo = QuizRepository()
