from fastapi import APIRouter, Query

from app.schemas.folder import FolderOut
from app.schemas.quiz import QuizCreate, QuizOut, QuizPage, SplitRequest
from app.services.quiz_service import quiz_service

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])


@router.post("/parse", response_model=QuizOut)
async def parse_quiz(data: QuizCreate) -> QuizOut:
    return await quiz_service.parse_and_save(data)


@router.get("", response_model=QuizPage)
async def list_quizzes(
    q: str = "",
    folder: str = "all",
    sort: str = "newest",
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
) -> QuizPage:
    return await quiz_service.list_page(
        q=q,
        folder=folder,
        sort=sort,
        page=page,
        page_size=page_size,
    )


@router.get("/{quiz_id}", response_model=QuizOut)
async def get_quiz(quiz_id: str) -> QuizOut:
    return await quiz_service.get(quiz_id)


@router.delete("/{quiz_id}", status_code=204)
async def delete_quiz(quiz_id: str) -> None:
    await quiz_service.delete(quiz_id)


@router.post("/{quiz_id}/split", response_model=FolderOut)
async def split_quiz(quiz_id: str, data: SplitRequest) -> FolderOut:
    return await quiz_service.split(quiz_id, data)
