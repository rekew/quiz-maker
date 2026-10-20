import math
import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app import db
from app.models.folder import Folder
from app.models.quiz import Quiz
from app.repositories.quiz_repo import quiz_repo
from app.schemas.folder import FolderOut
from app.schemas.quiz import QuizCreate, QuizOut, QuizPage, SplitRequest
from app.services import ai_service

VALID_SORTS = {"newest", "oldest", "title_asc", "title_desc", "questions_desc"}


def chunk_title(base: str, index: int, total: int, start: int, end: int) -> str:
    return f"{base} — Part {index}/{total} ({start}–{end})"


class QuizService:
    async def parse_and_save(self, data: QuizCreate) -> QuizOut:
        questions, _ = await ai_service.normalize(data.raw_text)
        if not questions:
            raise HTTPException(status_code=422, detail="Could not parse any question. Check the format.")
        return await quiz_repo.create(data.title, data.raw_text, questions)

    async def list_page(
        self,
        *,
        q: str = "",
        folder: str = "all",
        sort: str = "newest",
        page: int = 1,
        page_size: int = 12,
    ) -> QuizPage:
        if sort not in VALID_SORTS:
            raise HTTPException(status_code=400, detail="Invalid sort option.")

        folder_id: uuid.UUID | None = None
        unfiled = folder == "unfiled"
        if folder not in {"all", "unfiled"}:
            try:
                folder_id = uuid.UUID(folder)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid folder filter.")

        items, total = await quiz_repo.list_page(
            q=q,
            folder_id=folder_id,
            unfiled=unfiled,
            sort=sort,
            page=page,
            page_size=page_size,
        )
        return QuizPage(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total / page_size) if total else 0,
        )

    async def get(self, quiz_id: str) -> QuizOut:
        quiz = await quiz_repo.get(quiz_id)
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        return quiz

    async def delete(self, quiz_id: str) -> None:
        if not await quiz_repo.delete(quiz_id):
            raise HTTPException(status_code=404, detail="Quiz not found")

    async def split(self, quiz_id: str, data: SplitRequest) -> FolderOut:
        try:
            uid = uuid.UUID(quiz_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Quiz not found")
        async with db.SessionLocal() as session:
            async with session.begin():
                quiz = await session.get(Quiz, uid)
                if not quiz:
                    raise HTTPException(status_code=404, detail="Quiz not found")
                total = len(quiz.questions)
                if total < 2:
                    raise HTTPException(status_code=422, detail="Quiz is too small to split.")
                if data.chunk_size >= total:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Chunk size ({data.chunk_size}) must be smaller than "
                        f"total questions ({total}).",
                    )
                n_parts = math.ceil(total / data.chunk_size)
                folder = Folder(title=(data.folder_title or quiz.title).strip())
                session.add(folder)
                await session.flush()
                base_title = quiz.title
                chunks: list[Quiz] = []
                for i in range(n_parts):
                    start = i * data.chunk_size
                    end = min(start + data.chunk_size, total)
                    chunk = Quiz(
                        title=chunk_title(base_title, i + 1, n_parts, start + 1, end),
                        raw_text="",
                        questions=quiz.questions[start:end],
                        folder_id=folder.id,
                        position=i + 1,
                    )
                    session.add(chunk)
                    chunks.append(chunk)
                await session.delete(quiz)
            await session.refresh(folder)
            # reload chunks ordered
            rows = (
                await session.scalars(
                    select(Quiz)
                    .options(selectinload(Quiz.folder))
                    .where(Quiz.folder_id == folder.id)
                    .order_by(Quiz.position)
                )
            ).all()
            return FolderOut(
                id=str(folder.id),
                title=folder.title,
                created_at=folder.created_at,
                quizzes=[quiz_repo._to_out(q) for q in rows],
            )


quiz_service = QuizService()
