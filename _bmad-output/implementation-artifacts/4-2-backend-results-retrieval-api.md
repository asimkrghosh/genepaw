# Story 4.2: Backend — Results Retrieval API

Status: done

## Story

As a customer,
I want to fetch my genomic results from the API,
so that the frontend can display my breed composition, health markers, traits, and lineage.

## Acceptance Criteria

- **AC1:** `GET /api/v1/orders/{order_id}/results` returns the `genomic_results` row for the order. Requires either a valid JWT (customer who owns the order) or the guest token (`?token=<uuid>`).
- **AC2:** Returns `404` RFC 7807 if no `genomic_results` row exists yet for the order (lab hasn't submitted via webhook yet).
- **AC3:** Returns `403` RFC 7807 if the JWT user does not own the order.
- **AC4:** Response body: `{"order_id": "<uuid>", "result_data": {"breed_composition": [...], "health_markers": [...], "trait_scores": {...}, "lineage": {...}}, "created_at": "<iso8601>"}`.
- **AC5:** At least one pytest test: results retrieved successfully with a valid guest token → 200.

## Tasks / Subtasks

- [x] Task 1: Create `app/schemas/genomic_result.py` with `GenomicResultResponse` Pydantic schema (AC: 4)
  - [x] 1a. `GenomicResultResponse(BaseModel)` with fields `order_id: uuid.UUID`, `result_data: dict[str, Any]`, `created_at: datetime`
  - [x] 1b. Add `model_config = {"from_attributes": True}` so FastAPI can serialize directly from the SQLAlchemy `GenomicResult` ORM object
- [x] Task 2: Add `GET /{order_id}/results` endpoint to `app/api/v1/orders.py` (AC: 1, 2, 3, 4)
  - [x] 2a. Route signature: `async def get_results(order_id: uuid.UUID, token: Optional[str] = Query(default=None), db: AsyncSession = Depends(get_db), current_user: User | None = Depends(get_optional_user)) -> GenomicResult`
  - [x] 2b. Fetch `Order` by `order_id` → `404` if not found (same as `get_order`)
  - [x] 2c. Auth block — copy the exact three-branch pattern from `get_order`: JWT user owns order → pass; JWT user doesn't own → `403`; guest token matches → pass; guest token doesn't match → `403`; no auth at all → `401`
  - [x] 2d. Fetch `GenomicResult` by `order_id` → `404 "Results not yet available for this order"` if `None`
  - [x] 2e. Return the `GenomicResult` ORM object (FastAPI serializes via `GenomicResultResponse`)
- [x] Task 3: Write tests in `app/api/v1/orders_test.py` (AC: 5)
  - [x] 3a. `test_get_results_guest_token_returns_200` — mock DB returns order + GenomicResult, call with valid `?token=` → 200, body has `result_data` and `order_id`
  - [x] 3b. `test_get_results_no_results_returns_404` — mock DB returns order but no GenomicResult → 404
  - [x] 3c. `test_get_results_no_auth_returns_401` — no JWT, no token → 401
  - [x] 3d. `test_get_results_wrong_token_returns_403` — wrong `?token=` → 403
  - [x] 3e. `test_get_results_jwt_owner_returns_200` — mock JWT resolves to user who owns order, DB returns GenomicResult → 200
- [x] Task 4: Run full test suite — all existing + new tests pass, zero regressions

### Review Findings

- [x] [Review][Defer] JWT auth with guest orders (user_id=NULL) — JWT user receives 403 instead of passing auth [orders.py:104-115] — deferred, pre-existing (same behavior in get_order; not introduced by 4-2)
- [x] [Review][Defer] Brute-force guest token via known order_id — no rate-limit or lockout [orders.py:116-123] — deferred, pre-existing architecture concern (applies to all guest-token endpoints)
- [x] [Review][Defer] No staff/admin role restriction on results endpoint — any authenticated user can attempt access [orders.py:92] — deferred, pre-existing (get_order has same pattern; admin portal is Epic 6)
- [x] [Review][Defer] Call-count mock pattern fragile — test ordering implicitly depends on execute call sequence [orders_test.py:165-184] — deferred, pre-existing (established pattern from webhooks_test.py)
- [x] [Review][Defer] Guest token exposed in URL query param — leaks in access logs and browser history [orders.py:95] — deferred, pre-existing (same in get_order and consent endpoints)
- [x] [Review][Defer] result_data returned as unfiltered dict[str,Any] — no output sanitization [orders.py:92-127] — deferred, intentional passthrough per spec; lab webhook owns shape validation
- [x] [Review][Defer] ORM attributes assigned to MagicMock(spec=GenomicResult) in test fixtures [orders_test.py:152-162] — deferred, established pattern from webhooks_test.py _make_order helper
- [x] [Review][Defer] No order status guard — results returned for orders in any status, not just results_ready [orders.py:117-127] — deferred, not required by spec; AC1 specifies auth only
- [x] [Review][Defer] get_optional_user silently returns None for expired JWTs — treats as unauthenticated [app/core/dependencies.py] — deferred, pre-existing; affects all JWT-protected endpoints
- [x] [Review][Defer] Schema omits GenomicResult.id field [genomic_result.py] — deferred, intentional per AC4 response spec (id not in required body)
- [x] [Review][Defer] Duplicate auth-check logic across create_consent, get_order, get_results (3 copies) [orders.py] — deferred, pre-existing; refactor is separate concern
- [x] [Review][Defer] 401 returned when no auth provided — spec says "requires JWT or guest token" but doesn't list 401 explicitly [orders.py:123-124] — deferred, pre-existing (copied verbatim from get_order; 401 is standard HTTP for unauthenticated)
- [x] [Review][Defer] Two distinct 404s (order not found vs results not available) not differentiated by error type/code [orders.py:102, 122] — deferred, pre-existing pattern; AC2 explicitly specifies the distinct message strings

## Dev Notes

### What Already Exists — Do NOT Recreate

| Artifact | Location | Notes |
|----------|----------|-------|
| `GenomicResult` model | `app/models/genomic_result.py` | `id`, `order_id` (FK unique), `result_data` (JSONB), `created_at` |
| `Order` model | `app/models/order.py` | `id`, `user_id` (nullable), `guest_token` (UUID), all address fields |
| `get_optional_user` dependency | `app/core/dependencies.py` | Returns `User | None` — None if no/invalid JWT |
| Auth pattern (JWT + guest token) | `app/api/v1/orders.py:get_order` (line ~62) | **Copy this block verbatim** — identical 3-branch logic required |
| `_override` test helper | `app/api/v1/orders_test.py` | Already defined — do not re-define |
| `_make_order` test helper | `app/api/v1/webhooks_test.py` | Already defined there; replicate locally in orders_test.py or import |

### Existing Auth Pattern to Copy (VERBATIM from `get_order`)

```python
# COPY THIS BLOCK exactly into get_results — do not invent a new pattern
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
```

### New Schema: `app/schemas/genomic_result.py`

```python
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class GenomicResultResponse(BaseModel):
    order_id: uuid.UUID
    result_data: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}
```

### New Endpoint: Add to `app/api/v1/orders.py`

Add this import at the top (alongside the existing GenomicResult-related imports):

```python
from app.models.genomic_result import GenomicResult
from app.schemas.genomic_result import GenomicResultResponse
```

Add this route to `orders.py` (after `get_order`, before `list_orders`):

```python
@router.get("/{order_id}/results", response_model=GenomicResultResponse)
async def get_results(
    order_id: uuid.UUID,
    token: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> GenomicResult:
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    order = order_result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

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

    gr_result = await db.execute(
        select(GenomicResult).where(GenomicResult.order_id == order_id)
    )
    genomic_result = gr_result.scalar_one_or_none()
    if genomic_result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Results not yet available for this order",
        )

    return genomic_result
```

### Test Mock Pattern (2 DB reads)

The endpoint calls `db.execute` twice: once for Order, once for GenomicResult.
Use the call-counter pattern established in `webhooks_test.py`:

```python
def _db_for_get_results(order, genomic_result=None):
    """Mock DB: first execute finds order, second finds GenomicResult."""
    calls = []

    async def _get_db():
        session = AsyncMock()

        async def _execute(stmt):
            result = MagicMock()
            if len(calls) == 0:
                result.scalar_one_or_none.return_value = order
            elif len(calls) == 1:
                result.scalar_one_or_none.return_value = genomic_result
            calls.append(1)
            return result

        session.execute = AsyncMock(side_effect=_execute)
        yield session

    return _get_db
```

### Constructing a Mock GenomicResult for Tests

```python
def _make_genomic_result(order_id: uuid.UUID) -> GenomicResult:
    from app.models.genomic_result import GenomicResult
    gr = MagicMock(spec=GenomicResult)
    gr.order_id = order_id
    gr.result_data = {
        "breed_composition": [{"species": "Dog", "percentage": 100.0}],
        "health_markers": [{"marker": "MDR1", "status": "green", "description": "Clear"}],
        "trait_scores": {"intelligence": 85.0},
        "lineage": {"paternal_line": "German Shepherd", "maternal_line": "Labrador"},
    }
    gr.created_at = datetime.now(timezone.utc)
    return gr
```

### JWT Auth Test — Mocking `get_optional_user`

For `test_get_results_jwt_owner_returns_200`:

```python
from app.core.dependencies import get_optional_user
from app.models.user import User

def _make_user(user_id: uuid.UUID) -> User:
    u = MagicMock(spec=User)
    u.id = user_id
    return u

# In test:
order = _make_order(...)
order.user_id = some_user_id  # make sure order is "owned" by this user
user = _make_user(some_user_id)

async def _fake_user():
    return user

with _override({get_db: _db_for_get_results(order, gr), get_optional_user: _fake_user}):
    ...
```

### Current `orders.py` Route Order

The file currently has these routes (maintain this order, add after `get_order`):
1. `POST ""` — create_order
2. `GET "/{order_id}"` — get_order  ← **insert get_results here**
3. `GET ""` — list_orders
4. `POST "/{order_id}/consent"` — create_consent
5. `GET "/{order_id}/consent"` — get_consent

### No Migration Needed

`genomic_results` table already exists from Story 1.2 migration `816697485877_initial_schema.py`. No Alembic changes required.

### Response Format Verified

`GenomicResultResponse` with `from_attributes=True` will serialize directly from the `GenomicResult` ORM object. FastAPI will emit:
```json
{
  "order_id": "<uuid>",
  "result_data": { "breed_composition": [...], "health_markers": [...], "trait_scores": {...}, "lineage": {...} },
  "created_at": "2026-05-21T00:00:00+00:00"
}
```

### Previous Story Learnings (from Stories 4.1 and earlier)

- **`uv run pytest`** not `python -m pytest` — project uses `uv` virtualenv
- **`_override` context manager** — already defined in `orders_test.py`; do NOT re-define
- **`AsyncMock` for `db.execute`** with call counter for multiple queries — established pattern
- **`expire_on_commit=False`** in `session.py` — objects remain usable after commit
- **`hmac.compare_digest`** for secret comparison — established in Story 4.1; not needed here (uses JWT/guest token auth, not header secret)
- **RFC 7807** — all `HTTPException` are globally converted by `exceptions.py`; just raise with `status_code` and `detail`

### JSONB `result_data` Shape Contract

```json
{
  "breed_composition": [{"species": "string", "percentage": 0.0}],
  "health_markers": [{"marker": "string", "status": "green|amber|red", "description": "string"}],
  "trait_scores": {"trait_name": 0.0},
  "lineage": {"paternal_line": "string", "maternal_line": "string"}
}
```

### Running Tests

```bash
# From genepaw-api/
uv run pytest app/api/v1/orders_test.py -v   # new tests only
uv run pytest                                  # full suite — must all pass
```

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No errors encountered. All 5 new tests passed on first run. Full suite: 111 passed in 5.43s.

### Completion Notes List

- Added `GET /api/v1/orders/{order_id}/results` to existing `orders.py` router — no new router file needed
- Auth logic copied verbatim from `get_order` (JWT owner check + guest token 3-branch pattern) — consistent with AC1/AC3
- New `app/schemas/genomic_result.py` with `GenomicResultResponse` — `from_attributes=True` for ORM serialization
- 2 new imports added to `orders.py`: `GenomicResult` model + `GenomicResultResponse` schema
- 5 tests cover: guest token 200, no-results 404, no-auth 401, wrong-token 403, JWT-owner 200
- Zero regressions: 106 pre-existing tests still pass (111 total)

## File List

**New:**
- `genepaw-api/app/schemas/genomic_result.py`

**Modified:**
- `genepaw-api/app/api/v1/orders.py` (add GET /{order_id}/results endpoint + 2 imports)
- `genepaw-api/app/api/v1/orders_test.py` (add 5 new tests)

## Change Log

| Date | Change |
|------|--------|
| 2026-05-21 | Story created |
| 2026-05-21 | Story implemented — all 4 tasks complete, 111/111 tests passing, status → review |
| 2026-05-21 | Code review complete — 0 patches, 13 deferred, 6 dismissed; status → done |
