# Quiz Maker API

FastAPI backend for the Quiziz React SPA.

## Architecture

```text
api controller -> service -> repository -> PostgreSQL
```

AI normalization lives in `app/services/ai_service.py` with Groq/Gemini providers under `app/services/ai_providers/`.

## Setup

```bash
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

`alembic upgrade head` includes `0003_seed_initial_records`, which inserts 100 demo quizzes across five folders. The migration runs once per database, so deleted demo records are not re-added on every restart.

## Endpoints

```text
GET    /health
GET    /api/quizzes?q=&folder=&sort=&page=&page_size=
GET    /api/quizzes/{quiz_id}
POST   /api/quizzes/parse
DELETE /api/quizzes/{quiz_id}
POST   /api/quizzes/{quiz_id}/split
GET    /api/folders
DELETE /api/folders/{folder_id}
```

## Environment

See `.env.example`. Important values:

- `DATABASE_URL`
- `CORS_ORIGINS` — comma-separated allowed origins
- `AI_PROVIDER` — `groq` or `gemini`
- `GROQ_API_KEY` / `GEMINI_API_KEY`

Do not commit `.env`.

## Railway deployment

Deploy this directory as a Railway service with **Root Directory** set to
`/backend`. Railway uses `Dockerfile`, which installs dependencies from
`uv.lock` and binds uvicorn to `$PORT`.

Service settings:

- Healthcheck Path: `/health`
- Pre-deploy Command: `alembic upgrade head`
- Watch Paths: `/backend/**`
- Wait for CI: enabled

Variables:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGINS=https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
AI_PROVIDER=groq
GROQ_API_KEY=<secret>
GROQ_MODEL=openai/gpt-oss-120b
GEMINI_API_KEY=<secret>
GEMINI_MODEL=gemini-3.8-flash
AI_CHUNK_SIZE=15
```

Migrations run before the new container receives traffic. If a migration fails,
Railway keeps the previous deployment running.
