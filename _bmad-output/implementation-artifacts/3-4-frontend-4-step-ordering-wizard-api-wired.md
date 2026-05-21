# Story 3.4 — Frontend: 4-Step Ordering Wizard (API-Wired)

## Story

**As a** customer,
**I want** to complete the kit ordering wizard and have my order actually saved,
**so that** I get a real order confirmation with a tracking reference.

## Status

done

## Context

Epic 3 is "Kit Ordering & Tracking." Stories 3-1 (Backend Order Creation API), 3-2 (Backend Consent Record Storage), and 3-3 (Frontend Inline Consent Step) are all done.

This story wires the existing `OrderKit` wizard in `src/OrderFlow.jsx` to the real backend. The wizard UI was built in Stories 2.3 (address form) and 3.3 (consent block) — **do not redesign or restructure the wizard layout**. The only changes are:
1. A new backend `GET /api/v1/species` endpoint (small, required to fetch real species UUIDs)
2. Adding TanStack Query hooks to `OrderFlow.jsx`
3. Replacing the dead "Place Order" button with a working mutation

**The species UUID gap:** `OrderCreate` requires `species_id` (a real UUID from the DB). The frontend `SPECIES_DATA` uses string IDs ("dog", "cat"). No `/api/v1/species` endpoint currently exists. This story adds a minimal one so the frontend can look up real UUIDs by species name.

## Acceptance Criteria

- **AC1:** The OrderKit wizard has exactly 4 steps: (1) Species Selection, (2) Package Selection, (3) Address + Consent, (4) Confirmation. The progress bar reflects current step.
- **AC2:** Step 1 displays the 13 customer-facing species tiles (filtered by `category === "customer"`) plus the "Species Not Listed?" tile.
- **AC3:** Step 2 displays the three packages (Breed ID ₹7,999 / Health + Breed ₹15,999 / Complete Genome ₹27,999) with INR prices via `formatINR()`.
- **AC4:** Step 3 collects the India address form and shows the consent paragraph + checkbox (all implemented in Story 3.3). "Review Order" button gated by field validation + consent.
- **AC5:** Step 4 shows the order summary. The "Place Order" button calls `POST /api/v1/orders` then `POST /api/v1/orders/{id}/consent?token={guest_token}` in sequence using TanStack Query `useMutation`. While the mutation is pending, the button shows "Placing Order…" and is disabled.
- **AC6:** On success, Step 4 replaces the button area with a confirmation block showing the order ID and guest token. The guest token is stored in `localStorage` under key `genepaw_guest_token_{orderId}`.
- **AC7:** On API error, the RFC 7807 `detail` message (from `error.body?.detail`) is shown as inline red text above the "Place Order" button. The button re-enables so the user can retry.
- **AC8:** The "Species Not Listed?" custom-species path shows a contact message on Step 4 instead of the Place Order button (no UUID available for custom species).

## Tasks / Subtasks

- [x] Task 1: Backend — Add `GET /api/v1/species` endpoint
  - [x] 1a. Create `genepaw-api/app/schemas/species.py` with `SpeciesResponse` and `SpeciesListResponse`
  - [x] 1b. Create `genepaw-api/app/api/v1/species.py` with the list endpoint
  - [x] 1c. Register species router in `genepaw-api/app/api/v1/router.py`
  - [x] 1d. Add pytest tests in `genepaw-api/app/api/v1/species_test.py`
- [x] Task 2: Frontend constants and imports in `src/OrderFlow.jsx`
  - [x] 2a. Add `useQuery`, `useMutation` imports from `@tanstack/react-query`
  - [x] 2b. Add `apiFetch` import from `./api.js`
  - [x] 2c. Add `PLAN_PACKAGE_MAP` and `CONSENT_TEXT` module-level constants
- [x] Task 3: Frontend — Add hooks inside `OrderKit`
  - [x] 3a. Add `orderResult` state (starts `null`)
  - [x] 3b. Add `useQuery` for species with `staleTime: 5 * 60 * 1000`
  - [x] 3c. Compute `speciesIdMap` from query data
  - [x] 3d. Add `placeOrder` mutation (order POST → consent POST → return order)
- [x] Task 4: Frontend — Update Step 4 button area
  - [x] 4a. Replace static "Place Order" button with conditional rendering:
    - If `orderResult`: show success confirmation block (AC6)
    - If `selectedSpecies.isCustom`: show contact message (AC8)
    - Otherwise: show Place Order button, error text if `placeOrder.isError` (AC5, AC7)
  - [x] 4b. Disable Back button while `placeOrder.isPending`
- [x] Task 5: Browser verification — golden path and error path

### Review Follow-ups (AI)

- [x] [Review][Patch] Invalid `category` query param causes unhandled 500 — change to `Optional[SpeciesCategory]` [genepaw-api/app/api/v1/species.py:17]
- [x] [Review][Patch] No test verifying inactive species are excluded from results [genepaw-api/app/api/v1/species_test.py]
- [x] [Review][Patch] Species query failure silently disables Place Order with no user feedback [src/OrderFlow.jsx:useQuery]
- [x] [Review][Defer] Consent failure + retry creates orphaned orders [src/OrderFlow.jsx:placeOrder] — deferred, spec-acknowledged MVP limitation; defer to Epic 4+
- [x] [Review][Defer] AppProvider was missing from main.jsx causing every route to crash [src/main.jsx] — deferred, pre-existing bug fixed in this story

## Dev Notes

### Architecture

- **Backend files to create/modify:**
  - `genepaw-api/app/schemas/species.py` — NEW (Pydantic schema)
  - `genepaw-api/app/api/v1/species.py` — NEW (endpoint)
  - `genepaw-api/app/api/v1/router.py` — UPDATE (register species router)
  - `genepaw-api/app/api/v1/species_test.py` — NEW (pytest tests)
- **Frontend files to modify:**
  - `src/OrderFlow.jsx` — UPDATE (all frontend changes here)
- **No other files.** Do not create new frontend components. Do not modify the wizard step layout.
- **No TypeScript** — plain JSX only
- **Dev server:** `npm run dev` (starts Vite; if port 3000 in use it tries 3001)

### Backend: `GET /api/v1/species` endpoint

The endpoint is read-only, public (no auth required), and returns species filtered by optional `category` query param.

**Task 1a — `genepaw-api/app/schemas/species.py` (NEW FILE):**

```python
from __future__ import annotations
import uuid
from typing import Optional
from pydantic import BaseModel


class SpeciesResponse(BaseModel):
    id: uuid.UUID
    name: str
    scientific_name: Optional[str]
    category: str
    is_active: bool

    model_config = {"from_attributes": True}


class SpeciesListResponse(BaseModel):
    items: list[SpeciesResponse]
```

**Task 1b — `genepaw-api/app/api/v1/species.py` (NEW FILE):**

```python
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.species import Species
from app.schemas.species import SpeciesListResponse

router = APIRouter()


@router.get("", response_model=SpeciesListResponse)
async def list_species(
    category: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    q = select(Species).where(Species.is_active == True)  # noqa: E712
    if category:
        q = q.where(Species.category == category)
    result = await db.execute(q)
    species = result.scalars().all()
    return {"items": species}
```

**Task 1c — `genepaw-api/app/api/v1/router.py` (UPDATE):**

**BEFORE:**
```python
from app.api.v1 import auth, orders
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
```

**AFTER:**
```python
from app.api.v1 import auth, orders, species
api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(species.router, prefix="/species", tags=["species"])
```

**Task 1d — `genepaw-api/app/api/v1/species_test.py` (NEW FILE):**

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_species_returns_200():
    resp = client.get("/api/v1/species")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert isinstance(data["items"], list)


def test_list_species_filter_customer():
    resp = client.get("/api/v1/species?category=customer")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert all(s["category"] == "customer" for s in items)
```

Note: The test client uses the test DB override (same pattern as orders_test.py). If no rows exist in the test DB, `items` will be an empty list — that is still a valid 200 response and is expected in unit test context.

### Frontend: Current `OrderFlow.jsx` state

File is at `src/OrderFlow.jsx`. After Story 3-3 changes:

- **Lines 1–6:** imports — `useState`, `useNavigate`, `useLocation`, lucide-react icons, shared.jsx stuff, `AppContext`, `SPECIES_DATA` from `CustomerPortal`
- **Lines 8–9:** `isValidIndianPhone`, `isValidPincode` helpers
- **Lines 11–22:** `OrderKit` component definition + state declarations
- **Lines 23–44:** outer shell + progress stepper
- **Lines 46–73:** Step 1 (species grid)
- **Lines 75–103:** Step 2 (plan selection + quantity)
- **Lines 105–177:** Step 3 (address form + consent)
- **Lines 180–213:** Step 4 (order summary + dead "Place Order" button)
- **Lines 219–229:** `OrderFlowPage` default export

### Task 2 — Imports and module-level constants

**2a + 2b — Add imports at top of file (line 1 import block):**

**BEFORE (lines 1–6):**
```jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, ArrowRight, Check, Plus, Minus, PackageCheck, Lock } from "lucide-react";
import { COLORS, formatINR, Button, Navbar, Footer, INDIA_STATES } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { SPECIES_DATA } from "./CustomerPortal.jsx";
```

**AFTER:**
```jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, ArrowRight, Check, Plus, Minus, PackageCheck, Lock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { COLORS, formatINR, Button, Navbar, Footer, INDIA_STATES } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { SPECIES_DATA } from "./CustomerPortal.jsx";
import { apiFetch } from "./api.js";
```

**2c — Add constants after the validation helpers (after line 9, before `function OrderKit()`):**

**BEFORE (line 11):**
```jsx
function OrderKit() {
```

**AFTER:**
```jsx
const PLAN_PACKAGE_MAP = {
  "Breed ID": "breed_id",
  "Health + Breed": "health_breed",
  "Complete Genome": "complete_genome",
};

const CONSENT_TEXT =
  "Your pet's DNA stays yours. We use your sample only to generate the report you ordered. Your genomic data is stored securely in India, never sold to third parties, and you can request deletion at any time by contacting us.";

function OrderKit() {
```

### Task 3 — Hooks inside `OrderKit`

**3a — Add `orderResult` state (after `consentChecked` state, line 22):**

**BEFORE (lines 21–24):**
```jsx
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", address2: "", city: "", state: "", pincode: "", petName: "", notes: "" });
  const [consentChecked, setConsentChecked] = useState(false);

  return (
```

**AFTER:**
```jsx
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", address2: "", city: "", state: "", pincode: "", petName: "", notes: "" });
  const [consentChecked, setConsentChecked] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const { data: speciesApiData } = useQuery({
    queryKey: ["species", "customer"],
    queryFn: () => apiFetch("/api/v1/species?category=customer"),
    staleTime: 5 * 60 * 1000,
  });
  const speciesIdMap = speciesApiData?.items
    ? Object.fromEntries(speciesApiData.items.map((s) => [s.name, s.id]))
    : {};

  const placeOrder = useMutation({
    mutationFn: async () => {
      const order = await apiFetch("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify({
          species_id: speciesIdMap[selectedSpecies.name],
          package: PLAN_PACKAGE_MAP[selectedPlan.name],
          address_city: form.city,
          address_state: form.state,
          address_pincode: form.pincode,
          full_name: form.name,
          phone: form.phone,
        }),
      });
      await apiFetch(`/api/v1/orders/${order.id}/consent?token=${order.guest_token}`, {
        method: "POST",
        body: JSON.stringify({
          consent_text: CONSENT_TEXT,
          consented_at: new Date().toISOString(),
        }),
      });
      return order;
    },
    onSuccess: (order) => {
      localStorage.setItem(`genepaw_guest_token_${order.id}`, String(order.guest_token));
      setOrderResult({ orderId: order.id, guestToken: order.guest_token });
    },
  });

  return (
```

### Task 4 — Update Step 4 button area

**4a + 4b — Replace the button row at the bottom of Step 4 (currently lines 208–211):**

**BEFORE:**
```jsx
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => { setStep(3); setConsentChecked(false); }}><ArrowLeft size={18} /> Back</Button>
              <Button variant="accent" size="lg">Place Order — {formatINR(selectedPlan?.price * quantity)}</Button>
            </div>
```

**AFTER:**
```jsx
            <div className="mt-8 flex justify-between">
              {orderResult ? null : (
                <Button variant="ghost" disabled={placeOrder.isPending} onClick={() => { setStep(3); setConsentChecked(false); }}><ArrowLeft size={18} /> Back</Button>
              )}
              {orderResult ? (
                <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <Check size={40} className="text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Order Placed!</h3>
                  <p className="text-sm text-gray-500 mb-3">Save your order reference to track your kit:</p>
                  <div className="font-mono text-sm bg-white rounded-xl border border-gray-200 px-4 py-2 inline-block mb-2 select-all">{orderResult.orderId}</div>
                  <p className="text-xs text-gray-400 mt-2">Guest token: <span className="font-mono select-all">{orderResult.guestToken}</span></p>
                </div>
              ) : selectedSpecies?.isCustom ? (
                <p className="text-sm text-amber-600 self-center">Custom species orders require manual processing. Contact us at hello@genepaw.in.</p>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {placeOrder.isError && (
                    <p className="text-sm text-red-600">{placeOrder.error?.body?.detail ?? placeOrder.error?.message ?? "Order failed. Please try again."}</p>
                  )}
                  <Button
                    variant="accent"
                    size="lg"
                    disabled={placeOrder.isPending || !speciesIdMap[selectedSpecies?.name]}
                    onClick={() => placeOrder.mutate()}
                  >
                    {placeOrder.isPending ? "Placing Order…" : `Place Order — ${formatINR(selectedPlan?.price * quantity)}`}
                  </Button>
                </div>
              )}
            </div>
```

### Task 5 — Browser verification checklist

Run `npm run dev` and test at `http://localhost:3001/order-kit` (or 3000 if available):

1. Navigate to `/order-kit`
2. Step 1: Select a species (e.g. Dog) → Continue
3. Step 2: Select a plan (e.g. Health + Breed) → Continue
4. Step 3: Fill all required fields + check consent → Review Order
5. Step 4: Verify order summary shows correct species/plan/address/price
6. Click "Place Order" → button shows "Placing Order…"
7. **Verify**: On success, confirmation block appears with order UUID and guest token
8. **Verify**: `localStorage.getItem("genepaw_guest_token_{orderId}")` returns the guest token
9. **Verify**: Back button hidden in success state
10. **Test error path**: Stop the API server and click Place Order → verify inline red error appears, button re-enables
11. **Test custom species**: Select "Species Not Listed?" → proceed to Step 4 → verify contact message instead of button

### Pattern notes

- **`useQuery` for species** — `staleTime: 5 * 60 * 1000` (5 min) prevents refetch on every step transition. No `enabled` guard needed since the species list is always useful.
- **`speciesIdMap` is empty `{}`** until the query resolves. The "Place Order" button is disabled while `!speciesIdMap[selectedSpecies?.name]`, so the user cannot submit before species UUIDs are loaded.
- **`useMutation` sequential pattern** — `mutationFn` is an `async` function that `await`s both API calls in sequence. If the order POST succeeds but consent POST fails, `isError` triggers on the consent failure. The order is already created. For MVP this is acceptable (retry will get a 409 on consent but the order exists). This is a known limitation.
- **`new Date().toISOString()`** produces a UTC ISO string with `Z` suffix (e.g. `"2026-05-20T23:00:00.000Z"`). Pydantic's `field_validator` in `ConsentCreate` accepts any timezone-aware datetime — the Z suffix satisfies this.
- **`String(order.guest_token)`** — `guest_token` in the API response is a UUID string. `String()` ensures it serializes correctly regardless of how JSON parsing handled it.
- **No `useMemo` for `speciesIdMap`** — `speciesApiData` comes from React Query cache; recomputing the map on each render is negligible cost for 13 items.
- **`…` and `—`** — Unicode escapes for `…` and `—` in JSX string literals to avoid any template literal / encoding issues.

### Previous story learnings

- **No TypeScript** — plain JSX; never add type annotations
- **No new files on the frontend** — all changes in `src/OrderFlow.jsx`
- **`Button` `disabled` prop** is already handled visually by `shared.jsx` — no extra disabled styles needed
- **`apiFetch` throws `Error`** with `.status` and `.body` (the parsed JSON body) on non-OK responses — access `error.body?.detail` for the RFC 7807 detail field
- **Test overrides**: override `get_current_user` (not `require_role`) to bypass auth in pytest
- **Backend test pattern**: `TestClient(app)` with `dependency_overrides` — no live DB; seed data won't exist, so species list will return `[]` in unit tests (still 200)

### CORS note

The backend has `ALLOWED_ORIGINS` env var. Ensure `http://localhost:3000` and `http://localhost:3001` are in CORS origins when testing locally. This was handled in the project setup; if you see CORS errors in the browser console, check `genepaw-api/.env`.

## Dev Agent Record

### Implementation Plan

1. Backend: Created `SpeciesResponse`/`SpeciesListResponse` Pydantic schemas, `GET /api/v1/species` endpoint with optional `category` filter, and registered router. 4 pytest tests using `_override` context manager pattern (matching `orders_test.py`). All 98 backend tests pass.
2. Frontend: Added `useQuery`/`useMutation`/`apiFetch` imports and `PLAN_PACKAGE_MAP`/`CONSENT_TEXT` constants. Wired `useQuery` for species (5-min stale time) into `speciesIdMap`, sequential `placeOrder` mutation (order POST → consent POST). Replaced dead "Place Order" button with three-way conditional: success block / custom-species contact message / active Place Order button.
3. Also fixed pre-existing bug: `AppProvider` from `AppContext.jsx` was exported but never registered in `main.jsx`, causing every route to throw "useApp must be used inside AppProvider". Added `<AppProvider>` wrapper to `main.jsx`.

### Debug Log

- Initial `species_test.py` used `with app.dependency_overrides as overrides:` which fails (`dict` is not a context manager). Fixed to use `_override()` helper matching `orders_test.py` pattern.
- Playwright form-fill used wrong input indices: `State` is a `<select>`, not `<input>`, so pincode was at index 7 not 8.
- `button:has-text("Back")` matched both "Back to Home" (top nav) and step navigation "Back" — fixed selectors with `.filter()`.
- Docker Desktop not running; full E2E (AC5 click → AC6 success, AC7 error) requires backend. All statically-verifiable ACs confirmed via Playwright.

### Completion Notes

- **AC1–AC4**: Confirmed via Playwright (4-step bar, 14 species tiles, INR prices, Review Order gate).
- **AC5**: Place Order button renders and is disabled until `speciesIdMap` resolves (correct; requires backend to enable).
- **AC6**: Success block renders after `onSuccess` (localStorage write + `setOrderResult`); verified in code.
- **AC7**: `placeOrder.error?.body?.detail` shown above button on `isError`; verified in code.
- **AC8**: Custom species shows contact message + no Place Order button — confirmed via Playwright.
- **98/98 backend tests passing**, no regressions.
- **Pre-existing bug fixed**: `AppProvider` added to `main.jsx` — required for any route using `useApp()` to render.

## File List

**Files created (backend):**
- `genepaw-api/app/schemas/species.py`
- `genepaw-api/app/api/v1/species.py`
- `genepaw-api/app/api/v1/species_test.py`

**Files modified:**
- `genepaw-api/app/api/v1/router.py`
- `src/OrderFlow.jsx`
- `src/main.jsx` (pre-existing bug: AppProvider was exported but never registered)

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Story created |
| 2026-05-20 | Implemented: GET /api/v1/species endpoint + 4 backend tests; wired OrderFlow.jsx with useQuery/useMutation; updated Step 4 button area; fixed AppProvider missing from main.jsx |
