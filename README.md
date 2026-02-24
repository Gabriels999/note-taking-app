# Note Taking App

Full-stack note taking application:
- Backend: Django (REST-style endpoints in `backend/`)
- Frontend: Next.js + React (in `frontend/`)

## Project Structure
- `backend/`: Django app, API endpoints, tests, Python tooling.
- `frontend/`: Next.js app (App Router, TypeScript).
- `AI_USAGE_LOG.md`: final AI usage report (generated from a chronological usage diary maintained during development).

## AI Usage
- AI was used as a development assistant for implementation speed, code review support, debugging, refactoring suggestions, and test/CI setup.
- Final architecture and product decisions were made by me, with AI suggestions reviewed before acceptance.
- Detailed usage report: `AI_USAGE_LOG.md`.

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
cp .env.example .env
nvm use v24.11.0
npm install
npm run dev
```

## API Endpoints
- Health:
  - `GET /api/health/`
- Auth:
  - `GET /api/auth/csrf/`
  - `POST /api/auth/login/`
  - `POST /api/auth/signup/`
- Categories:
  - `GET /api/categories/`
- Notes:
  - `GET /api/notes/`
  - `POST /api/notes/`
  - `GET /api/notes/{note_id}/`
  - `PATCH /api/notes/{note_id}/`

## Frontend Baseline
- Home page: `/`
- Login page: `/login`
- Signup page: `/signup`
- Notes home page: `/home`
- Note editor page: `/notes/[noteId]`

## Docker (Optimized Builds)
Prerequisites:
- Docker + Docker Compose

Run:
```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Apps:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
