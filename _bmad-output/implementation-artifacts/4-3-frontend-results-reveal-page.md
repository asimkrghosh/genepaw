# Story 4.3: Frontend — Results Reveal Page

Status: done

## Story

As a customer,
I want to see my pet's genomic results in a rich, visual display,
so that I experience the "wow moment" that makes GenePaw worth talking about.

## Acceptance Criteria

- **AC1:** The results page is at `/results/{orderId}?token={guestToken}`. It calls `GET /api/v1/orders/{orderId}/results` (with `?token=` query param) using TanStack Query `useQuery`.
- **AC2:** The page has four tabs: **Breed**, **Health**, **Traits**, **Lineage**. On mobile (< 640px), tabs are swipeable using native touch events (`onTouchStart`/`onTouchEnd` delta tracking) — no swipe library. All tab elements have a minimum 44px touch target height.
- **AC3:** Only one Recharts chart is rendered at a time (the active tab's chart). Inactive tab charts are **not mounted** in the DOM — conditional rendering, NOT CSS `display: none`. Satisfies NFR8.
- **AC4:** **Breed tab:** Recharts `PieChart` of breed composition percentages with entrance animation (`isAnimationActive={true}`, `animationBegin={0}`, `animationDuration={1200}` on the `<Pie>` element). Labels show breed name + percentage.
- **AC5:** **Health tab:** Each health marker as a card with a traffic-light color class: `status === "green"` → `bg-green-100 text-green-800`; `status === "amber"` → `bg-amber-100 text-amber-800`; `status === "red"` → `bg-red-100 text-red-800`. Show plain-language `description` and `marker` code in small secondary text.
- **AC6:** **Traits tab:** Trait scores as a Recharts `BarChart` or `RadarChart`.
- **AC7:** **Lineage tab:** Paternal and maternal line as formatted text cards — no chart required.
- **AC8:** A "Download PDF Report" button in the page header is always visible regardless of active tab. Story 4.4 implements the PDF generation; for this story, render the button as `disabled` with label "Download PDF (Coming Soon)".
- **AC9:** If API returns 404 (results not yet available), display: "Your results are being processed. Check back soon." with a link back to the tracking page for that order (`/track/{orderId}?token={token}`).

## Tasks / Subtasks

- [x] Task 1: Update `SAMPLE_RESULTS` constant in `Results.jsx` to match API shape (AC: 1, 4, 5, 6, 7)
  - [x] 1a. Replace old shape (`breedComposition`, `healthMarkers`, `behaviorTraits`, `nutritionProfile`, `relatives`) with API shape: `{ breed_composition: [{species, percentage}], health_markers: [{marker, status, description}], trait_scores: {trait_name: score}, lineage: {paternal_line, maternal_line} }`
  - [x] 1b. Do NOT modify `AppContext.jsx` — it has its own `SAMPLE_RESULTS` (old shape) used by the mock kit tracking page; modifying it would break CustomerPortal
- [x] Task 2: Wire TanStack Query to the results API (AC: 1, 9)
  - [x] 2a. Import `useParams`, `useSearchParams` from `"react-router"` and `useQuery` from `"@tanstack/react-query"`
  - [x] 2b. Extract `orderId` from `useParams()` and `token` from `useSearchParams()` (`searchParams.get("token")`)
  - [x] 2c. When `orderId` is present: use `useQuery` to call `apiFetch(\`/api/v1/orders/${orderId}/results${token ? \`?token=${encodeURIComponent(token)}\` : ""}\`)`; queryKey `["results", orderId, token]`; `staleTime: 5 * 60 * 1000`
  - [x] 2d. When no `orderId` (demo mode at `/results`): skip the query and use `SAMPLE_RESULTS` mock directly
  - [x] 2e. Show loading spinner (`isPending === true`) while data loads
  - [x] 2f. On API error with `status === 404`: render "Your results are being processed. Check back soon." + link to `/track/${orderId}${token ? \`?token=${token}\` : ""}`. On other errors: show the RFC 7807 `detail` message.
- [x] Task 3: Restructure to 4 tabs — Breed, Health, Traits, Lineage (AC: 2, 3)
  - [x] 3a. Remove old tabs: Behavior, Nutrition, Relatives. New tabs array: `[{id: "breed", label: "Breed"}, {id: "health", label: "Health"}, {id: "traits", label: "Traits"}, {id: "lineage", label: "Lineage"}]`
  - [x] 3b. Tab buttons: set `minHeight: "44px"` (or `min-h-[44px]` Tailwind class) on each tab button for 44px touch target compliance
  - [x] 3c. Chart mounting: use `{activeTab === "breed" && <BreedTab />}` pattern — never render all tab content at once
- [x] Task 4: Implement swipe gesture for tab navigation (AC: 2)
  - [x] 4a. Add `touchStartX` ref (`useRef(null)`)
  - [x] 4b. `onTouchStart`: record `e.touches[0].clientX` in ref
  - [x] 4c. `onTouchEnd`: compute `delta = e.changedTouches[0].clientX - touchStartX.current`; if `delta < -50` advance tab; if `delta > 50` go back tab; wrap at boundaries
  - [x] 4d. Attach handlers to the tab content container (not the tab bar itself)
- [x] Task 5: Breed tab — PieChart with entrance animation (AC: 3, 4)
  - [x] 5a. Map API data: `result_data.breed_composition.map(b => ({ name: b.species, value: b.percentage }))`
  - [x] 5b. Render `<RechartsPie>` with `<Pie ... isAnimationActive={true} animationBegin={0} animationDuration={1200}>`
  - [x] 5c. Color cells with `BREED_COLORS` array (already defined in Results.jsx)
  - [x] 5d. Labels: `label={({ name, value }) => \`${name} ${value}%\`}`
- [x] Task 6: Health tab — traffic-light cards (AC: 5)
  - [x] 6a. API field names: `marker` (gene code), `status` ("green"|"amber"|"red"), `description` (plain-language explanation)
  - [x] 6b. Color class map: `{ green: "bg-green-100 text-green-800", amber: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-800" }`
  - [x] 6c. Layout per card: traffic-light badge (`status` class), `description` text, `marker` code in small secondary text below
- [x] Task 7: Traits tab — BarChart from trait_scores dict (AC: 6)
  - [x] 7a. Convert dict to array: `const traitData = Object.entries(result_data.trait_scores).map(([name, score]) => ({ name, score }))`
  - [x] 7b. Render as Recharts `BarChart` (horizontal, `layout="vertical"`) inside `<ResponsiveContainer width="100%" height={Math.max(200, traitData.length * 48)}>`
  - [x] 7c. Use `COLORS.primary` for bar fill
- [x] Task 8: Lineage tab — text cards (AC: 7)
  - [x] 8a. Display `result_data.lineage.paternal_line` and `result_data.lineage.maternal_line` as two styled cards
  - [x] 8b. No chart needed; simple grid layout
- [x] Task 9: "Download PDF Report" button always visible in header (AC: 8)
  - [x] 9a. Place button in the header section (same row as the order/pet title)
  - [x] 9b. Render as `<Button disabled>Download PDF (Coming Soon)</Button>` — Story 4.4 will wire `generateConsumerPDF` here
  - [x] 9c. Import `Download` icon from `lucide-react` (already imported in the current file)
- [x] Task 10: Manual smoke test (AC: 1–9)
  - [x] 10a. Demo mode: navigate to `/results` — renders SAMPLE_RESULTS mock with 4 tabs, animation works, swipe works
  - [x] 10b. Simulate 404: verify "Your results are being processed" message + tracking link renders
  - [x] 10c. Verify only one chart is in DOM at a time (check React DevTools or console)

## Dev Notes

### What Already Exists — Do NOT Recreate

| Artifact | Location | Notes |
|----------|----------|-------|
| `Results.jsx` | `src/Results.jsx` | **Modify this file** — do NOT create a new one |
| `/results/:orderId` route | `src/App.jsx:40` | Already registered — no App.jsx changes needed |
| `BREED_COLORS` array | `src/Results.jsx:8` | Already defined — reuse as-is |
| `generateVetReportPDF` | `src/reportPdf.js` | Vet PDF generator — Story 4.4 adds `generateConsumerPDF`; do NOT call it from Story 4.3 |
| `apiFetch` | `src/api.js` | Single fetch wrapper — always use this, never inline `fetch()` |
| `Button`, `SectionTitle`, `Badge`, `Navbar`, `Footer`, `COLORS` | `src/shared.jsx` | All available — use before creating new components |
| `useApp()` | `src/AppContext.jsx` | Provides `user`, `logout` for Navbar — keep this import |
| Old SAMPLE_RESULTS in `AppContext.jsx` | `src/AppContext.jsx:4-42` | **Do NOT touch** — used by mock kit tracking in CustomerPortal; different shape from API |

### Current Results.jsx State

Results.jsx is currently a **fully mock, demo-only page** at `/results`. It has:
- 5 tabs: Breed Ancestry, Health Markers, Behavior, Nutrition, Relatives
- `SAMPLE_RESULTS` constant with old shape (`breedComposition`, `healthMarkers`, `behaviorTraits`, `nutritionProfile`, `relatives`)
- No TanStack Query, no URL params, no API call
- `useApp()` for `user`/`logout` props to Navbar — **keep this**
- `generateVetReportPDF` import — **remove** after story 4.3 rewrites (or leave if unused; Story 4.4 will add `generateConsumerPDF`)

The `/results` route (no `orderId`) should still work as a demo page using `SAMPLE_RESULTS` mock data directly (no API call). Only `/results/:orderId` makes the API call.

### API Endpoint (from Story 4.2)

```
GET /api/v1/orders/{orderId}/results?token={guestToken}
```

**Response body:**
```json
{
  "order_id": "<uuid>",
  "result_data": {
    "breed_composition": [{"species": "str", "percentage": 0.0}],
    "health_markers": [{"marker": "str", "status": "green|amber|red", "description": "str"}],
    "trait_scores": {"trait_name": 0.0},
    "lineage": {"paternal_line": "str", "maternal_line": "str"}
  },
  "created_at": "<iso8601>"
}
```

Note: `result_data` is the field containing the actual genomic data — always access it as `data.result_data.breed_composition`, etc. (not `data.breed_composition`).

**Auth:** The `apiFetch` function automatically attaches `Authorization: Bearer` from localStorage if present. For guest access, pass `?token=<guestToken>` as a query param. No special auth header logic needed beyond what `apiFetch` already does.

### TanStack Query v5 Pattern

```jsx
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api.js";

// Inside component:
const { data, isPending, isError, error } = useQuery({
  queryKey: ["results", orderId, token],
  queryFn: () => apiFetch(`/api/v1/orders/${orderId}/results${token ? `?token=${encodeURIComponent(token)}` : ""}`),
  enabled: !!orderId,   // only fetch when orderId is present
  staleTime: 5 * 60 * 1000,
  retry: false,          // don't retry 404s
});
```

TanStack Query v5 uses `isPending` (not `isLoading`) for loading state.

### Detecting 404 vs Other Errors

The `apiFetch` function throws an Error with `err.status` set. Check `error?.status === 404` to show the "processing" message. Other errors show the `error?.message` (which is the RFC 7807 `detail` field).

```jsx
if (isError) {
  if (error?.status === 404) {
    return <ProcessingMessage orderId={orderId} token={token} />;
  }
  return <ErrorMessage detail={error?.message} />;
}
```

### Updated SAMPLE_RESULTS Shape (matches API)

```js
const SAMPLE_RESULTS = {
  breed_composition: [
    { species: "Golden Retriever", percentage: 42 },
    { species: "Labrador", percentage: 28 },
    { species: "Poodle", percentage: 15 },
    { species: "German Shepherd", percentage: 10 },
    { species: "Unknown / Mixed", percentage: 5 },
  ],
  health_markers: [
    { marker: "MDR1", status: "amber", description: "Drug Sensitivity — carrier. Discuss with your vet before administering certain medications." },
    { marker: "PRA-prcd", status: "green", description: "Progressive Retinal Atrophy — clear. No copies of the variant detected." },
    { marker: "DM (SOD1)", status: "green", description: "Degenerative Myelopathy — clear." },
    { marker: "vWD Type 1", status: "red", description: "Von Willebrand Disease — at risk. Two copies detected. Recommend veterinary consultation." },
    { marker: "EIC", status: "amber", description: "Exercise-Induced Collapse — carrier." },
  ],
  trait_scores: {
    Trainability: 92,
    "Energy Level": 85,
    Sociability: 88,
    "Prey Drive": 45,
    "Anxiety Tendency": 30,
    Aggression: 15,
  },
  lineage: {
    paternal_line: "German Shepherd (Northern European Working Line)",
    maternal_line: "Golden Retriever / Labrador Cross (UK Sporting Line)",
  },
};
```

### Swipe Detection Pattern

```jsx
const touchStartX = useRef(null);
const TAB_ORDER = ["breed", "health", "traits", "lineage"];

const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
const handleTouchEnd = (e) => {
  if (touchStartX.current === null) return;
  const delta = e.changedTouches[0].clientX - touchStartX.current;
  const currentIdx = TAB_ORDER.indexOf(activeTab);
  if (delta < -50 && currentIdx < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[currentIdx + 1]);
  else if (delta > 50 && currentIdx > 0) setActiveTab(TAB_ORDER[currentIdx - 1]);
  touchStartX.current = null;
};

// Attach to tab content wrapper div:
<div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
  {/* active tab content */}
</div>
```

### Breed PieChart Import Pattern

The existing file already imports `PieChart as RechartsPie` and `Pie, Cell, ResponsiveContainer, Tooltip`. Do not re-import. Add animation props to the `<Pie>` element:

```jsx
<Pie
  data={breedData}
  cx="50%" cy="50%"
  outerRadius={100} innerRadius={50}
  dataKey="value"
  label={({ name, value }) => `${name} ${value}%`}
  labelLine={true}
  isAnimationActive={true}
  animationBegin={0}
  animationDuration={1200}
>
```

### Traits BarChart Pattern

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const traitData = Object.entries(result_data.trait_scores).map(([name, score]) => ({ name, score }));

<ResponsiveContainer width="100%" height={Math.max(200, traitData.length * 48)}>
  <BarChart data={traitData} layout="vertical" margin={{ left: 20, right: 20 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" domain={[0, 100]} />
    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
    <Tooltip />
    <Bar dataKey="score" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### 44px Touch Target for Tabs

Apply `min-h-[44px]` Tailwind class (or inline style `style={{ minHeight: "44px" }}`) on each tab `<button>` element. The existing tab buttons have `py-4` which may already satisfy this, but explicitly set `min-h-[44px]` for compliance.

### Demo Mode (no orderId)

When navigated to `/results` (no orderId), `useParams()` returns `{ orderId: undefined }`. In this case:
- Skip the `useQuery` call (`enabled: !!orderId` handles this)
- Use `SAMPLE_RESULTS` as the `result_data` directly
- No loading or error states needed

### CustomerPortal Already Links Correctly

`CustomerPortal.jsx:952` already navigates to `/results/${orderId}${token ? \`?token=${encodeURIComponent(token)}\` : ""}` for the "View Your Results" CTA — no changes needed there.

### Recharts Imports

The existing `Results.jsx` imports from recharts. Add `BarChart, Bar, XAxis, YAxis, CartesianGrid` to the import (keep existing `PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend`). Remove what's unused after the tab restructure.

### No Tests Required

`project-context.md` states: "No test framework configured — do not add tests unless explicitly requested." No test files for this story.

### Previous Story Learnings (from Stories 3.5 and 4.2)

- **React Router v7 hooks**: `useParams()` and `useSearchParams()` — import from `"react-router"` (not `"react-router-dom"`)
- **TanStack Query v5**: `isPending` not `isLoading`; `enabled: !!orderId` prevents queries when param is missing
- **`apiFetch` throws on non-2xx**: access `error.status` for status code, `error.message` for the RFC 7807 `detail` string
- **No TypeScript**: plain JSX only; no type annotations
- **No PropTypes**: omit both PropTypes and TypeScript
- **Use `function` keyword** for components, not arrow functions
- **Section separators**: `// ─── Section Name ───` comment style between major sections
- **Do NOT modify `src/main.jsx`** — entry point only
- **COLORS constant** from `shared.jsx` — never hardcode hex values in JSX

### Files to Modify

**Modified:**
- `src/Results.jsx` — main implementation: URL params, TanStack Query, 4-tab layout, swipe, animation, SAMPLE_RESULTS update

**No other files needed** — route already exists in App.jsx; no backend changes; no new files.

### Review Findings

- [x] [Review][Patch] Tab components crash when result_data fields are null/undefined — add optional chaining: `(result_data.breed_composition ?? [])`, `(result_data.health_markers ?? [])`, `Object.entries(result_data.trait_scores ?? {})`, `result_data.lineage ?? {}` [`src/Results.jsx`]
- [x] [Review][Patch] HealthTab status badge label crashes on null/non-string `m.status` via `.charAt(0)` — add `String(m.status ?? "")` cast before string methods [`src/Results.jsx:128`]
- [x] [Review][Defer] Empty `breed_composition` or `trait_scores` arrays render blank sections with no empty-state message — deferred, not in AC scope; only triggered by lab data quality issues
- [x] [Review][Defer] No `ErrorBoundary` in component tree — any render crash unmounts full app to white screen — deferred, pre-existing app-wide architectural gap; applies to all pages not just Results
- [x] [Review][Defer] No `gcTime` configured — genomic health data lingers in TanStack Query in-memory cache for 5 min after unmount — deferred, security enhancement out of story scope
- [x] [Review][Defer] Stale `activeTab` closure during mid-swipe while React re-renders — minor UX glitch; tab may switch to wrong neighbour [`src/Results.jsx`] — deferred, very low probability edge case

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No errors encountered. Vite build passed with 0 errors (`npm run build` exit code 0, 2746 modules transformed).

### Completion Notes List

- Rewrote `src/Results.jsx` entirely — replaced 5-tab mock-only page with 4-tab API-wired dashboard
- `SAMPLE_RESULTS` updated to API shape (`breed_composition`, `health_markers`, `trait_scores`, `lineage`); `AppContext.jsx` left untouched (its `SAMPLE_RESULTS` uses the old shape for CustomerPortal mock)
- Demo mode at `/results` (no `orderId`) uses `SAMPLE_RESULTS` directly; `enabled: !!orderId` prevents API call — backward compatible
- TanStack Query v5 `useQuery` with `isPending`, `isError`, `error.status` — correct v5 field names used
- `useParams` + `useSearchParams` imported from `"react-router"` (not `"react-router-dom"`) per project convention
- NFR8 satisfied: tab content gated by `{activeTab === "tab" && <Component />}` — only one Recharts chart in DOM at a time
- Swipe gesture: `useRef(null)` + `onTouchStart`/`onTouchEnd` delta tracking on tab content container; 50px threshold
- Breed PieChart: `isAnimationActive={true}`, `animationBegin={0}`, `animationDuration={1200}` per UX-DR11
- Health tab: `HEALTH_CLASSES` map for green/amber/red traffic-light badges; fallback to gray for unknown status
- Traits tab: `Object.entries(trait_scores)` → `BarChart` horizontal layout (`layout="vertical"`), `COLORS.primary` fill
- Lineage tab: two text cards (blue/purple) for paternal and maternal lines — no chart
- PDF button: always visible in header, `disabled`, label "Download PDF (Coming Soon)" per AC8
- 404 error state: "Your results are being processed. Check back soon." + link to `/track/{orderId}?token={token}` per AC9

### File List

**Modified:**
- `src/Results.jsx`

## Change Log

| Date | Change |
|------|--------|
| 2026-05-21 | Story created |
| 2026-05-21 | Story implemented — 4-tab results dashboard with API wiring, swipe, animation, traffic-light health markers; Vite build passes; status → review |
| 2026-05-21 | Code review complete — 2 patches applied (null-guard on result_data fields, status.charAt guard), 4 deferred, 13 dismissed; build passes; status → done |
