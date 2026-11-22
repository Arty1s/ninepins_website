FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    BACKEND_HOST=0.0.0.0 \
    BACKEND_PORT=8000

WORKDIR /app

# Install dependencies first for better layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Backend code. Build context is ./backend, e.g.:
#   docker build -t kkhc-api ./backend
COPY app ./backend/app

# Writable fallback store when Supabase is not configured (KKHC_DATA_DIR=.data).
RUN mkdir -p /app/.data && useradd -m -u 10001 appuser && chown -R appuser:appuser /app
VOLUME ["/app/.data"]
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import os,urllib.request;urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('BACKEND_PORT','8000')+'/health',timeout=8)"

CMD ["sh", "-c", "uvicorn backend.app.main:app --host ${BACKEND_HOST:-0.0.0.0} --port ${BACKEND_PORT:-8000}"]
