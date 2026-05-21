# Story 3.2 — Backend: Consent Record Storage

## Story

**As a** platform operator,
**I want** every order to have a linked consent record in the database,
**so that** GenePaw complies with India's DPDP Act 2023 and can demonstrate informed consent was collected.

## Status

done (post-review)

## Context

Epic 3 is "Kit Ordering & Tracking." Story 3-1 (Backend Order Creation API) is done — the orders table, order model, RFC 7807 exception handling, and optional JWT auth dependency are all in place.

This story adds the consent endpoint as a sub-resource of orders. Story 3-4 (wizard wire-up) will call `POST /api/v1/orders/{id}/consent` immediately after `POST /api/v1/orders` in the same user flow.

**Critical model issue discovered (deferred from Story 1-2 code review):**
The existing `ConsentRecord` model (`app/models/consent_record.py`) has `user_id NOT NULL` and a unique constraint on `(user_id, order_id)`. This is incompatible with guest orders (where `user_id` is NULL). This story must fix both issues before implementing the consent endpoint.

All work is in `genepaw-api/`. No frontend changes.

## Acceptance Criteria

- **AC1:** `POST /api/v1/orders/{order_id}/consent` accepts `{"consent_text", "consented_at"}`. Creates a `consent_records` row linking the order and storing the exact consent paragraph text and timestamp.
- **AC2:** The endpoint records the caller's IP address in `consent_records.ip_address` (from the request). Use `X-Forwarded-For` header if present (proxy-aware), fall back to `request.client.host`.
- **AC3:** Returns `201` on success. Returns `409` if a consent record already exists for this order (prevents double-submission).
- **AC4:** The consent endpoint does not require authentication — it accepts the guest token (`?token=`) for guest orders, or the JWT for authenticated orders. Same auth logic as `GET /api/v1/orders/{order_id}`.
- **AC5:** `GET /api/v1/orders/{order_id}/consent` (staff only, requires `staff` role) returns the consent record for audit purposes. Returns `404` if no consent record exists for the order.
- **AC6:** The `consent_records` table has a non-nullable `consented_at` timestamp column (already true — preserve it). `user_id` must be nullable (fix in migration). Unique constraint must be on `order_id` alone (fix in migration).
- **AC7:** At least two pytest tests: successful consent creation; 409 on duplicate submission.

## Tasks / Subtasks

- [x] Task 1: Fix ConsentRecord model + create Alembic migration
  - [x] 1a. Create `alembic/versions/d7e8f9a0b1c2_update_consent_record_make_user_id_nullable.py`
  - [x] 1b. Update `app/models/consent_record.py` — `user_id` nullable, unique constraint on `order_id` only
  - [x] 1c. Update `app/db/migrations_test.py` — assert `user_id` nullable + new unique constraint + migration file exists

- [x] Task 2: Create `app/schemas/consent.py` with `ConsentCreate` and `ConsentResponse`

- [x] Task 3: Add consent routes to `app/api/v1/orders.py`
  - [x] 3a. `POST /{order_id}/consent` (AC1, AC2, AC3, AC4)
  - [x] 3b. `GET /{order_id}/consent` staff-only (AC5)

- [x] Task 4: Create `app/api/v1/consent_test.py` with at least two tests (AC7)

- [x] Task 5: Run tests and verify
  - [x] 5a. Run `uv run pytest` from `genepaw-api/` — all tests pass (including 84 pre-existing)

### Review Findings (AI)

- [x] [Review][Patch] Concurrent consent creation → `IntegrityError` → 500 instead of 409 [`orders.py:141-163`]
- [x] [Review][Patch] `consented_at` timezone-naive datetime → asyncpg `ValueError` → 500 [`schemas/consent.py:13`]
- [x] [Review][Patch] `X-Forwarded-For` empty string → blank IP stored in audit log [`orders.py:149`]
- [x] [Review][Patch] `GET /{order_id}/consent` staff endpoint has zero test coverage [`consent_test.py`]
- [x] [Review][Patch] `consented_at` `server_default` not removed in migration [`d7e8f9a0b1c2:19-22`]
- [x] [Review][Defer] Auth block duplicated verbatim in `create_consent` vs `get_order` [`orders.py:128-139`] — deferred, pre-existing design
- [x] [Review][Defer] `X-Forwarded-For` spoofable without trusted-proxy config → unreliable DPDP audit trail [`orders.py:148`] — deferred, architectural
- [x] [Review][Defer] Migration `downgrade()` data-destructive if NULL `user_id` rows exist [`d7e8f9a0b1c2:25-28`] — deferred, known migration pattern
- [x] [Review][Defer] `consent_text` no max-length validation [`schemas/consent.py:11`] — deferred, enhancement

## Dev Notes

### Architecture

- **Working directory for all commands**: `C:\Users\pc\_workarea\gene_annotation\genepaw-api`
- **Test command**: `uv run pytest` (no DB required — all tests use `dependency_overrides`)
- **No TypeScript, no frontend changes** — Python only
- **Test pattern**: `TestClient` + `dependency_overrides` for `get_db` — follow `app/api/v1/orders_test.py`
- **Test co-location**: `consent_test.py` alongside `orders.py` (in `app/api/v1/`)
- **Consent routes go in `orders.py`** — they are sub-resources of orders; do NOT create a separate router

### Current codebase state (READ BEFORE IMPLEMENTING)

```
genepaw-api/
├── app/
│   ├── api/v1/
│   │   ├── router.py          ← DO NOT TOUCH (orders router already registered)
│   │   ├── orders.py          ← UPDATE: add consent POST and GET routes
│   │   ├── orders_test.py     ← DO NOT TOUCH (reference only)
│   │   └── auth.py            ← DO NOT TOUCH
│   ├── core/
│   │   ├── dependencies.py    ← DO NOT TOUCH (get_optional_user, require_role already there)
│   │   └── exceptions.py      ← DO NOT TOUCH
│   ├── db/
│   │   └── migrations_test.py ← UPDATE: add consent model assertions + migration test
│   ├── models/
│   │   ├── consent_record.py  ← UPDATE: user_id nullable, fix unique constraint
│   │   └── __init__.py        ← DO NOT TOUCH (ConsentRecord already exported)
│   └── schemas/
│       └── orders.py          ← DO NOT TOUCH (reference pattern only)
├── alembic/versions/
│   ├── 816697485877_initial_schema.py           ← DO NOT TOUCH
│   ├── c45604ac50c0_seed_species_and_markers.py ← DO NOT TOUCH
│   └── 3f8a2e9b4c71_add_full_name_phone_to_orders.py  ← DO NOT TOUCH (current HEAD)
└── main.py                    ← DO NOT TOUCH
```

**New files to create:**
- `alembic/versions/d7e8f9a0b1c2_update_consent_record_make_user_id_nullable.py`
- `app/schemas/consent.py`
- `app/api/v1/consent_test.py`

### Task 1 — Fix ConsentRecord model + migration

**BEFORE — `app/models/consent_record.py`:**
```python
class ConsentRecord(Base):
    __tablename__ = "consent_records"
    __table_args__ = (UniqueConstraint("user_id", "order_id", name="uq_consent_user_order"),)

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # BUG: must be nullable
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    consent_text = Column(Text, nullable=False)
    consented_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ip_address = Column(String, nullable=True)
```

**AFTER — fix `user_id` nullable + fix unique constraint:**
```python
class ConsentRecord(Base):
    __tablename__ = "consent_records"
    __table_args__ = (UniqueConstraint("order_id", name="uq_consent_records_order_id"),)

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)   # nullable for guest orders
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    consent_text = Column(Text, nullable=False)
    consented_at = Column(DateTime(timezone=True), nullable=False)                 # provided by client
    ip_address = Column(String, nullable=True)
```

**New migration — `alembic/versions/d7e8f9a0b1c2_update_consent_record_make_user_id_nullable.py`:**
```python
"""update_consent_record_make_user_id_nullable

Revision ID: d7e8f9a0b1c2
Revises: 3f8a2e9b4c71
Create Date: 2026-05-20

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d7e8f9a0b1c2"
down_revision: Union[str, None] = "3f8a2e9b4c71"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("uq_consent_user_order", "consent_records", type_="unique")
    op.alter_column("consent_records", "user_id", existing_type=sa.dialects.postgresql.UUID(), nullable=True)
    op.create_unique_constraint("uq_consent_records_order_id", "consent_records", ["order_id"])


def downgrade() -> None:
    op.drop_constraint("uq_consent_records_order_id", "consent_records", type_="unique")
    op.alter_column("consent_records", "user_id", existing_type=sa.dialects.postgresql.UUID(), nullable=False)
    op.create_unique_constraint("uq_consent_user_order", "consent_records", ["user_id", "order_id"])
```

**Update `app/db/migrations_test.py` — add after the existing consent tests:**
```python
def test_consent_record_user_id_nullable():
    from app.models.consent_record import ConsentRecord
    col = ConsentRecord.__table__.c.user_id
    assert col.nullable is True


def test_consent_record_has_order_unique_constraint():
    from app.models.consent_record import ConsentRecord
    uq_names = {c.name for c in ConsentRecord.__table__.constraints}
    assert "uq_consent_records_order_id" in uq_names


def test_update_consent_migration_file_exists():
    versions_dir = Path(__file__).parent.parent.parent / "alembic" / "versions"
    files = list(versions_dir.glob("*_update_consent_record_make_user_id_nullable.py"))
    assert files, "update_consent_record_make_user_id_nullable migration file not found"


def test_update_consent_migration_references_add_full_name_revision():
    versions_dir = Path(__file__).parent.parent.parent / "alembic" / "versions"
    files = list(versions_dir.glob("*_update_consent_record_make_user_id_nullable.py"))
    assert files
    text = files[0].read_text(encoding="utf-8")
    assert "3f8a2e9b4c71" in text
```

### Task 2 — Create `app/schemas/consent.py`

```python
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ConsentCreate(BaseModel):
    consent_text: str
    consented_at: datetime


class ConsentResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    order_id: uuid.UUID
    consent_text: str
    consented_at: datetime
    ip_address: Optional[str]

    model_config = {"from_attributes": True}
```

### Task 3 — Add consent routes to `app/api/v1/orders.py`

Add these imports at the top of `orders.py` (after existing imports):
```python
from fastapi import Request
from app.models.consent_record import ConsentRecord
from app.schemas.consent import ConsentCreate, ConsentResponse
```

Add these two route handlers AFTER the existing three routes (at the end of `orders.py`):

```python
@router.post("/{order_id}/consent", status_code=status.HTTP_201_CREATED, response_model=ConsentResponse)
async def create_consent(
    order_id: uuid.UUID,
    body: ConsentCreate,
    request: Request,
    token: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> ConsentRecord:
    # Look up order
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    order = order_result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # AC4: same auth logic as get_order — JWT owner or guest token
    if current_user is not None:
        if order.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif token is not None:
        try:
            token_uuid = uuid.UUID(token)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid guest token")
        if order.guest_token != token_uuid:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid guest token")
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    # AC3: 409 if consent already exists for this order
    existing = await db.execute(select(ConsentRecord).where(ConsentRecord.order_id == order_id))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Consent record already exists for this order",
        )

    # AC2: extract IP — X-Forwarded-For (proxy-aware) then direct client
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        ip_address = forwarded_for.split(",")[0].strip()
    else:
        ip_address = request.client.host if request.client else None

    # AC1: create consent record
    consent = ConsentRecord(
        user_id=current_user.id if current_user else None,
        order_id=order_id,
        consent_text=body.consent_text,
        consented_at=body.consented_at,
        ip_address=ip_address,
    )
    db.add(consent)
    await db.commit()
    await db.refresh(consent)
    return consent


@router.get("/{order_id}/consent", response_model=ConsentResponse)
async def get_consent(
    order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("staff")),
) -> ConsentRecord:
    result = await db.execute(select(ConsentRecord).where(ConsentRecord.order_id == order_id))
    consent = result.scalar_one_or_none()
    if consent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No consent record found for this order")
    return consent
```

**Why routes go in `orders.py`:** Consent is a sub-resource of orders. The consent routes are `/{order_id}/consent` which naturally nest under the orders router (mounted at `/orders` prefix). No new file or router registration needed.

**Route ordering note:** FastAPI matches routes in registration order. `GET "/{order_id}"` and `GET "/{order_id}/consent"` are both registered. FastAPI correctly distinguishes them because the path patterns are different. The `GET ""` (list) and `POST ""` (create) routes are unaffected.

### Task 4 — Create `app/api/v1/consent_test.py`

```python
"""Tests for Story 3.2: Consent Record Storage."""
from __future__ import annotations

import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient

from app.db.session import get_db
from app.models.consent_record import ConsentRecord
from app.models.order import Order, OrderPackage, OrderStatus
from main import app


@contextmanager
def _override(overrides: dict):
    app.dependency_overrides.update(overrides)
    try:
        yield
    finally:
        for key in overrides:
            app.dependency_overrides.pop(key, None)


def _make_order(user_id=None) -> Order:
    o = Order(
        species_id=uuid.uuid4(),
        package=OrderPackage.breed_id,
        status=OrderStatus.pending,
        address_city="Bangalore",
        address_state="Karnataka",
        address_pincode="560001",
        full_name="Test User",
        phone="9876543210",
    )
    o.id = uuid.uuid4()
    o.user_id = user_id
    o.guest_token = uuid.uuid4()
    o.created_at = datetime.now(timezone.utc)
    return o


def _make_consent(order_id: uuid.UUID) -> ConsentRecord:
    c = ConsentRecord(
        order_id=order_id,
        consent_text="Your pet's DNA stays yours.",
        consented_at=datetime.now(timezone.utc),
        ip_address="127.0.0.1",
    )
    c.id = uuid.uuid4()
    c.user_id = None
    return c


def _db_for_create_consent(order: Order, existing_consent: ConsentRecord | None, new_consent: ConsentRecord):
    """Mock DB: call 1 = order lookup, call 2 = existing consent check."""
    calls = []

    async def _get_db():
        session = AsyncMock()

        async def _execute(stmt):
            result = MagicMock()
            if len(calls) == 0:
                result.scalar_one_or_none.return_value = order
            elif len(calls) == 1:
                result.scalar_one_or_none.return_value = existing_consent
            calls.append(1)
            return result

        async def _refresh(obj):
            obj.id = new_consent.id
            obj.user_id = new_consent.user_id
            obj.ip_address = new_consent.ip_address
            obj.consented_at = new_consent.consented_at

        session.execute = AsyncMock(side_effect=_execute)
        session.add = MagicMock()
        session.commit = AsyncMock()
        session.refresh = AsyncMock(side_effect=_refresh)
        yield session

    return _get_db


# ---------------------------------------------------------------------------
# POST /api/v1/orders/{order_id}/consent
# ---------------------------------------------------------------------------

def test_create_consent_returns_201_with_guest_token():
    order = _make_order()
    consent = _make_consent(order.id)
    with _override({get_db: _db_for_create_consent(order, None, consent)}):
        client = TestClient(app)
        resp = client.post(
            f"/api/v1/orders/{order.id}/consent",
            params={"token": str(order.guest_token)},
            json={
                "consent_text": "Your pet's DNA stays yours.",
                "consented_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    assert resp.status_code == 201
    body = resp.json()
    assert "id" in body
    assert body["order_id"] == str(order.id)
    assert "consented_at" in body


def test_create_consent_duplicate_returns_409():
    order = _make_order()
    existing = _make_consent(order.id)

    async def _get_db():
        session = AsyncMock()
        calls = []

        async def _execute(stmt):
            result = MagicMock()
            if len(calls) == 0:
                result.scalar_one_or_none.return_value = order
            elif len(calls) == 1:
                result.scalar_one_or_none.return_value = existing  # already exists
            calls.append(1)
            return result

        session.execute = AsyncMock(side_effect=_execute)
        yield session

    with _override({get_db: _get_db}):
        client = TestClient(app)
        resp = client.post(
            f"/api/v1/orders/{order.id}/consent",
            params={"token": str(order.guest_token)},
            json={
                "consent_text": "Your pet's DNA stays yours.",
                "consented_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    assert resp.status_code == 409


def test_create_consent_order_not_found_returns_404():
    async def _get_db():
        session = AsyncMock()
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        session.execute = AsyncMock(return_value=result)
        yield session

    with _override({get_db: _get_db}):
        client = TestClient(app)
        resp = client.post(
            f"/api/v1/orders/{uuid.uuid4()}/consent",
            params={"token": str(uuid.uuid4())},
            json={
                "consent_text": "test",
                "consented_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    assert resp.status_code == 404


def test_create_consent_missing_required_field_returns_422():
    client = TestClient(app)
    resp = client.post(
        f"/api/v1/orders/{uuid.uuid4()}/consent",
        params={"token": str(uuid.uuid4())},
        json={"consent_text": "test"},  # missing consented_at
    )
    assert resp.status_code == 422
```

### Task 5 — Verify all tests pass

```bash
# From genepaw-api directory
uv run pytest
```

Expected: all 84 pre-existing tests + 4 new consent tests = 88+ tests pass. Zero failures.

### Pattern notes (follow exactly)

- **Import `Request` from fastapi** in `orders.py` — needed for IP extraction in the consent route
- **`from app.models.consent_record import ConsentRecord`** — import in `orders.py`
- **`from app.schemas.consent import ConsentCreate, ConsentResponse`** — import in `orders.py`
- **`model_config = {"from_attributes": True}`** required on `ConsentResponse`
- **Unique constraint on `order_id`** not `(user_id, order_id)` — enforces one consent per order regardless of auth type
- **`nullable=True` on `user_id`** in model AND migration — guest orders have `user_id=None` in both orders and consent_records
- **Do NOT add a `created_at` column to ConsentRecord** — the spec uses `consented_at` for the timestamp; there is no separate `created_at`

### Important migration detail

The `op.alter_column` in the migration requires `existing_type` to be specified for PostgreSQL. Use `sa.dialects.postgresql.UUID()` for the UUID type. Without `existing_type`, Alembic may fail on some PostgreSQL setups.

Actually, to be safe with different Alembic versions, use `sa.UUID()` (generic) instead of `sa.dialects.postgresql.UUID()`:

```python
op.alter_column("consent_records", "user_id", existing_type=sa.UUID(), nullable=True)
```

### Previous story learnings (from Story 3-1 review and implementation)

- **Working directory**: always `C:\Users\pc\_workarea\gene_annotation\genepaw-api`
- **Test runner**: `uv run pytest` (not bare `pytest`)
- **No git repo** — no `git diff`; trust test output for verification
- **`HTTP_422_UNPROCESSABLE_CONTENT`** not `HTTP_422_UNPROCESSABLE_ENTITY` (deprecated)
- **UUID comparison in routes**: always parse `str` token params as `uuid.UUID(token)` with try/except
- **Starlette 1.0.0**: `@app.exception_handler(404)` registered in exceptions.py for routing 404s
- **`import pytest` in test files**: only add if actually used (`pytest.raises` etc.); otherwise omit

## Dev Agent Record

### Implementation Plan

Task 1: Fixed ConsentRecord model — `user_id` nullable, unique constraint on `order_id` only. Created Alembic migration `d7e8f9a0b1c2` chained to `3f8a2e9b4c71`. Added 4 new assertion tests to `migrations_test.py`.

Task 2: Created `app/schemas/consent.py` with `ConsentCreate` (consent_text + consented_at) and `ConsentResponse` (with `from_attributes=True`).

Task 3: Added `Request` import and consent model/schema imports to `orders.py`. Appended `POST /{order_id}/consent` (auth + duplicate check + IP extraction) and `GET /{order_id}/consent` (staff-only) to existing orders router.

Task 4: Created `consent_test.py` with 4 tests: 201 success with guest token, 409 duplicate, 404 order not found, 422 missing field.

Task 5: `uv run pytest` → 92 passed in 7.95s.

### Debug Log
_No issues encountered._

### Completion Notes

All 5 tasks complete. 92 tests pass (84 pre-existing + 8 new: 4 consent API tests + 4 migration model tests). All 7 ACs satisfied:
- AC1–AC4: POST /{order_id}/consent with guest/JWT auth, IP capture, 201 response, 409 on duplicate
- AC5: GET /{order_id}/consent staff-only with 404 if none
- AC6: user_id nullable, unique on order_id — verified by model assertion tests
- AC7: 4 tests (exceeds minimum of 2)

## File List

**New files:**
- `alembic/versions/d7e8f9a0b1c2_update_consent_record_make_user_id_nullable.py`
- `app/schemas/consent.py`
- `app/api/v1/consent_test.py`

**Modified files:**
- `app/models/consent_record.py` — user_id nullable, unique constraint on order_id
- `app/api/v1/orders.py` — added Request import, consent imports, POST/GET consent routes
- `app/db/migrations_test.py` — added 4 consent model + migration assertion tests

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Story created |
| 2026-05-20 | Story implemented — 92 tests pass |
| 2026-05-20 | Code review patches applied — 94 tests pass |
