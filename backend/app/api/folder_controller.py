from fastapi import APIRouter, HTTPException

from app.repositories.folder_repo import folder_repo
from app.schemas.folder import FolderOut

router = APIRouter(prefix="/api/folders", tags=["folders"])


@router.get("", response_model=list[FolderOut])
async def list_folders() -> list[FolderOut]:
    return await folder_repo.list()


@router.delete("/{folder_id}", status_code=204)
async def delete_folder(folder_id: str) -> None:
    if not await folder_repo.delete(folder_id):
        raise HTTPException(status_code=404, detail="Folder not found")
