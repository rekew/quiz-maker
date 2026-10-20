import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.folder_controller import router as folder_router
from app.api.quiz_controller import router as quiz_router
from app.core.config import settings

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Quiz Maker API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.cors_origins.split(",")
        if origin.strip()
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(quiz_router)
app.include_router(folder_router)


@app.get("/health")
def health() -> dict:
    return {"ok": True}
