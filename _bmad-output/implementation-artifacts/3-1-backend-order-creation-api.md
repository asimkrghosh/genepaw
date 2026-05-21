# Story 3.1 — Backend: Order Creation API

## Story

**As a** customer,
**I want** my kit order to be saved to the database when I submit the wizard,
**so that** GenePaw has a real record of my purchase and can dispatch my kit.

## Status

done

## Context

Epic 3 is "Kit Ordering & Tracking." Stories 2-1 through 2-5 completed the India-market frontend polish. This is the first Epic 3 story — the backend order creation API that Stories 3-4 (wizard wire-up) and 3-5 (tracking page) will depend on.

The FastAPI backend (`genepaw-api/`) is fully scaffolded from Epic 1:
- Auth endpoints, JWT dependencies, RFC 7807 error handler, structured logging are all in place.
- `orders` table exists from migration `816697485877_initial_schema.py` but is MISSING `full_name` and `phone` columns — a new Alembic migration is required.
- No orders router exists yet; `app/api/v1/router.py` only has the auth router.

All work in this story is in `genepaw-api/`. No frontend changes.

## Acceptance Criteria

- **AC1:** `POST /api/v1/orders` accepts `{"species_id", "package", "address_city", "address_state", "address_pincode", "full_name", "phone"}`. The `user_id` is set from the JWT if authenticated, or `null` for guest orders.
- **AC2:** The endpoint creates an `orders` row with `status = 'pending'` and returns `201` with the created order including its `id`.
- **AC3:** `package` must be one of `breed_id`, `health_breed`, `complete_genome` — returns `422` with RFC 7807 body if invalid.
- **AC4:** `species_id` must reference an existing species in the `species` table — returns `422` if not found.
- **AC5:** `GET /api/v1/orders/{order_id}` returns the order's current status and details. A customer can only retrieve their own order (matched by `user_id` or by guest token — accept `?token=` query param for guest lookups).
- **AC6:** `GET /api/v1/orders` (staff only, requires `staff` role) returns all orders, paginated (`?page=1&page_size=20`), newest first.
- **AC7:** At least two pytest tests: successful order creation; invalid package returns 422.

## Tasks / Subtasks

- [x] Task 1: Add Alembic migration for `full_name` and `phone` columns on `orders`
  - [x] 1a. Create `alembic/versions/3f8a2e9b4c71_add_full_name_phone_to_orders.py`
  - [x] 1b. Update `app/models/order.py` to add `full_name` and `phone` columns
  - [x] 1c. Update `app/db/migrations_test.py` — add `full_name`, `phone` to `test_order_model_columns` assertion

- [x] Task 2: Add `RequestValidationError` handler to `app/core/exceptions.py` (required for AC3 RFC 7807 on 422)

- [x] Task 3: Add `get_optional_user` dependency to `app/core/dependencies.py` (required for optional auth on POST /orders)

- [x] Task 4: Create `app/schemas/orders.py` with `OrderCreate`, `OrderResponse`, `OrderListResponse`

- [x] Task 5: Create `app/api/v1/orders.py` with three route handlers
  - [x] 5a. `POST /orders` (AC1, AC2, AC3, AC4)
  - [x] 5b. `GET /orders/{order_id}` (AC5)
  - [x] 5c. `GET /orders` staff-only paginated list (AC6)

- [x] Task 6: Register orders router in `app/api/v1/router.py`

- [x] Task 7: Create `app/api/v1/orders_test.py` with at least two tests (AC7)

- [x] Task 8: Run tests and verify
  - [x] 8a. Run `uv run pytest` from `genepaw-api/` — all tests pass (including pre-existing auth tests)

### Review Findings (AI) — 2026-05-20

- [x] [Review][Decision] `species.is_active` not checked — orders accepted for inactive/decommissioned species [`app/api/v1/orders.py:32`] — resolved: reject inactive species (added `Species.is_active == True` to filter)
- [x] [Review][Patch] `str(order.guest_token)` comparison unsafe: null→"None" string, case-sensitive format [`app/api/v1/orders.py:73`] — fixed: parse token as `uuid.UUID` with try/except
- [x] [Review][Patch] `import pytest` unused [`app/api/v1/orders_test.py:9`] — fixed: removed
- [x] [Review][Defer] Auth user gets 403 on guest orders — confirms order existence to requester [`app/api/v1/orders.py:70`] — deferred, deliberate HTTP semantics tradeoff
- [x] [Review][Defer] Dual 404 handlers (type + status-code) — title logic diverges for explicitly-raised 404s [`app/core/exceptions.py:28`] — deferred, intentional Starlette 1.0.0 fix
- [x] [Review][Defer] Two-query pagination COUNT then SELECT — total can be stale under concurrent inserts [`app/api/v1/orders.py:90`] — deferred, acceptable for current scale
- [x] [Review][Defer] No test coverage for `GET /orders/{order_id}` (AC5) or `GET /orders` (AC6) [`app/api/v1/orders_test.py`] — deferred, AC7 minimum met
- [x] [Review][Defer] Staff cannot retrieve individual orders via `GET /orders/{order_id}` [`app/api/v1/orders.py:69`] — deferred, spec gap; staff list endpoint covers current use cases
- [x] [Review][Defer] species-not-found 422 `title` field duplicates `detail` value [`app/api/v1/orders.py:35`] — deferred, HTTPException handler pre-existing behavior

## Dev Notes

### Architecture

- **Working directory for all commands**: `C:\Users\pc\_workarea\gene_annotation\genepaw-api`
- **Test command**: `uv run pytest` (no DB required — all tests use `dependency_overrides`)
- **No TypeScript, no frontend changes** — Python only
- **Test pattern**: `TestClient` + `dependency_overrides` for `get_db` — see `app/api/v1/auth_test.py` for the full pattern to follow
- **Test co-location**: tests live next to source (`orders_test.py` alongside `orders.py`)

### Current codebase state (READ BEFORE IMPLEMENTING)

```
genepaw-api/
├── app/
│   ├── api/v1/
│   │   ├── router.py          ← UPDATE: include orders router
│   │   ├── auth.py            ← DO NOT TOUCH
│   │   └── auth_test.py       ← reference: test pattern to follow
│   ├── core/
│   │   ├── dependencies.py    ← UPDATE: add get_optional_user
│   │   └── exceptions.py      ← UPDATE: add RequestValidationError handler
│   ├── db/
│   │   ├── session.py         ← DO NOT TOUCH (get_db lives here)
│   │   └── migrations_test.py ← UPDATE: add full_name/phone column assertions
│   ├── models/
│   │   ├── order.py           ← UPDATE: add full_name, phone columns
│   │   └── __init__.py        ← DO NOT TOUCH (Order already exported)
│   └── schemas/
│       └── auth.py            ← reference: schema pattern to follow
├── alembic/versions/
│   ├── 816697485877_initial_schema.py      ← DO NOT TOUCH
│   └── c45604ac50c0_seed_species_and_markers.py ← DO NOT TOUCH (current HEAD)
└── main.py                    ← DO NOT TOUCH
```

**New files to create:**
- `alembic/versions/3f8a2e9b4c71_add_full_name_phone_to_orders.py`
- `app/schemas/orders.py`
- `app/api/v1/orders.py`
- `app/api/v1/orders_test.py`

### Task 1 — Migration + Order model update

**BEFORE — `app/models/order.py` (columns section):**
```python
class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    species_id = Column(UUID(as_uuid=True), ForeignKey("species.id"), nullable=False)
    package = Column(Enum(OrderPackage), nullable=False)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.pending)
    address_city = Column(String, nullable=False)
    address_state = Column(String, nullable=False)
    address_pincode = Column(String, nullable=False)
    guest_token = Column(UUID(as_uuid=True), nullable=True, default=uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
```

**AFTER — add two columns at the end (before `created_at`):**
```python
class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    species_id = Column(UUID(as_uuid=True), ForeignKey("species.id"), nullable=False)
    package = Column(Enum(OrderPackage), nullable=False)
    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.pending)
    address_city = Column(String, nullable=False)
    address_state = Column(String, nullable=False)
    address_pincode = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    guest_token = Column(UUID(as_uuid=True), nullable=True, default=uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
```

Note: `nullable=True` in the DB column to not break existing rows from the seed migration. The Pydantic schema enforces both as required at the API boundary.

**New migration file** — `alembic/versions/3f8a2e9b4c71_add_full_name_phone_to_orders.py`:
```python
"""add_full_name_phone_to_orders

Revision ID: 3f8a2e9b4c71
Revises: c45604ac50c0
Create Date: 2026-05-20

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "3f8a2e9b4c71"
down_revision: Union[str, None] = "c45604ac50c0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("full_name", sa.String, nullable=True))
    op.add_column("orders", sa.Column("phone", sa.String, nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "phone")
    op.drop_column("orders", "full_name")
```

**Update `app/db/migrations_test.py` — `test_order_model_columns`:**

BEFORE:
```python
def test_order_model_columns():
    from app.models.order import Order
    cols = {c.name for c in Order.__table__.columns}
    assert {"id", "user_id", "species_id", "package", "status",
            "address_city", "address_state", "address_pincode",
            "guest_token", "created_at"} <= cols
```

AFTER:
```python
def test_order_model_columns():
    from app.models.order import Order
    cols = {c.name for c in Order.__table__.columns}
    assert {"id", "user_id", "species_id", "package", "status",
            "address_city", "address_state", "address_pincode",
            "full_name", "phone", "guest_token", "created_at"} <= cols
```

Also add a new migration file check at the bottom of `migrations_test.py`:
```python
def test_add_full_name_phone_migration_file_exists():
    versions_dir = Path(__file__).parent.parent.parent / "alembic" / "versions"
    files = list(versions_dir.glob("*_add_full_name_phone_to_orders.py"))
    assert files, "add_full_name_phone_to_orders migration file not found"
```

### Task 2 — Update `app/core/exceptions.py` for RFC 7807 on 422

BEFORE:
```python
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

_logger = logging.getLogger(__name__)
...
def add_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        ...

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        ...
```

AFTER — add import and new handler:
```python
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

_logger = logging.getLogger(__name__)


def problem_detail(status: int, title: str, detail: object) -> dict:
    return {
        "type": f"https://httpstatuses.com/{status}",
        "title": title,
        "status": status,
        "detail": detail,
    }


def add_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        title = exc.detail if isinstance(exc.detail, str) else "HTTP Error"
        return JSONResponse(
            status_code=exc.status_code,
            content=problem_detail(exc.status_code, title, exc.detail),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = [
            {"field": ".".join(str(loc) for loc in e["loc"][1:]), "msg": e["msg"]}
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content={
                **problem_detail(422, "Validation Error", "One or more fields failed validation."),
                "errors": errors,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        _logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content=problem_detail(500, "Internal Server Error", "An unexpected error occurred."),
        )
```

### Task 3 — Add `get_optional_user` to `app/core/dependencies.py`

Add this function at the end of `dependencies.py`:

```python
async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except JWTError:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
```

This is used by `POST /orders` to set `user_id` if authenticated (AC1: "set from JWT if authenticated, or null for guest orders").

### Task 4 — Create `app/schemas/orders.py`

```python
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.order import OrderPackage


class OrderCreate(BaseModel):
    species_id: uuid.UUID
    package: OrderPackage
    address_city: str
    address_state: str
    address_pincode: str
    full_name: str
    phone: str


class OrderResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    species_id: uuid.UUID
    package: str
    status: str
    address_city: str
    address_state: str
    address_pincode: str
    full_name: Optional[str]
    phone: Optional[str]
    guest_token: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
```

**Why `package: OrderPackage` in `OrderCreate`:** Pydantic validates the enum value automatically, returning 422 (now RFC 7807 via Task 2 handler) if invalid. No manual validation needed in the route handler.

### Task 5 — Create `app/api/v1/orders.py`

```python
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_optional_user, require_role
from app.db.session import get_db
from app.models.order import Order, OrderStatus
from app.models.species import Species
from app.models.user import User
from app.schemas.orders import OrderCreate, OrderListResponse, OrderResponse

router = APIRouter()

# Fixed pricing map (spec: price is not stored, derived from package)
_PACKAGE_PRICES = {
    "breed_id": 7999,
    "health_breed": 15999,
    "complete_genome": 27999,
}


@router.post("", status_code=status.HTTP_201_CREATED, response_model=OrderResponse)
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> Order:
    # AC4: validate species_id exists
    result = await db.execute(select(Species).where(Species.id == body.species_id))
    species = result.scalar_one_or_none()
    if species is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"species_id '{body.species_id}' not found",
        )

    order = Order(
        user_id=current_user.id if current_user else None,
        species_id=body.species_id,
        package=body.package,
        status=OrderStatus.pending,
        address_city=body.address_city,
        address_state=body.address_state,
        address_pincode=body.address_pincode,
        full_name=body.full_name,
        phone=body.phone,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    token: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> Order:
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Auth check: JWT user must own the order, OR guest token must match
    if current_user is not None:
        if order.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif token is not None:
        if str(order.guest_token) != token:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid guest token")
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    return order


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role("staff")),
) -> dict:
    offset = (page - 1) * page_size

    total_result = await db.execute(select(func.count()).select_from(Order))
    total = total_result.scalar_one()

    orders_result = await db.execute(
        select(Order).order_by(Order.created_at.desc()).offset(offset).limit(page_size)
    )
    orders = orders_result.scalars().all()

    return {
        "items": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
    }
```

### Task 6 — Update `app/api/v1/router.py`

BEFORE:
```python
from fastapi import APIRouter

from app.api.v1 import auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
```

AFTER:
```python
from fastapi import APIRouter

from app.api.v1 import auth, orders

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
```

### Task 7 — Create `app/api/v1/orders_test.py`

Follow the same pattern as `auth_test.py`: `TestClient` + `dependency_overrides` for `get_db`, no live DB.

```python
"""Tests for Story 3.1: Order Creation API."""
from __future__ import annotations

import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.db.session import get_db
from app.models.order import Order, OrderPackage, OrderStatus
from app.models.species import Species, SpeciesCategory
from main import app


@contextmanager
def _override(overrides: dict):
    app.dependency_overrides.update(overrides)
    try:
        yield
    finally:
        for key in overrides:
            app.dependency_overrides.pop(key, None)


def _make_species() -> Species:
    s = Species(name="Dog", category=SpeciesCategory.customer, is_active=True)
    s.id = uuid.uuid4()
    return s


def _make_order(species_id: uuid.UUID) -> Order:
    o = Order(
        species_id=species_id,
        package=OrderPackage.breed_id,
        status=OrderStatus.pending,
        address_city="Bangalore",
        address_state="Karnataka",
        address_pincode="560001",
        full_name="Test User",
        phone="9876543210",
    )
    o.id = uuid.uuid4()
    o.user_id = None
    o.guest_token = uuid.uuid4()
    o.created_at = datetime.now(timezone.utc)
    return o


def _db_for_create_order(species: Species | None, order: Order):
    """Mock DB: first execute returns species lookup, then add/commit/refresh creates order."""
    calls = []

    async def _get_db():
        session = AsyncMock()

        async def _execute(stmt):
            result = MagicMock()
            if len(calls) == 0:
                # First call: species lookup
                result.scalar_one_or_none.return_value = species
            calls.append(1)
            return result

        async def _refresh(obj):
            obj.id = order.id
            obj.user_id = order.user_id
            obj.guest_token = order.guest_token
            obj.created_at = order.created_at
            obj.status = order.status

        session.execute = AsyncMock(side_effect=_execute)
        session.add = MagicMock()
        session.commit = AsyncMock()
        session.refresh = AsyncMock(side_effect=_refresh)
        yield session

    return _get_db


# ---------------------------------------------------------------------------
# POST /api/v1/orders
# ---------------------------------------------------------------------------

def test_create_order_returns_201():
    species = _make_species()
    order = _make_order(species.id)
    with _override({get_db: _db_for_create_order(species, order)}):
        client = TestClient(app)
        resp = client.post("/api/v1/orders", json={
            "species_id": str(species.id),
            "package": "breed_id",
            "address_city": "Bangalore",
            "address_state": "Karnataka",
            "address_pincode": "560001",
            "full_name": "Test User",
            "phone": "9876543210",
        })
    assert resp.status_code == 201
    body = resp.json()
    assert "id" in body
    assert body["status"] == "pending"
    assert "guest_token" in body


def test_create_order_invalid_package_returns_422():
    client = TestClient(app)
    resp = client.post("/api/v1/orders", json={
        "species_id": str(uuid.uuid4()),
        "package": "invalid_package_type",
        "address_city": "Bangalore",
        "address_state": "Karnataka",
        "address_pincode": "560001",
        "full_name": "Test User",
        "phone": "9876543210",
    })
    assert resp.status_code == 422
    body = resp.json()
    assert body["status"] == 422


def test_create_order_missing_required_field_returns_422():
    client = TestClient(app)
    resp = client.post("/api/v1/orders", json={
        "species_id": str(uuid.uuid4()),
        "package": "breed_id",
        # missing full_name, phone, address fields
    })
    assert resp.status_code == 422


def test_create_order_species_not_found_returns_422():
    async def _get_db():
        session = AsyncMock()
        result = MagicMock()
        result.scalar_one_or_none.return_value = None  # species not found
        session.execute = AsyncMock(return_value=result)
        yield session

    with _override({get_db: _get_db}):
        client = TestClient(app)
        resp = client.post("/api/v1/orders", json={
            "species_id": str(uuid.uuid4()),
            "package": "breed_id",
            "address_city": "Bangalore",
            "address_state": "Karnataka",
            "address_pincode": "560001",
            "full_name": "Test User",
            "phone": "9876543210",
        })
    assert resp.status_code == 422
```

### Task 8 — Verify all tests pass

```bash
# From genepaw-api directory
uv run pytest
```

Expected: all pre-existing auth tests + all new orders tests pass. Zero failures.

### Pattern notes (follow existing code exactly)

- **No `async def` in route handlers that don't need it** — but since we use `await db.execute(...)`, all three route handlers must be `async def`
- **Never expose SQLAlchemy model directly** — always return through `response_model=OrderResponse`
- **`model_config = {"from_attributes": True}`** required on `OrderResponse` for SQLAlchemy ORM → Pydantic conversion
- **RFC 7807 on 422**: After Task 2, ALL Pydantic validation errors (including invalid `package` enum) return RFC 7807 format automatically
- **Pricing**: the `_PACKAGE_PRICES` dict is defined but NOT used in this story (pricing is displayed frontend-side via `formatINR()`). Include it for reference; Story 3-4 will use it for order confirmation display. Do NOT add a `price` column to the orders table.

### Previous story learnings (from Stories 2-4 and 2-5)

- **Working directory**: always run commands from `C:\Users\pc\_workarea\gene_annotation\genepaw-api`
- **Test runner**: `uv run pytest` (not bare `pytest`) — uses the uv-managed venv
- **No git repo** — no `git diff` available for verification; trust test output
- **Surgical changes only** — do not touch files outside the task scope

## Dev Agent Record

### Implementation Plan

Implemented in 8 tasks: (1) Alembic migration + model update for missing `full_name`/`phone` columns, (2) RFC 7807 RequestValidationError handler, (3) `get_optional_user` dependency for optional JWT auth, (4) Pydantic schemas for orders, (5) three route handlers (POST/GET/{id}/GET paginated), (6) router registration, (7) four tests covering success and 422 error paths, (8) full test suite verification.

Also fixed a pre-existing Starlette 1.0.0 compatibility issue: routing 404s bypassed the `HTTPException` type handler, causing `main_test.py::test_api_v1_prefix_exists` to fail. Fixed by adding `@app.exception_handler(404)` status-code-level handler.

### Debug Log

- Discovered Starlette 1.0.0 routing 404s bypass `HTTPException` type handler. Fixed by adding `@app.exception_handler(404)` alongside the existing `HTTPException` handler.
- Used `HTTP_422_UNPROCESSABLE_CONTENT` (new name) instead of deprecated `HTTP_422_UNPROCESSABLE_ENTITY`.

### Completion Notes

All 8 tasks complete. 84 tests pass (0 failures, 0 warnings). All 4 orders tests pass. All pre-existing auth, exceptions, config, logging, migrations, and main tests pass.

AC1-AC7 satisfied:
- AC1/AC2: `POST /orders` accepts body, sets user_id from JWT or null for guest, returns 201 with order including id
- AC3: package validated by Pydantic enum, returns RFC 7807 422 on invalid value
- AC4: species_id existence checked, returns 422 if not found
- AC5: `GET /orders/{order_id}` with JWT owner check or `?token=` guest token check
- AC6: `GET /orders` staff-only paginated list (requires `staff` role)
- AC7: 4 tests in `orders_test.py` (exceeds minimum of 2)

## File List

- `genepaw-api/alembic/versions/3f8a2e9b4c71_add_full_name_phone_to_orders.py` (NEW)
- `genepaw-api/app/models/order.py` (MODIFIED — added full_name, phone columns)
- `genepaw-api/app/db/migrations_test.py` (MODIFIED — added full_name/phone assertions + new migration tests)
- `genepaw-api/app/core/exceptions.py` (MODIFIED — added RequestValidationError handler + 404 status handler)
- `genepaw-api/app/core/dependencies.py` (MODIFIED — added get_optional_user)
- `genepaw-api/app/schemas/orders.py` (NEW)
- `genepaw-api/app/api/v1/orders.py` (NEW)
- `genepaw-api/app/api/v1/orders_test.py` (NEW)
- `genepaw-api/app/api/v1/router.py` (MODIFIED — registered orders router)

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Story created |
| 2026-05-20 | Story implemented — all tasks complete, 84 tests pass |
