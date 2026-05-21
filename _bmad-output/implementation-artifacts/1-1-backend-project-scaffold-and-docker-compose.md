# Story 1.1: Backend Project Scaffold & Docker Compose

Status: done

## Story

As a developer,
I want a working FastAPI backend and Docker Compose local environment,
so that I can develop and test the API locally without any cloud dependency.

## Acceptance Criteria

1. Running `uvx fastapi-new genepaw-api` creates the `genepaw-api/` directory as a sibling to the existing frontend directory.
2. Running `uv add sqlalchemy alembic asyncpg psycopg2-binary pydantic-settings python-jose passlib` completes without errors and all packages appear in `pyproject.toml`.
3. `docker-compose.yml` in `genepaw-api/` defines two services: `api` (port 8000) and `db` (PostgreSQL, port 5432). The `db` service uses `postgres:16` image with `POSTGRES_DB=genepaw`, `POSTGRES_USER=genepaw`, `POSTGRES_PASSWORD=genepaw_dev`.
4. `docker compose up` starts both services; `curl http://localhost:8000/health` returns `{"status": "ok"}`.
5. The React Vite dev server (`npm run dev`, port 3000) runs outside Docker and is unaffected by this story.
6. `genepaw-api/app/core/config.py` uses `pydantic-settings` `BaseSettings` to load `DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_ALGORITHM` (default `HS256`), `ACCESS_TOKEN_EXPIRE_MINUTES` (default `1440`), `REFRESH_TOKEN_EXPIRE_DAYS` (default `30`), `LAB_WEBHOOK_SECRET`, and `ALLOWED_ORIGINS` from environment variables or a `.env` file.
7. `genepaw-api/.env.example` documents all required environment variables with placeholder values. The actual `.env` file is git-ignored.
8. `genepaw-api/app/core/exceptions.py` defines a global FastAPI exception handler that returns RFC 7807 Problem Details format: `{"type": "...", "title": "...", "status": <int>, "detail": "..."}` for all `HTTPException` and unhandled `Exception`.
9. `genepaw-api/app/core/logging.py` configures Python's `logging` to emit structured JSON to stdout (one JSON object per log line with `level`, `message`, `timestamp` fields at minimum).
10. All API routes are registered under the `/api/v1/` URL prefix.

## Tasks / Subtasks

- [x] Task 1: Verify scaffold and dependencies (AC: 1, 2)
  - [x] Confirm `genepaw-api/` exists as sibling to `GenePaw/`
  - [x] Confirm all packages present in `pyproject.toml`
- [x] Task 2: Verify Docker Compose config (AC: 3)
  - [x] Confirm `api` service on port 8000 and `db` (postgres:16) on port 5432
  - [x] Confirm `genepaw_db_data` named volume present
- [x] Task 3: Test and verify `app/core/config.py` (AC: 6)
  - [x] Write tests for all settings fields and defaults
  - [x] Write test for `allowed_origins` property parsing
- [x] Task 4: Test and verify `app/core/exceptions.py` (AC: 8)
  - [x] Write test: HTTPException returns RFC 7807 shape
  - [x] Write test: unhandled Exception returns RFC 7807 shape with status 500
- [x] Task 5: Test and verify `app/core/logging_config.py` (AC: 9)
  - [x] Write test: log output is valid JSON with `level`, `message`, `timestamp`
- [x] Task 6: Test health endpoint and `/api/v1/` prefix (AC: 4, 10)
  - [x] Write test: GET /health returns `{"status": "ok"}`
  - [x] Write test: router is mounted at `/api/v1/`
- [x] Task 7: Verify `.env.example` and `.gitignore` (AC: 7)
  - [x] Confirm all env vars documented in `.env.example`
  - [x] Confirm `.env` is in `.gitignore`

## Dev Notes

- `genepaw-api/` was created with `uvx fastapi-new genepaw-api` and already contains the complete scaffold.
- Logging module is named `logging_config.py` (not `logging.py`) to avoid shadowing Python's stdlib `logging` module.
- Test files are co-located alongside source: `config_test.py` next to `config.py`, per architecture.md.
- Use `fastapi.testclient.TestClient` (synchronous) for route tests — no pytest-asyncio needed for these tests.
- `pytest` + `httpx` added as dev dependencies via `uv add --dev`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/project-context.md#Testing Rules]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Scaffold pre-existed: all 10 ACs verified against existing code and config files.
- 19 tests written and passing: 8 config, 4 exceptions, 4 logging, 3 health/routing.
- `logging_config.py` (not `logging.py`) — chosen name avoids shadowing Python stdlib; import updated accordingly.
- Dev deps added: pytest 9.0.3, httpx 0.28.1, pytest-asyncio 1.3.0 via `uv add --dev`.

### File List

- genepaw-api/pyproject.toml (modified — added dev deps: pytest, httpx, pytest-asyncio)
- genepaw-api/app/core/config_test.py (created)
- genepaw-api/app/core/exceptions_test.py (created)
- genepaw-api/app/core/logging_config_test.py (created)
- genepaw-api/main_test.py (created)

### Review Findings

- [x] [Review][Decision] Python version: kept Python 3.13; replaced `passlib[bcrypt]` with `bcrypt>=4.0.0` in `pyproject.toml`. Story 1.3 AC1 updated to reflect bcrypt-direct usage. `Dockerfile` unchanged (python:3.13-slim stays). — resolved 2026-05-19
- [x] [Review][Patch] `pytest-asyncio>=1.3.0` → changed to `>=0.24.0`. [`pyproject.toml`] — resolved 2026-05-19
- [x] [Review][Patch] `test_api_v1_prefix_exists` — assertion now checks `resp.status_code == 404` and `resp.json().get("status") == 404` (RFC 7807 body confirms FastAPI routed the request). [`main_test.py`] — resolved 2026-05-19
- [x] [Review][Patch] Unhandled exception handler — added `_logger.exception("Unhandled exception: %s", exc)` before the JSONResponse return. [`app/core/exceptions.py`] — resolved 2026-05-19
- [x] [Review][Patch] `JSONFormatter` timestamps — changed to `datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat()`. [`app/core/logging_config.py`] — resolved 2026-05-19
- [x] [Review][Defer] Hard-coded `JWT_SECRET_KEY` / `LAB_WEBHOOK_SECRET` defaults — silently accepted if env var is unset. Future security hardening: add startup validation (e.g. raise if value matches the known dev default). [`app/core/config.py:7,9`] — deferred, pre-existing
- [x] [Review][Defer] CORS wildcard `allow_methods=["*"]` + `allow_headers=["*"]` with credentials — overly permissive. Enumerate explicit methods/headers in a future security hardening story. [`main.py:16`] — deferred, pre-existing
- [x] [Review][Defer] Shared `_401 = HTTPException(...)` singleton in `dependencies.py` — FastAPI may mutate exception objects for WWW-Authenticate headers; concurrent requests sharing one instance is not safe. Fix in Story 1.3 when dependencies.py is completed. [`app/core/dependencies.py:14`] — deferred, pre-existing
- [x] [Review][Defer] RFC 7807 `type` URL uses `httpstatuses.com` instead of `genepaw.in/errors/...` (architecture pattern) — AC8 does not mandate the URL scheme. Revisit in a future API standards story. [`app/core/exceptions.py:5`] — deferred, pre-existing
- [x] [Review][Defer] `exc.detail is None` yields `"detail": null` in RFC 7807 response — clients expecting a string may throw. Address in Story 1.3 when auth error paths are defined. [`app/core/exceptions.py:9`] — deferred, pre-existing
- [x] [Review][Defer] PostgreSQL port 5432 exposed to host in docker-compose — acceptable dev convenience; remove before any shared/staging environment. [`docker-compose.yml:21`] — deferred, pre-existing
- [x] [Review][Defer] Dockerfile runs as root, no non-root user — future infra hardening story. [`Dockerfile`] — deferred, pre-existing
- [x] [Review][Defer] `JWT_ALGORITHM` accepts any string — `"none"` bypass risk. Add `Literal["HS256"]` type or allowlist validation in Story 1.3 when JWT encoding is implemented. [`app/core/config.py:6`] — deferred, pre-existing

### Change Log

- 2026-05-18: Story 1.1 implemented — scaffold verified, tests written for config, exceptions, logging, health endpoint.
- 2026-05-19: Code review complete — 1 decision needed, 4 patches, 8 deferred.
- 2026-05-19: All review items resolved — Python 3.13 kept with bcrypt direct; pytest-asyncio version fixed; prefix test assertion hardened; exception logging added; timestamp fix applied. Story marked done.
