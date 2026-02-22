# Backend (Django)

## Requirements
- Python 3.11+
- `uv`

## Setup
```bash
uv sync
cp .env.example .env
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py runserver
```

## Testing
```bash
uv run pytest
```

## API Endpoints
- `GET /api/health/`
- `GET /api/auth/csrf/`
- `POST /api/auth/login/`

## Docker
```bash
cp .env.example .env
docker build -t note-backend .
docker run --rm -p 8000:8000 --env-file .env note-backend
```
