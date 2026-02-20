# Note Taking App

Full-stack note taking application:
- Backend: Django (REST-style endpoints in `backend/`)
- Frontend: Next.js + React (in `frontend/`)

## Project Structure
- `backend/`: Django app, API endpoints, tests, Python tooling.
- `frontend/`: Next.js app (App Router, TypeScript).
- `AI_USAGE_LOG.md`: bullet-point log of how AI is used during development.

## Backend (Django)
Prerequisites:
- Python 3.11+
- `uv` installed

Setup and run:
```bash
cd backend
uv sync
cp .env.example .env
uv run python manage.py migrate
uv run python manage.py runserver
```

Run tests:
```bash
cd backend
uv run pytest
```

## Frontend (Next.js)
Prerequisites:
- Node.js 20+
- npm

Setup and run:
```bash
cd frontend
npm install
npm run dev
```

## API Baseline
- Health check endpoint: `GET /api/health/`
