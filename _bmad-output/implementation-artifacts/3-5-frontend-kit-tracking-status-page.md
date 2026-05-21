# Story 3.5: Frontend — Kit Tracking Status Page

Status: done

## Story

As a customer who has placed an order,
I want to check the status of my sample as it moves through the lab pipeline,
so that I know what's happening without having to contact support.

## Acceptance Criteria

- **AC1:** A tracking page is accessible at `/track/{orderId}?token={guestToken}` (or `/track` with a lookup form if no URL params are present).
- **AC2:** The page calls `GET /api/v1/orders/{orderId}?token={guestToken}` and displays the current order status.
- **AC3:** The status pipeline is displayed as a visual progress stepper with these 5 stages in order: Order Placed → Kit Dispatched → Sample Received → Processing → Results Ready.
- **AC4:** The current status stage is highlighted; completed stages show as checked/filled; future stages show as upcoming/unfilled.
- **AC5:** When status is `results_ready`, a prominent CTA "View Your Results" links to the results page for that order (`/results/{orderId}?token={guestToken}`).
- **AC6:** If the order is not found or the guest token is invalid, displays: "Order not found. Please check your order reference."
- **AC7:** The page uses TanStack Query with a `staleTime` of 5 minutes — no auto-polling (the user must manually refresh to see updates).
- **AC8:** The page is mobile-optimised: the stepper renders vertically on viewports under 640px.
- **AC9:** The Step 4 success block in `OrderFlow.jsx` (Story 3.4) links to `/track/{orderId}?token={guestToken}` so customers can track their order after placement.

## Tasks / Subtasks

- [x] Task 1: Add `LiveTracking` component to `src/CustomerPortal.jsx` (AC: 1–8)
  - [x] 1a. Add `useSearchParams`, `useLocation` to the react-router import line
  - [x] 1b. Add `apiFetch` import from `./api.js`
  - [x] 1c. Add `useQuery` import from `@tanstack/react-query`
  - [x] 1d. Add `TRACKING_STAGES` module-level constant (5 stages with status key, label, and icon)
  - [x] 1e. Implement `LiveTracking` function component (lookup form when no orderId; stepper + API query when orderId present)
  - [x] 1f. Update `CustomerPortalPage` to render `LiveTracking` when `location.pathname.startsWith('/track')`, otherwise render the existing full home page sections
- [x] Task 2: Update `OrderFlow.jsx` success block to link to tracking page (AC: 9)
  - [x] 2a. Add "Track Your Order" Button in the success confirmation block that navigates to `/track/${orderResult.orderId}?token=${orderResult.guestToken}`
- [x] Task 3: Browser verification — golden path and error path

### Review Findings (Code Review 2026-05-21)

- [x] [Review][Patch] Missing `encodeURIComponent` on guest token — `OrderFlow.jsx` Track button and `LiveTracking` lookup form both call `navigate()` with raw token; if token contains `&`, `=`, or `#`, the query string is malformed and the tracking page receives null/truncated token [src/OrderFlow.jsx success block, src/CustomerPortal.jsx:849]
- [x] [Review][Patch] Progress bar shows 0% width when status is `pending` — formula `statusIndex / (TRACKING_STAGES.length - 1) * 100` yields 0/4*100=0% at first stage; visually the bar is empty but the first circle is green, which looks broken; fix: `((statusIndex + 1) / TRACKING_STAGES.length) * 100` → gives 20% at pending [src/CustomerPortal.jsx:892]
- [x] [Review][Defer] Navbar "Track Kit" link not highlighted on `/track/:orderId` — Navbar compares `activePath === l.path` (exact match on `/track`); fails on `/track/uuid`; `currentPage` prop is ignored by Navbar; fix requires Navbar refactor [src/shared.jsx] — deferred, pre-existing
- [x] [Review][Defer] `isError` branch shows "Order Not Found" for network failures — same message for 404/403 and transient network errors; minor UX issue; fix requires `apiFetch` to expose HTTP status codes — deferred, pre-existing
- [x] [Review][Defer] `statusIndex === -1` has no fallback UI for unknown/future API status values — all circles render grey with no indication; current backend has fixed status enum so low risk — deferred, pre-existing
- [x] [Review][Defer] "View Your Results" uses `navigate()` not a navigable `<Link>`, preventing right-click → open in new tab; consistent with codebase pattern throughout — deferred, pre-existing

## Dev Notes

### Architecture Overview

**No backend changes required.** `GET /api/v1/orders/{order_id}?token=` already exists from Story 3.1 and returns the exact fields needed. The endpoint returns HTTP 404 when not found and 403 when the guest token is wrong.

**Files to modify (only these two):**
- `src/CustomerPortal.jsx` — NEW `LiveTracking` component + update `CustomerPortalPage`
- `src/OrderFlow.jsx` — Add "Track Your Order" link in success block

**Do NOT create a new file.** Keep `LiveTracking` in `CustomerPortal.jsx` alongside the existing `KitTracking` mock.

---

### How Routing Works (No App.jsx Changes Needed)

`App.jsx` already has:
```jsx
<Route path="/track" element={<CustomerPortal />} />
<Route path="/track/:orderId" element={<CustomerPortal />} />
```

`CustomerPortalPage` uses `useParams()` for `orderId`. When `orderId` is undefined, it currently shows the full home page (even for `/track`). We need to distinguish between `/` and `/track` using `useLocation()`.

**New `CustomerPortalPage` logic (diff):**

**BEFORE** (current):
```jsx
export default function CustomerPortalPage() {
  const { orderId } = useParams();
  const { user, logout } = useApp();

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar currentPage="home" user={user} onLogout={logout} />
      {orderId ? (
        <div className="pt-20">
          <KitTracking prefilledId={orderId} />
        </div>
      ) : (
        <>
          <Hero />
          <SpeciesSection />
          <HowItWorks />
          <KitTracking />
          <PricingSection />
          <FAQSection />
        </>
      )}
      <Footer />
    </div>
  );
}
```

**AFTER** (with LiveTracking):
```jsx
export default function CustomerPortalPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { user, logout } = useApp();
  const isTrackPage = location.pathname.startsWith("/track");

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar currentPage={isTrackPage ? "track" : "home"} user={user} onLogout={logout} />
      {isTrackPage ? (
        <div className="pt-20">
          <LiveTracking />
        </div>
      ) : (
        <>
          <Hero />
          <SpeciesSection />
          <HowItWorks />
          <KitTracking />
          <PricingSection />
          <FAQSection />
        </>
      )}
      <Footer />
    </div>
  );
}
```

Note: `KitTracking` (mock demo) stays exactly as-is in the home page. Only `CustomerPortalPage` changes.

---

### Task 1 — `LiveTracking` Component

#### 1a + 1b + 1c — Imports

**Current top of `CustomerPortal.jsx`:**
```jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Search, ChevronDown, ... } from "lucide-react";
import { PieChart as RechartsPie, ... } from "recharts";
import { COLORS, formatINR, Button, SectionTitle, Badge, Navbar, Footer } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { generateVetReportPDF } from "./reportPdf.js";
```

**Updated imports (add to existing lines — do not remove anything):**
```jsx
import { useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronDown, ... } from "lucide-react";   // unchanged
import { PieChart as RechartsPie, ... } from "recharts";   // unchanged
import { COLORS, formatINR, Button, SectionTitle, Badge, Navbar, Footer } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { apiFetch } from "./api.js";
import { generateVetReportPDF } from "./reportPdf.js";
```

#### 1d — `TRACKING_STAGES` constant

Add after the existing constants near the top (after `BREED_COLORS`, before `FAQS`):

```jsx
const TRACKING_STAGES = [
  { status: "pending", label: "Order Placed", icon: PackageCheck },
  { status: "kit_dispatched", label: "Kit Dispatched", icon: Truck },
  { status: "sample_received", label: "Sample Received", icon: FlaskConical },
  { status: "processing", label: "Processing", icon: Microscope },
  { status: "results_ready", label: "Results Ready", icon: BarChart3 },
];
```

All 5 icons (`PackageCheck`, `Truck`, `FlaskConical`, `Microscope`, `BarChart3`) are **already imported** at the top of `CustomerPortal.jsx` — no new icon imports needed.

#### 1e — `LiveTracking` Component

Add this function **before** `CustomerPortalPage` (near the bottom of the file, after `FAQSection`):

```jsx
// ─── Live Tracking ───
function LiveTracking() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [formOrderId, setFormOrderId] = useState("");
  const [formToken, setFormToken] = useState("");

  const { data: order, isError, isLoading } = useQuery({
    queryKey: ["order", orderId, token],
    queryFn: () => apiFetch(`/api/v1/orders/${orderId}${token ? `?token=${encodeURIComponent(token)}` : ""}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!orderId,
    retry: false,
  });

  const statusIndex = TRACKING_STAGES.findIndex((s) => s.status === order?.status);

  if (!orderId) {
    return (
      <section className="py-24" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-lg mx-auto px-6">
          <SectionTitle subtitle="Track Your Kit" title="Order Status" description="Enter your order reference to check the status of your sample." />
          <div className="bg-white rounded-2xl p-8 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Order ID <span className="text-red-500">*</span></label>
              <input
                value={formOrderId}
                onChange={(e) => setFormOrderId(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Guest Token <span className="text-red-500">*</span></label>
              <input
                value={formToken}
                onChange={(e) => setFormToken(e.target.value)}
                placeholder="Guest token from your order confirmation"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 font-mono text-sm"
              />
            </div>
            <Button
              disabled={!formOrderId.trim() || !formToken.trim()}
              onClick={() => navigate(`/track/${formOrderId.trim()}?token=${formToken.trim()}`)}
              className="w-full"
            >
              <Search size={18} /> Track Order
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-3xl mx-auto px-6">
        <button onClick={() => navigate("/track")} className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-8 cursor-pointer">
          <ArrowLeft size={18} /> Track Another Order
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Status</h1>
        <p className="text-sm text-gray-500 mb-8 font-mono">{orderId}</p>

        {isLoading && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400">
            Loading order status…
          </div>
        )}

        {isError && (
          <div className="bg-red-50 rounded-2xl p-8 text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Order Not Found</h3>
            <p className="text-sm text-gray-500">Order not found. Please check your order reference.</p>
            <button onClick={() => navigate("/track")} className="mt-4 text-sm text-green-600 hover:underline cursor-pointer">
              Try a different order
            </button>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            {/* Desktop stepper — horizontal */}
            <div className="hidden sm:block relative mb-8">
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: statusIndex >= 0 ? `${(statusIndex / (TRACKING_STAGES.length - 1)) * 100}%` : "0%",
                    background: `linear-gradient(90deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})`,
                  }}
                />
              </div>
              <div className="relative flex justify-between">
                {TRACKING_STAGES.map((stage, i) => {
                  const isDone = i < statusIndex;
                  const isActive = i === statusIndex;
                  const StageIcon = stage.icon;
                  return (
                    <div key={stage.status} className="flex flex-col items-center text-center" style={{ width: "20%" }}>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${isDone || isActive ? "text-white shadow-lg" : "bg-gray-200 text-gray-400"} ${isActive ? "ring-4 ring-green-200" : ""}`}
                        style={isDone || isActive ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}
                      >
                        {isDone ? <Check size={20} /> : <StageIcon size={20} />}
                      </div>
                      <div className={`mt-3 text-xs font-semibold ${isDone || isActive ? "text-green-700" : "text-gray-400"}`}>{stage.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile stepper — vertical */}
            <div className="sm:hidden space-y-4 mb-8">
              {TRACKING_STAGES.map((stage, i) => {
                const isDone = i < statusIndex;
                const isActive = i === statusIndex;
                const StageIcon = stage.icon;
                return (
                  <div key={stage.status} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDone || isActive ? "text-white shadow-lg" : "bg-gray-200 text-gray-400"} ${isActive ? "ring-4 ring-green-200" : ""}`}
                        style={isDone || isActive ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}
                      >
                        {isDone ? <Check size={18} /> : <StageIcon size={18} />}
                      </div>
                      {i < TRACKING_STAGES.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${isDone || isActive ? "text-green-700" : "text-gray-400"}`}>{stage.label}</div>
                      {isActive && <div className="text-xs text-amber-600 font-medium">Current stage</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.status === "results_ready" && (
              <div className="mt-4 p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
                <Check size={32} className="text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Your Results Are Ready!</h3>
                <p className="text-sm text-gray-500 mb-4">Your genomic analysis is complete. View your full report now.</p>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/results/${orderId}${token ? `?token=${encodeURIComponent(token)}` : ""}`)}
                >
                  View Your Results <ArrowRight size={18} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
```

**Icons needed in `LiveTracking`:** `ArrowLeft`, `Check`, `AlertTriangle`, `ArrowRight`, `Search` — all already imported at the top of `CustomerPortal.jsx`. No new icon imports needed.

---

### Task 2 — Update `OrderFlow.jsx` Success Block

The success block (lines 263–269 of current `OrderFlow.jsx`) needs a "Track Your Order" link added.

**BEFORE** (current success block):
```jsx
{orderResult ? (
  <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
    <Check size={40} className="text-green-500 mx-auto mb-3" />
    <h3 className="text-lg font-bold text-gray-900 mb-1">Order Placed!</h3>
    <p className="text-sm text-gray-500 mb-3">Save your order reference to track your kit:</p>
    <div className="font-mono text-sm bg-white rounded-xl border border-gray-200 px-4 py-2 inline-block mb-2 select-all">{orderResult.orderId}</div>
    <p className="text-xs text-gray-400 mt-2">Guest token: <span className="font-mono select-all">{orderResult.guestToken}</span></p>
  </div>
) : ...}
```

**AFTER** (add Track Your Order button):
```jsx
{orderResult ? (
  <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
    <Check size={40} className="text-green-500 mx-auto mb-3" />
    <h3 className="text-lg font-bold text-gray-900 mb-1">Order Placed!</h3>
    <p className="text-sm text-gray-500 mb-3">Save your order reference to track your kit:</p>
    <div className="font-mono text-sm bg-white rounded-xl border border-gray-200 px-4 py-2 inline-block mb-2 select-all">{orderResult.orderId}</div>
    <p className="text-xs text-gray-400 mt-2">Guest token: <span className="font-mono select-all">{orderResult.guestToken}</span></p>
    <div className="mt-4">
      <Button
        variant="primary"
        onClick={() => navigate(`/track/${orderResult.orderId}?token=${orderResult.guestToken}`)}
      >
        Track Your Order <ArrowRight size={18} />
      </Button>
    </div>
  </div>
) : ...}
```

`navigate` is already in scope (imported and used in `OrderKit` for the "Back to Home" button at the top of the wizard).

---

### Task 3 — Browser Verification Checklist

Run `npm run dev` and test at `http://localhost:3000` (or 3001):

**Lookup form (no params):**
1. Navigate to `/track` — verify lookup form renders (no home page sections)
2. Submit with empty fields — button should be disabled
3. Enter any values and click "Track Order" — navigates to `/track/{id}?token={token}`

**Live tracking with valid order (requires backend running):**
1. Place an order via `/order-kit` — note the orderId and guestToken from success block
2. Click "Track Your Order" button — navigates to `/track/{orderId}?token={token}`
3. Verify the stepper shows "Order Placed" (pending status) as the current stage
4. Verify completed stages show a checkmark icon (none at `pending`)
5. Verify upcoming stages (Kit Dispatched, Sample Received, Processing, Results Ready) are grayed out
6. Verify no "View Your Results" CTA appears for `pending` status

**Error handling:**
7. Navigate to `/track/invalid-uuid?token=bad-token` — verify "Order not found. Please check your order reference." error block
8. Click "Try a different order" — returns to `/track` lookup form

**Mobile layout:**
9. Set viewport to 375px — verify stepper renders vertically (vertical lines between stages)
10. Set viewport to 768px — verify stepper renders horizontally

**Results CTA (requires backend + `results_ready` status):**
11. When order status is `results_ready`, verify "View Your Results" button appears
12. Click it — navigates to `/results/{orderId}?token={token}`

**Home page regression:**
13. Navigate to `/` — verify full home page renders including the mock `KitTracking` demo section

---

### Critical Rules to Follow

- **No TypeScript** — plain JSX only; no type annotations
- **No new files** — all changes in `src/CustomerPortal.jsx` and `src/OrderFlow.jsx`
- **Do NOT modify `App.jsx`** — the `/track` and `/track/:orderId` routes already exist and point to `CustomerPortal`
- **Do NOT remove `KitTracking`** — the mock demo still renders in the home page; only `CustomerPortalPage`'s render branch changes
- **`retry: false`** in useQuery — essential so 404 is shown immediately without 3 retry attempts
- **`enabled: !!orderId`** — skips the fetch on the lookup form (no orderId in params)
- **No `refetchInterval`** — staleTime 5 min, no auto-polling per AC7
- **`ArrowLeft` icon** is already imported in `CustomerPortal.jsx` (listed in the import block)
- **`useSearchParams`** is from `react-router` (same package, not `react-router-dom`)

### API Response Shape (from `OrderResponse` in `genepaw-api/app/schemas/orders.py`)

```json
{
  "id": "uuid",
  "user_id": "uuid | null",
  "species_id": "uuid",
  "package": "breed_id | health_breed | complete_genome",
  "status": "pending | kit_dispatched | sample_received | processing | results_ready",
  "address_city": "string",
  "address_state": "string",
  "address_pincode": "string",
  "full_name": "string | null",
  "phone": "string | null",
  "guest_token": "uuid | null",
  "created_at": "datetime"
}
```

Only `status` is needed for the stepper. All other fields are available if you want to show order details in a future enhancement.

### Error Cases

- `404` (order not found): `isError === true`; show "Order not found" message (AC6)
- `403` (invalid token): `isError === true`; same "Order not found" message — do not distinguish auth errors from not-found to prevent enumeration
- `401` (no token + no auth): `isError === true`; same message
- `isLoading === true`: show "Loading order status…" text

### Previous Story Learnings

- **Pattern for `useQuery` in this codebase** — `apiFetch()` throws on non-2xx, so `isError` fires on 404/403/401; `isLoading` is truthy only while the initial fetch is in-flight (not on refetch); `staleTime` is in ms
- **`useSearchParams` returns `[searchParams, setSearchParams]`** — destructure as `const [searchParams] = useSearchParams()` (not `useSearchParams.get(...)`)
- **`encodeURIComponent(token)`** — guest tokens are UUID strings and don't need encoding, but it's defensive and correct
- **`COLORS.gradientStart`/`COLORS.gradientEnd`** — use for the stepper progress bar and active stage circle, matching the existing `KitTracking` pattern exactly
- **`Button disabled` prop** — already handled visually by `shared.jsx`; no extra CSS needed
- **`useNavigate()` in `OrderKit`** — it's already called at the top of the function; just call `navigate(...)` where needed, no new import

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `ArrowLeft` was not in the original lucide-react import in `CustomerPortal.jsx` (only `ArrowRight` was). Added it alongside the other updates.
- Backend tests needed `uv run pytest` (not system `python -m pytest`) since `uv` manages the virtualenv.

### Completion Notes List

- **AC1–AC8:** `LiveTracking` component added to `src/CustomerPortal.jsx`. `CustomerPortalPage` uses `useLocation()` to detect `/track` path and render `LiveTracking` instead of the full home page. The existing mock `KitTracking` component is preserved intact on the home page.
- **AC2:** `useQuery` with `apiFetch` calls `GET /api/v1/orders/{orderId}?token=` — already implemented in Story 3.1.
- **AC3–AC4:** `TRACKING_STAGES` constant defines 5 stages; `statusIndex` drives `isDone`/`isActive` logic for each stage.
- **AC5:** `results_ready` renders a green CTA block with "View Your Results" linking to `/results/{orderId}?token=`.
- **AC6:** `isError` (covers 404, 403, 401) shows "Order not found. Please check your order reference."
- **AC7:** `staleTime: 5 * 60 * 1000`, `retry: false`, no `refetchInterval`.
- **AC8:** `hidden sm:block` horizontal stepper for ≥640px; `sm:hidden` vertical stepper for <640px.
- **AC9:** "Track Your Order" button added to `OrderFlow.jsx` Step 4 success block.
- **Build:** `npm run build` exits 0. **Backend tests:** 100/100 passing, no regressions.

### File List

**Modified:**
- `src/CustomerPortal.jsx`
- `src/OrderFlow.jsx`

## Change Log

| Date | Change |
|------|--------|
| 2026-05-21 | Story created |
| 2026-05-21 | Implemented: `LiveTracking` component in `CustomerPortal.jsx` (lookup form + 5-stage stepper + results CTA + error state); `CustomerPortalPage` updated to serve `/track` path; "Track Your Order" button added to `OrderFlow.jsx` success block |
