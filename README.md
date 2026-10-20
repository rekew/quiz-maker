# Quiziz — Quiz Maker

A React single-page quiz application backed by a FastAPI API and PostgreSQL.

Users can paste free-form questions, let an AI provider normalize them into a quiz, browse a searchable/paginated library, and play quizzes with shuffled questions and answers.

## Stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Zustand, Lucide, Tailwind CSS, shadcn/ui
- **Backend:** FastAPI, SQLAlchemy async, Alembic, PostgreSQL, Pydantic
- **AI parsing:** Groq or Gemini (configurable)

## Project structure

```text
backend/
  app/api/            FastAPI controllers
  app/services/       business logic + AI providers
  app/repositories/   database access
  app/models/         SQLAlchemy models
  alembic/versions/   schema + demo-data migrations
frontend/
  src/app/            router
  src/features/       library, create, play
  src/shared/         API client, reusable UI components, utilities
```

## Local setup

### 1. Database and backend

```bash
docker compose up -d db
cd backend
cp .env.example .env   # add an AI provider key
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

`alembic upgrade head` also runs the demo-data migration, which seeds **100 quizzes** across five folders.

Backend runs at `http://localhost:8000`. Health check: `GET /health`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

Frontend runs at `http://localhost:5173`.

## Environment variables

Backend (`backend/.env`):

```text
DATABASE_URL=postgresql://quiz:quiz@localhost:5432/quizdb
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
AI_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
AI_CHUNK_SIZE=15
CORS_ORIGINS=http://localhost:5173
```

Frontend (`frontend/.env`):

```text
VITE_API_BASE_URL=http://localhost:8000
```

Local `.env` files are ignored. Never commit real API keys.

## API

```text
GET    /api/quizzes?q=&folder=&sort=&page=&page_size=
GET    /api/quizzes/{id}
POST   /api/quizzes/parse
DELETE /api/quizzes/{id}
POST   /api/quizzes/{id}/split
GET    /api/folders
DELETE /api/folders/{id}
```

Library query options:

- `q`: case-insensitive title search
- `folder`: `all`, `unfiled`, or a folder UUID
- `sort`: `newest`, `oldest`, `title_asc`, `title_desc`, `questions_desc`
- `page`: 1-based page number
- `page_size`: 1–50

## Verification

```bash
cd frontend && pnpm lint && pnpm build
```

Manual checks:

- Library shows the seeded 100 quizzes with pagination.
- Search, folder filter, and all sort options work together.
- Loading, error, empty-library, and no-results states are distinct.
- Quiz detail/start screen appears before gameplay.
- Single- and multi-answer questions work, including reshuffle and score.
- Navigating between quiz IDs resets gameplay state.

## Deployment

Deployment is not configured yet. When deploying:

1. Deploy PostgreSQL.
2. Deploy the backend Docker image with `DATABASE_URL`, `CORS_ORIGINS`, and AI keys.
3. Run `alembic upgrade head` so the seed migration runs.
4. Deploy the frontend with `VITE_API_BASE_URL` set to the public API.
5. Add a SPA rewrite/fallback for React Router.
6. Add the public link to this README.
