# Story 5.1: Backend — Vet Registration API

Status: done

## Story

As a veterinarian,
I want to register as a GenePaw partner,
so that I can receive referral benefits and access clinical reports for my clients.

## Acceptance Criteria

- **AC1:** `POST /api/v1/vets/register` accepts `{"name", "email", "password", "clinic_name", "registration_number", "city", "state", "phone"}`. Creates a `User` row with `role = 'vet'` and a linked `vet_profiles` row with the clinic and registration details.
- **AC2:** The `vet_profiles` table has columns: `id` (UUID PK), `user_id` (UUID FK → users), `clinic_name`, `registration_number`, `city`, `state`, `phone`, `is_verified` (boolean, default `false`), `created_at`. Additionally stores the vet's personal `name`.
- **AC3:** Returns `201` with `{"id": <user.id>, "email": <user.email>}`. Returns `409` if the email is already registered.
- **AC4:** A new Alembic migration creates the `vet_profiles` table.
- **AC5:** `GET /api/v1/vets/me` (requires `vet` role JWT) returns the authenticated vet's profile including `is_verified` status.
- **AC6:** At least one pytest test: successful vet registration returns 201 with correct fields.

## Tasks / Subtasks

- [x] Task 1: Create `VetProfile` ORM model (AC: 2, 4)
  - [x] 1a. Create `app/models/vet_profile.py` with the `VetProfile` SQLAlchemy model
  - [x] 1b. Add `VetProfile` import to `app/models/__init__.py` so Alembic's `env.py` detects it (Alembic imports `app.models` as a side-effect — this is where all models must be registered)
- [x] Task 2: Create Alembic migration for `vet_profiles` table (AC: 4)
  - [x] 2a. Generate migration file in `alembic/versions/` — create table `vet_profiles` with all required columns including `name`
- [x] Task 3: Create Pydantic schemas `app/schemas/vet.py` (AC: 1, 3, 5)
  - [x] 3a. `VetRegisterRequest`: fields `name`, `email` (EmailStr), `password`, `clinic_name`, `registration_number`, `city`, `state`, `phone` — all required
  - [x] 3b. `VetRegisterResponse`: fields `id` (UUID), `email` (str) — `model_config = {"from_attributes": True}`
  - [x] 3c. `VetProfileResponse`: fields `id` (UUID), `user_id` (UUID), `name`, `clinic_name`, `registration_number`, `city`, `state`, `phone`, `is_verified` (bool), `created_at` — `model_config = {"from_attributes": True}`
- [x] Task 4: Create `app/api/v1/vets.py` router with both endpoints (AC: 1, 3, 5)
  - [x] 4a. `POST /register` — public endpoint (no auth dependency):
    - Query users by email; if found → raise `HTTPException(status_code=409, detail="Email already registered")`
    - Hash password via `hash_password(body.password)` from `app.services.auth`
    - Create and `db.add()` a `User(email=body.email, password_hash=..., role=UserRole.vet)`
    - `await db.flush()` to obtain `user.id` before inserting VetProfile
    - Create and `db.add()` a `VetProfile(user_id=user.id, name=body.name, clinic_name=..., registration_number=..., city=..., state=..., phone=...)`
    - `await db.commit()`, `await db.refresh(user)`
    - Return `VetRegisterResponse` with status 201
  - [x] 4b. `GET /me` — requires vet role JWT via `Depends(require_role("vet"))`:
    - Query `VetProfile` where `user_id == current_user.id`
    - If not found → raise `HTTPException(status_code=404, detail="Vet profile not found")`
    - Return `VetProfileResponse`
- [x] Task 5: Register the vets router in `app/api/v1/router.py` (AC: 1, 5)
  - [x] 5a. Import `vets` module and add: `api_router.include_router(vets.router, prefix="/vets", tags=["vets"])`
- [x] Task 6: Write tests in `app/api/v1/vets_test.py` (AC: 6)
  - [x] 6a. Test: `POST /api/v1/vets/register` with valid payload returns 201 and `{"id": ..., "email": ...}` — use `dependency_overrides` pattern (no live DB)
  - [x] 6b. Test: duplicate email returns 409
  - [x] 6c. Test: `GET /api/v1/vets/me` with valid vet JWT returns 200 with profile including `is_verified: false`

### Review Findings

- [x] [Review][Patch] TOCTOU race: wrap `await db.commit()` in try/except IntegrityError + rollback, re-raise as 409 — same pattern as auth.py:45-52 [app/api/v1/vets.py:43]
- [x] [Review][Patch] Migration created_at server_default uses `sa.func.now()` (Python function object) — must be `sa.text("now()")` for raw SQL [alembic/versions/e3f7c1a9d524_add_vet_profiles.py:38]
- [x] [Review][Patch] ORM `unique=True` inline on user_id conflicts with named UniqueConstraint in migration — causes Alembic drift; remove `unique=True` from ORM column [app/models/vet_profile.py:11]
- [x] [Review][Dismiss] Test overrides `get_current_user` directly — FastAPI dependency_overrides propagates through require_role's inner closure; role guard IS exercised (false positive)
- [x] [Review][Patch] Missing negative auth test: customer/staff role accessing GET /me should receive 403 [app/api/v1/vets_test.py]
- [x] [Review][Defer] Email case-sensitivity allows registration bypass (VET@clinic.com ≠ vet@clinic.com) — also absent in auth.py; requires cross-cutting fix [app/api/v1/vets.py:21] — deferred, pre-existing
- [x] [Review][Defer] No password minimum length validation — also absent in auth.py RegisterRequest; cross-cutting fix needed [app/schemas/vet.py:12] — deferred, pre-existing
- [x] [Review][Defer] Empty/whitespace strings accepted for all string fields — no spec requirement for field-level validation [app/schemas/vet.py] — deferred, pre-existing
- [x] [Review][Defer] registration_number has no uniqueness constraint — spec explicitly treats it as free-text [app/models/vet_profile.py] — deferred, pre-existing
- [x] [Review][Defer] No rate limiting on registration endpoint — cross-cutting infrastructure concern [app/api/v1/vets.py] — deferred, pre-existing
- [x] [Review][Defer] Flush mock fragile: `obj.id is None` guard breaks if User ever gets a Python-side UUID default [app/api/v1/vets_test.py] — deferred, pre-existing

## Dev Notes

### Files to Create / Modify

| File | Action | Notes |
|------|---------|-------|
| `app/models/vet_profile.py` | CREATE | New `VetProfile` SQLAlchemy model |
| `app/models/__init__.py` | MODIFY | Add `VetProfile` import so Alembic's `env.py` detects it |
| `alembic/versions/<hash>_add_vet_profiles.py` | CREATE | Migration — create `vet_profiles` table |
| `app/schemas/vet.py` | CREATE | `VetRegisterRequest`, `VetRegisterResponse`, `VetProfileResponse` |
| `app/api/v1/vets.py` | CREATE | Router with `POST /register` and `GET /me` |
| `app/api/v1/router.py` | MODIFY | Add `include_router(vets.router, prefix="/vets", tags=["vets"])` |
| `app/api/v1/vets_test.py` | CREATE | Pytest tests for both endpoints |

**Do NOT modify:** `app/api/v1/auth.py`, `app/models/user.py`, `app/schemas/auth.py`, `app/services/auth.py`, `alembic/env.py`, or any other existing file beyond the three listed above (`app/models/__init__.py`, `app/api/v1/router.py`, and the new files).

---

### User Model — What Already Exists

```python
# app/models/user.py
class UserRole(str, enum.Enum):
    customer = "customer"
    staff = "staff"
    vet = "vet"          # ← already exists; do NOT add it

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    email = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.customer)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
```

The `vet` role is already defined. Do NOT modify the User model or add columns to it. The vet's personal name and clinic details live in `vet_profiles`.

---

### VetProfile Model to Create

```python
# app/models/vet_profile.py
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func, text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class VetProfile(Base):
    __tablename__ = "vet_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    name = Column(String, nullable=False)
    clinic_name = Column(String, nullable=False)
    registration_number = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    is_verified = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
```

---

### Registration Endpoint — Critical Implementation Detail

The key challenge is creating two related rows atomically. Use `db.flush()` between creating User and VetProfile to get the auto-generated `user.id` before committing:

```python
@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=VetRegisterResponse)
async def register_vet(
    body: VetRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> User:
    # 1. Check for duplicate email
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # 2. Create user with vet role
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role=UserRole.vet,
    )
    db.add(user)
    await db.flush()  # assigns user.id without committing transaction

    # 3. Create linked vet profile
    profile = VetProfile(
        user_id=user.id,
        name=body.name,
        clinic_name=body.clinic_name,
        registration_number=body.registration_number,
        city=body.city,
        state=body.state,
        phone=body.phone,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    return user
```

---

### GET /me Endpoint

```python
@router.get("/me", response_model=VetProfileResponse)
async def get_vet_profile(
    current_user: User = Depends(require_role("vet")),
    db: AsyncSession = Depends(get_db),
) -> VetProfile:
    result = await db.execute(select(VetProfile).where(VetProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vet profile not found")
    return profile
```

---

### Alembic Migration Pattern

Previous migrations: `816697485877`, `c45604ac50c0`, `3f8a2e9b4c71`, `d7e8f9a0b1c2`. Your new migration `down_revision` must point to `d7e8f9a0b1c2` (the latest).

```python
# alembic/versions/<hash>_add_vet_profiles.py
revision = "<new_hash>"
down_revision = "d7e8f9a0b1c2"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "vet_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("clinic_name", sa.String(), nullable=False),
        sa.Column("registration_number", sa.String(), nullable=False),
        sa.Column("city", sa.String(), nullable=False),
        sa.Column("state", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_vet_profiles_user_id"),
    )
    op.create_index("ix_vet_profiles_user_id", "vet_profiles", ["user_id"])

def downgrade() -> None:
    op.drop_index("ix_vet_profiles_user_id", table_name="vet_profiles")
    op.drop_table("vet_profiles")
```

For the migration revision hash: generate one yourself using 12 random hex characters (e.g., `a1b2c3d4e5f6`). Do not use `alembic revision` interactively — write the file directly.

---

### Test Pattern (from `auth_test.py`)

All tests use `dependency_overrides` — no live database required:

```python
# app/api/v1/vets_test.py
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock
import pytest
from fastapi.testclient import TestClient
from app.models.user import User, UserRole
from app.models.vet_profile import VetProfile
from app.services.auth import hash_password, create_access_token
from app.core.dependencies import get_db, get_current_user
from main import app


def _make_user(role: str = "vet") -> User:
    u = User(email="vet@clinic.com", password_hash=hash_password("secret123"), role=UserRole(role))
    u.id = uuid.uuid4()
    u.created_at = datetime.now(timezone.utc)
    return u


def _make_profile(user_id) -> VetProfile:
    p = VetProfile(
        user_id=user_id,
        name="Dr. Priya Sharma",
        clinic_name="Sharma Pet Clinic",
        registration_number="VCI-2023-001",
        city="Mumbai",
        state="Maharashtra",
        phone="9876543210",
    )
    p.id = uuid.uuid4()
    p.is_verified = False
    p.created_at = datetime.now(timezone.utc)
    return p


def test_register_vet_success():
    """POST /vets/register with valid payload returns 201 and {id, email}."""
    new_user = _make_user()

    async def _get_db():
        session = AsyncMock()
        calls = []

        async def _execute(stmt):
            result = MagicMock()
            if len(calls) == 0:
                # First call: email uniqueness check — not found
                result.scalar_one_or_none.return_value = None
            calls.append(1)
            return result

        session.execute = _execute
        session.add = MagicMock()
        session.flush = AsyncMock(side_effect=lambda: setattr(new_user, "id", new_user.id))
        session.commit = AsyncMock()
        session.refresh = AsyncMock(side_effect=lambda obj: None)
        yield session

    payload = {
        "name": "Dr. Priya Sharma",
        "email": "vet@clinic.com",
        "password": "secret123",
        "clinic_name": "Sharma Pet Clinic",
        "registration_number": "VCI-2023-001",
        "city": "Mumbai",
        "state": "Maharashtra",
        "phone": "9876543210",
    }
    app.dependency_overrides[get_db] = _get_db
    try:
        client = TestClient(app)
        resp = client.post("/api/v1/vets/register", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert "id" in data
        assert data["email"] == "vet@clinic.com"
    finally:
        app.dependency_overrides.pop(get_db, None)
```

The test for duplicate email (409) and `GET /me` follow the same pattern — mock the session's `execute` to return an existing user for the 409 case, and return a VetProfile for the `/me` case.

---

### Router Import Pattern (existing `router.py`)

```python
# Current router.py
from app.api.v1 import auth, orders, species, webhooks

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(species.router, prefix="/species", tags=["species"])
api_router.include_router(webhooks.router, prefix="/webhook", tags=["webhook"])
```

Add `vets` to the import and add one `include_router` line — do not touch any other line.

---

### Critical Anti-Patterns — Do NOT Do These

- **Do NOT modify `auth.py`** — vet registration goes in its own `/vets` router, not in the auth router. The `RegisterRequest` validator in `auth.py` explicitly rejects non-customer roles.
- **Do NOT add `name` column to the `users` table** — the User model has no name field and should not get one. The vet's name lives in `vet_profiles`.
- **Do NOT use `db.commit()` before `db.flush()`** — you need `flush()` first to get `user.id` for the FK link, then `commit()` after both rows are added.
- **Do NOT use synchronous SQLAlchemy patterns** — all DB calls must be `await db.execute(...)`, `await db.commit()`, `await db.flush()`, `await db.refresh(...)`.
- **Do NOT inline auth logic** — use `Depends(require_role("vet"))` for the `GET /me` endpoint.
- **Do NOT hardcode `is_verified = True`** — new vets are always unverified; staff manually sets this in a future story.
- **Do NOT add phone format validation** in the schema — `registration_number` is free-text per the spec; phone is stored as-is (frontend handles format validation in Story 5.2).

---

### What Already Exists — Reuse, Don't Recreate

| Artifact | Location | Notes |
|----------|----------|-------|
| `UserRole.vet` | `app/models/user.py` | Already in enum — do NOT add it again |
| `hash_password()` | `app/services/auth.py` | Import from here for password hashing |
| `require_role()` | `app/core/dependencies.py` | Use `Depends(require_role("vet"))` for auth |
| Model registration | `app/models/__init__.py` | All models imported here; `alembic/env.py` does `import app.models` as side-effect |
| `get_db` | `app/db/session.py` | AsyncSession dependency |
| `get_current_user` | `app/core/dependencies.py` | Used inside `require_role()` |
| RFC 7807 error handler | `app/core/exceptions.py` | Registered globally — `HTTPException` raises are auto-formatted |
| UUID PK pattern | `app/models/user.py` | `UUID(as_uuid=True), server_default=text("gen_random_uuid()")` |

---

### Story 5 Forward Compatibility

Story 5.2 wires the frontend registration form to `POST /api/v1/vets/register`. Story 5.4 uses `generateClinicalPDF(resultData, orderId)` which lives in `reportPdf.js` alongside the existing `generateConsumerPDF`. Story 5.1 creates no frontend changes.

The `is_verified` field is set manually by staff in a future admin flow (Epic 6). For now, all new vet registrations have `is_verified = false` and this is simply returned in `GET /me`.

---

### Project Structure (Backend)

```
genepaw-api/
├── app/
│   ├── api/v1/
│   │   ├── auth.py          — EXISTING, do not modify
│   │   ├── orders.py        — EXISTING, do not modify
│   │   ├── router.py        — MODIFY: add vets router
│   │   ├── vets.py          — CREATE: vet endpoints
│   │   └── vets_test.py     — CREATE: pytest tests
│   ├── models/
│   │   ├── __init__.py      — MODIFY: add VetProfile import
│   │   ├── user.py          — EXISTING, do not modify
│   │   └── vet_profile.py   — CREATE: VetProfile model
│   ├── schemas/
│   │   ├── auth.py          — EXISTING, do not modify
│   │   └── vet.py           — CREATE: vet schemas
│   └── db/
│       └── base.py          — MODIFY: import VetProfile
├── alembic/versions/
│   └── <hash>_add_vet_profiles.py   — CREATE: migration
```

---

### Python / FastAPI Project Rules

- Python 3.13 — bcrypt directly (no passlib CryptContext; this was a confirmed incompatibility from Story 1.3)
- All async: `async def` handlers, `await db.execute()`, `AsyncSession`
- No TypeScript — backend is pure Python
- Test files: co-located with source, `_test.py` suffix (e.g., `vets_test.py` next to `vets.py`)
- No `pytest-asyncio` for these tests — they use `TestClient` (synchronous wrapper around the async app), matching the existing `auth_test.py` pattern

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Full test suite: 114 passed, 0 failed — `python -m pytest -v` (genepaw-api venv)
- Test fix: mock `flush()` needed to simulate DB UUID assignment for `user.id` (regression in `test_register_vet_success` — fixed by capturing added objects and patching id in `_flush`)

### Completion Notes List

- Created `VetProfile` SQLAlchemy model with UUID PK, `user_id` FK (CASCADE), `name`, clinic fields, `is_verified` (default false), `created_at`.
- Registered `VetProfile` in `app/models/__init__.py` — Alembic detects it via `import app.models` side-effect in `env.py`.
- Alembic migration `e3f7c1a9d524` creates `vet_profiles` table, `down_revision = "d7e8f9a0b1c2"`, with unique constraint on `user_id` and index `ix_vet_profiles_user_id`.
- Created `app/schemas/vet.py`: `VetRegisterRequest`, `VetRegisterResponse` (id + email), `VetProfileResponse` (full profile including `is_verified`).
- `POST /api/v1/vets/register`: public endpoint; email uniqueness check → 409; creates User with `role=vet` + VetProfile atomically using `db.flush()` for FK link; returns 201 `{id, email}`.
- `GET /api/v1/vets/me`: requires `vet` role JWT via `Depends(require_role("vet"))`; returns full `VetProfileResponse` or 404 if profile missing.
- Registered vets router at `/api/v1/vets` in `router.py`.
- 3 tests in `vets_test.py`: successful registration (201), duplicate email (409), GET /me with is_verified=false (200). All pass.
- No other files modified.

### File List

- `genepaw-api/app/models/vet_profile.py` — created: VetProfile ORM model
- `genepaw-api/app/models/__init__.py` — modified: added VetProfile import and export
- `genepaw-api/alembic/versions/e3f7c1a9d524_add_vet_profiles.py` — created: migration
- `genepaw-api/app/schemas/vet.py` — created: vet Pydantic schemas
- `genepaw-api/app/api/v1/vets.py` — created: vet router with register + me endpoints
- `genepaw-api/app/api/v1/router.py` — modified: added vets router registration
- `genepaw-api/app/api/v1/vets_test.py` — created: 3 pytest tests

### Change Log

- 2026-05-21: Implemented vet registration API (Story 5.1) — POST /vets/register + GET /vets/me with VetProfile model, migration, schemas, and 3 tests
