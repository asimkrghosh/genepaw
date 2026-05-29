# Story 5.2: Frontend — Vet Partner Landing Page (`/vet-program`)

Status: review

## Story

As a veterinarian discovering GenePaw,
I want a dedicated landing page explaining the referral program and report depth,
so that I understand the value proposition and can register as a partner.

## Acceptance Criteria

- **AC1:** The page is accessible at `/vet-program` (React Router route already configured in `App.jsx` → `<VetPortal />`).
- **AC2:** The page contains these sections in order:
  - **Hero:** Headline targeting vets (e.g., "Clinical-grade genomics for your patients") with a brief value statement.
  - **Referral model:** How the referral program works — earn credit per kit ordered by referred clients; clinical PDF included with every Health + Breed and Complete Genome report.
  - **Report depth:** What the clinical PDF contains — structured tables, health markers with gene codes, breed composition, lineage data — positioned as complementary to clinical notes.
  - **Registration form:** Fields: Name, Email, Password, Clinic Name, Veterinary Registration Number, City, State (India dropdown), Phone. Submit calls `POST /api/v1/vets/register` via TanStack Query `useMutation`. On success, shows: "Welcome to GenePaw Vet Partners. We'll be in touch."
- **AC3:** The "For Veterinarians" footer link (in `shared.jsx`) already navigates to `/vet-program` — verify it works, no code change needed.
- **AC4:** Form validation: all fields required. Email format validated (`type="email"`). Phone: 10-digit Indian mobile format (starts with 6–9). On API error, displays the RFC 7807 `detail` field inline below the form.
- **AC5:** The page renders correctly on mobile (375px) — all sections stack vertically, form fields full-width.

## Tasks / Subtasks

- [x] Task 1: Build static sections in `VetProgramPage` — Hero, Referral Model, Report Depth (AC: 2)
  - [x] 1a. Add required imports at top of `VetPortal.jsx`: `useState` from `"react"`, `useMutation` from `"@tanstack/react-query"`, `Button, SectionTitle, Badge, INDIA_STATES` from `"./shared.jsx"`, `apiFetch` from `"./api.js"`
  - [x] 1b. Replace the `VetProgramPage` stub with a full component: Hero section (gradient bg, headline, value statement, CTA button scrolling to form), Referral Model section (3-step cards), Report Depth section (feature list)
  - [x] 1c. Verify visually at http://localhost:3000/vet-program — all 3 static sections render, mobile layout stacks correctly
- [x] Task 2: Add Registration Form with API integration (AC: 2, 4)
  - [x] 2a. Add `REGISTRATION_INITIAL` state constant and `useState` for `form`, `formError`, `success`
  - [x] 2b. Create `registerVet` mutation using `useMutation({ mutationFn, onSuccess })`
  - [x] 2c. Render the 8-field registration form inside a card below Report Depth section. State (India) uses `INDIA_STATES` dropdown from `shared.jsx`. All fields `w-full`.
  - [x] 2d. `handleSubmit` runs phone regex validation before calling `registerVet.mutate(form)`. Submit button disabled while `registerVet.isPending`.
  - [x] 2e. On success: replace form with success message. On error: show `registerVet.error?.message` inline.
- [x] Task 3: Verify AC3, AC5, and run dev server smoke test (AC: 3, 5)
  - [x] 3a. Check that clicking "For Veterinarians" in the footer navigates to `/vet-program` (already wired in `shared.jsx:259,280` — no code needed; visual confirm only)
  - [x] 3b. Resize browser to 375px width and verify all sections stack vertically, form fields are full-width, no horizontal scroll

## Dev Notes

### Files to Create / Modify

| File | Action | Notes |
|------|---------|-------|
| `src/VetPortal.jsx` | MODIFY | Replace `VetProgramPage` stub only; do NOT touch `VetReportPage`, `PageWrapper`, or `VetPortalPage` |

**Do NOT modify:** `src/App.jsx` (routes already configured), `src/shared.jsx` (footer links already wired), `src/api.js` (use `apiFetch` directly), `src/main.jsx`.

---

### Current VetPortal.jsx — Exact State Before Your Changes

```jsx
import { useLocation } from "react-router";
import { COLORS, Navbar, Footer } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";

function VetProgramPage() {
  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Vet Partner Program</h1>
        <p className="text-gray-500">Coming soon — partner with GenePaw to offer genomic testing to your clients.</p>
      </div>
    </div>
  );
}

function VetReportPage() {   // ← Story 5.3 — DO NOT TOUCH
  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Vet Report Access</h1>
        <p className="text-gray-500">Coming soon — veterinary professionals can access patient genomic reports here.</p>
      </div>
    </div>
  );
}

function PageWrapper({ children }) {   // ← DO NOT TOUCH
  const { user, logout } = useApp();
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar currentPage="vet" user={user} onLogout={logout} />
      {children}
      <Footer />
    </div>
  );
}

export default function VetPortalPage() {   // ← DO NOT TOUCH
  const { pathname } = useLocation();
  return (
    <PageWrapper>
      {pathname === "/vet-report" ? <VetReportPage /> : <VetProgramPage />}
    </PageWrapper>
  );
}
```

**Your task:** Replace `VetProgramPage` (lines 5–14) with the full implementation. Everything else stays identical.

---

### New Imports to Add

The `useLocation` import and `COLORS, Navbar, Footer` from `shared.jsx` are already there. Add to them:

```jsx
import { useState } from "react";
import { useLocation } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { COLORS, Navbar, Footer, Button, SectionTitle, Badge, INDIA_STATES } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { apiFetch } from "./api.js";
```

---

### TanStack Query v5 useMutation — Exact Pattern to Use

**CRITICAL:** This project uses `@tanstack/react-query` v5 (`^5.100.10`). The API differs from v4:

```jsx
// From OrderFlow.jsx — the established pattern in this codebase:
const registerVet = useMutation({
  mutationFn: (data) =>
    apiFetch("/api/v1/vets/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  onSuccess: () => setSuccess(true),
});

// Trigger:
registerVet.mutate(form);

// State flags (v5 names — NOT isLoading):
registerVet.isPending   // ← v5; isLoading was v4
registerVet.isSuccess
registerVet.isError
registerVet.error       // Error object — .message contains body.detail (see apiFetch below)
```

**Do NOT use `isLoading`** — it is `isPending` in v5. Using the wrong flag causes a silent bug where the submit button is never disabled.

---

### apiFetch Error Handling — What `error.message` Contains

```js
// From src/api.js:
const body = await resp.json().catch(() => ({ detail: resp.statusText }));
const err = new Error(body.detail ?? resp.statusText);
err.status = resp.status;
err.body = body;
throw err;
```

So `registerVet.error?.message` already contains the RFC 7807 `detail` string (e.g., "Email already registered"). Display it directly — no need to read `error.body.detail`.

---

### Form State & Validation Pattern

```jsx
const REGISTRATION_INITIAL = {
  name: "", email: "", password: "", clinic_name: "",
  registration_number: "", city: "", state: "", phone: "",
};

// State inside VetProgramPage:
const [form, setForm] = useState(REGISTRATION_INITIAL);
const [formError, setFormError] = useState(null);
const [success, setSuccess] = useState(false);

// Phone validation — 10-digit Indian mobile (starts with 6–9):
const PHONE_RE = /^[6-9]\d{9}$/;

function handleSubmit(e) {
  e.preventDefault();
  setFormError(null);
  if (!PHONE_RE.test(form.phone)) {
    setFormError("Phone must be a valid 10-digit Indian mobile number (starts with 6–9).");
    return;
  }
  registerVet.mutate(form);
}

// Input handler:
const handleChange = (e) =>
  setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
```

---

### State (India) Dropdown — Reuse INDIA_STATES

`INDIA_STATES` is already exported from `shared.jsx` (36 states/UTs array). Use it:

```jsx
<select name="state" value={form.state} onChange={handleChange} required
  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
  style={{ borderColor: COLORS.border }}>
  <option value="">Select State / UT</option>
  {INDIA_STATES.map((s) => (
    <option key={s} value={s}>{s}</option>
  ))}
</select>
```

---

### Shared Components — Props Reference

All from `shared.jsx`, already used in `CustomerPortal.jsx`, `OrderFlow.jsx`, `Results.jsx`:

```jsx
// Button — variant options: "primary" | "secondary" | "accent" | "ghost" | "danger"
<Button variant="primary" size="lg" onClick={...} disabled={registerVet.isPending}>
  {registerVet.isPending ? "Registering…" : "Register as Vet Partner"}
</Button>

// SectionTitle — centered heading block
<SectionTitle
  subtitle="PARTNER PROGRAM"
  title="Grow your practice with GenePaw"
  description="Join India's leading pet genomics platform and offer your clients cutting-edge insights."
/>

// Badge — small pill label
<Badge color={COLORS.primary}>Clinical PDF</Badge>
```

---

### Section Structure to Build

```
VetProgramPage
├── Hero section         — gradient bg (COLORS.gradientStart → COLORS.gradientEnd), full-width
│   ├── Subtitle badge
│   ├── H1 headline: "Clinical-grade genomics for your patients"
│   ├── Value statement paragraph
│   └── CTA Button scrolling to #vet-register form
├── Referral Model section  — white/light bg, 3-step cards
│   ├── SectionTitle
│   └── 3 cards: "Refer a Client" → "Client Orders Kit" → "You Earn Credit + Clinical PDF"
├── Report Depth section  — COLORS.bg, feature list
│   ├── SectionTitle
│   └── Feature items: Breed ancestry table, Health marker panel (with gene codes), 
│       Behavioral traits, Lineage data, "For Veterinary Use" notation
└── Registration Form section  — white card, id="vet-register"
    ├── Form heading: "Register as a Vet Partner"
    ├── 8 fields: Name, Email, Password, Clinic Name, Registration Number, City, State, Phone
    ├── formError display (local validation) + registerVet.error?.message (API error)
    ├── Submit button (disabled while isPending)
    └── Success message (replaces form when success===true)
```

---

### Styling Conventions — Match Existing Pages

- **Page wrapper div:** `className="min-h-screen pt-28 pb-20"` with `style={{ backgroundColor: COLORS.bg }}`
- **Hero gradient:** `style={{ background: \`linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})\` }}`
- **Section max-width:** `max-w-7xl mx-auto px-6` for full sections; `max-w-2xl mx-auto px-6` for narrow forms
- **Card:** `bg-white rounded-2xl shadow-lg p-8`
- **Grid:** `grid sm:grid-cols-3 gap-6` for 3-column card rows; `grid sm:grid-cols-2 gap-4` for form fields
- **Form input:** `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400`
- **Error text:** `text-red-500 text-sm mt-2`
- **Success card:** `bg-green-50 border border-green-200 rounded-2xl p-8 text-center`
- **Section padding:** `py-20` for sections, `py-32` for hero

---

### What Already Exists — DO NOT Recreate

| Already Exists | Location | Notes |
|----------------|----------|-------|
| `/vet-program` route | `App.jsx:91` | `<Route path="/vet-program" element={<VetPortal />} />` |
| `/vet-report` route | `App.jsx:92` | `<Route path="/vet-report" element={<VetPortal />} />` |
| Footer "For Veterinarians" links | `shared.jsx:259,280` | Both already navigate to `/vet-program` |
| `QueryClientProvider` | `main.jsx:9,13` | Already wraps the entire app — `useMutation` works without any setup |
| `INDIA_STATES` export | `shared.jsx:24-61` | 36 states/UTs |
| `COLORS` constants | `shared.jsx:6-21` | Use `COLORS.xxx`, never raw hex |
| `apiFetch` | `api.js:3` | Auto-adds JWT header; throws `Error` with `message = body.detail` on error |
| `Button`, `SectionTitle`, `Badge` | `shared.jsx:69-101` | All exported, reuse without modifications |

---

### Backend API — POST /api/v1/vets/register

Implemented in Story 5.1. The endpoint:

```
POST /api/v1/vets/register
Content-Type: application/json

{
  "name": "Dr. Priya Sharma",
  "email": "vet@clinic.com",
  "password": "secret123",
  "clinic_name": "Sharma Pet Clinic",
  "registration_number": "VCI-2023-001",
  "city": "Mumbai",
  "state": "Maharashtra",
  "phone": "9876543210"
}

→ 201: { "id": "<uuid>", "email": "vet@clinic.com" }
→ 409: { "detail": "Email already registered" }   (apiFetch throws Error with message="Email already registered")
→ 422: { "detail": "<validation message>" }
```

The form field `name` attributes must match these JSON keys exactly (snake_case).

---

### Critical Anti-Patterns — DO NOT Do These

- **Do NOT use `isLoading`** — it is `isPending` in TanStack Query v5. `isLoading` is always `undefined` in v5.
- **Do NOT touch `VetReportPage`** — Story 5.3 implements it; any change here would conflict.
- **Do NOT add a new route** — `/vet-program` is already in `App.jsx:91`.
- **Do NOT import from `react-router-dom`** — this project uses `react-router` (no `-dom` suffix).
- **Do NOT use `useNavigate` for form submission** — stay on the page and show success message in place.
- **Do NOT use `useEffect` + `useState` for the API call** — TanStack Query `useMutation` is required (AC2).
- **Do NOT hardcode hex colors** — always use `COLORS.xxx` constants.
- **Do NOT add a test file** — `project-context.md` says "No test framework configured — do not add tests unless explicitly requested."
- **Do NOT split into separate files** — all `VetPortal.jsx` content stays in one file.
- **Do NOT use `fetch()` directly** — use `apiFetch` from `./api.js`.

---

### Previous Story Learnings (from 5.1)

- `apiFetch` throws an `Error` whose `.message` is already `body.detail` — no need to parse `error.body`.
- The `vet` role exists in `UserRole` enum on the backend; the registration endpoint creates a user with `role=vet` automatically — no role field needed in the form.
- Backend stores `name` in `vet_profiles.name` (not in `users`); the form's `name` field maps to the vet's personal name.

---

### Story 5 Forward Compatibility

- Story 5.3 replaces `VetReportPage` — keep the stub unchanged now.
- Story 5.4 adds `generateClinicalPDF()` in `VetPortal.jsx` — do not add any PDF code now.
- The registration form success state is local (`useState`) — no redirect to a vet dashboard is needed now.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Playwright smoke test: 4 sections, 8 form fields, body.scrollWidth=375, all inputs 261/261px full-width at 375px. Build: 2746 modules, 0 errors.
- CSS warnings about `${COLORS.gradientStart}` in Tailwind gradient classes are pre-existing from `shared.jsx` Button component — not introduced by this story.

### Completion Notes List

- Replaced `VetProgramPage` stub (14 lines) with full landing page in `src/VetPortal.jsx`.
- Hero section: dark-green gradient background, h1 "Clinical-grade genomics for your patients", value statement, amber CTA button that smooth-scrolls to `#vet-register`.
- Referral Model section: 3 numbered cards on white bg — "Refer a Client", "Client Orders a Kit", "Earn Credit + Clinical PDF".
- Report Depth section: 5 feature cards on COLORS.bg — Breed Ancestry, Health Marker Panel, Behavioral Traits, Lineage Table, Vet Use Notation.
- Registration Form: 8 fields (name, email, password, clinic_name, registration_number, city, state, phone). State uses `INDIA_STATES` dropdown (36 entries from shared.jsx). TanStack Query v5 `useMutation` with `isPending` (not `isLoading`). Phone validated against `/^[6-9]\d{9}$/`. On success: form replaced by success message "Welcome to GenePaw Vet Partners. We'll be in touch." On error: `registerVet.error?.message` (already contains RFC 7807 detail from apiFetch) shown in red below form.
- `VetReportPage`, `PageWrapper`, `VetPortalPage` unchanged.
- Footer "For Veterinarians" links (shared.jsx:259,280) already navigate to `/vet-program` — AC3 verified, no code change needed.
- Mobile 375px: all 8 inputs are 261/261px (100% parent cell), body.scrollWidth=375 (no horizontal overflow).

### File List

- `src/VetPortal.jsx` — modified: replaced VetProgramPage stub with full vet partner landing page

### Change Log

- 2026-05-21: Implemented vet partner landing page (Story 5.2) — Hero, Referral Model, Report Depth sections + registration form wired to POST /api/v1/vets/register via useMutation v5

## Review Findings

- [ ] [Review][Decision] No client-side password minimum-length enforcement — spec is silent; placeholder says "Min. 8 characters" but `handleSubmit` has no `.length` check before calling `registerVet.mutate(form)` [`src/VetPortal.jsx`]
- [ ] [Review][Patch] `registerVet.error` not cleared on re-submit — call `registerVet.reset()` before `registerVet.mutate(form)` in `handleSubmit` so a stale error from a previous attempt disappears when user retries [`src/VetPortal.jsx`]
- [ ] [Review][Patch] `scrollIntoView` called without null guard on Hero CTA — `document.getElementById("vet-register")?.scrollIntoView(...)` should use optional chaining; if the element is somehow absent the call throws [`src/VetPortal.jsx`]
- [x] [Review][Defer] Formatted phone autofill (e.g. `+91 98765 43210`) fails `/^[6-9]\d{9}$/` regex with the generic phone error message — deferred, pre-existing constraint from the phone regex spec
- [x] [Review][Defer] Success card contains `<h3>You're in!</h3>` heading not mentioned in spec success message — deferred, cosmetic, does not conflict with AC2
