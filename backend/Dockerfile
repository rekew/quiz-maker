FROM python:3.14-slim
WORKDIR /code
RUN pip install uv
COPY pyproject.toml README.md alembic.ini ./
COPY app ./app
COPY alembic ./alembic
RUN uv pip install --system -r pyproject.toml 2>/dev/null || uv pip install --system fastapi uvicorn pydantic "psycopg[binary]" python-dotenv google-genai sqlalchemy alembic asyncpg openai
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
