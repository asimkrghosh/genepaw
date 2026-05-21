# Story 2.2: India Localization — Footer & Contact

Status: done

## Story

As an Indian customer,
I want GenePaw's contact information to show a Bangalore address and Indian phone number,
so that the platform feels like a domestic product, not a foreign service with Indian pricing.

## Acceptance Criteria

1. The `Footer` component's contact section displays a Bangalore address: "GenePaw Genomics Pvt. Ltd., Koramangala, Bangalore – 560034, Karnataka, India".
2. The phone number displayed in the footer is a +91 Indian number: "+91 80 4567 8900".
3. The email contact uses a `@genepaw.com` domain — no USA-format phone numbers (no area codes formatted as `(xxx) xxx-xxxx`).
4. The "For Veterinarians" link is added to the footer bar (same row as Privacy Policy / Terms of Service / Cookie Policy). It navigates to `/vet-program`. This link is present even before the vet-program page is complete — that is acceptable.
5. No USA phone number formats or zip codes appear anywhere in the footer.

## Tasks / Subtasks

- [x] Task 1: Update Contact section in Footer (`src/shared.jsx`, lines 226–231) (AC: 1, 2, 3, 5)
  - [x] Change phone line from `+1 (800) 555-GENE` to `+91 80 4567 8900`
  - [x] Change address line from `San Francisco, CA` to `GenePaw Genomics Pvt. Ltd., Koramangala, Bangalore – 560034, Karnataka, India` — use `items-start` on this `<li>` (icon aligns top, not center, because text wraps)
  - [x] Verify email line (`support@genepaw.com`) is already AC-compliant — no change needed
- [x] Task 2: Add "For Veterinarians" link to footer bar and wire Company column link (`src/shared.jsx`, lines 219, 236–240) (AC: 4)
  - [x] In the footer bar flex row (line 236), insert a `<button>` for "For Veterinarians" before the existing Staff Login button; style as `text-gray-500 hover:text-gray-300 cursor-pointer bg-transparent border-0 p-0 text-sm`; `onClick={() => navigate("/vet-program")}`
  - [x] Wire the existing Company column "For Veterinarians" `<li>` (line 219) to `onClick={() => navigate("/vet-program")}` — it currently has no navigation action
- [x] Task 3: Visual verification (AC: 1–5)
  - [x] Run `npm run build` — confirm clean build
  - [x] Confirm no US phone number (`+1`, `555`, `(xxx)`) or zip code remains in the footer
  - [x] Confirm "For Veterinarians" appears in the footer bar alongside the other legal links

### Review Findings

- [x] [Review][Patch] Copyright reads "GenePaw Genomics Inc." but address says "GenePaw Genomics Pvt. Ltd." — entity mismatch [`src/shared.jsx:235`]
- [x] [Review][Patch] Footer bar inner link row has no `flex-wrap` — 5 items overflow on narrow mobile viewports [`src/shared.jsx:236`]
- [x] [Review][Patch] Long Bangalore address (75 chars, em-dash) can force horizontal scroll on xs screens — add `break-words` [`src/shared.jsx:229`]
- [x] [Review][Defer] Other Company column items (About Us, Our Science, For Breeders, Careers) have `cursor-pointer` but no onClick [`src/shared.jsx:217-221`] — deferred, pre-existing
- [x] [Review][Defer] "For Veterinarians" appears in both Company column and footer bar — deferred, intentional per AC4 and dev notes
- [x] [Review][Defer] `<li onClick>` for Company column link lacks `role="button"` / keyboard accessibility — deferred, pre-existing pattern for all Company items
- [x] [Review][Defer] Navigate-to-self no-op when already on `/vet-program` — deferred, general React Router behavior affecting all nav links

## Dev Notes

### CRITICAL: Only One File Changes

**File:** `src/shared.jsx` — the only file that needs modification.

No other files change. The Footer component is exported from `shared.jsx` and imported by:
- `CustomerPortal.jsx` (line 5, used at line 894)
- `AdminPortal.jsx` (line 3, used at line 1491)
- `VetPortal.jsx` (line 2, used at line 33)
- `Results.jsx` (line 4, used at line 305)
- `OrderFlow.jsx` (line 4, used at line 284)
- `StaffLogin.jsx` (line 4, used at line 108)

All 6 consumers get the updated footer automatically — no changes needed in any of them.

### Current Footer Structure (shared.jsx lines 188–246)

```
Footer()
  <footer bg-gray-900>
    <div max-w-7xl>
      <div grid lg:grid-cols-4>
        [Col 1] Brand — GenePaw logo + tagline
        [Col 2] Services — 5 nav links (Breed ID, Health Screening, etc.)
        [Col 3] Company — 5 links (About Us, Our Science, For Veterinarians*, For Breeders, Careers)
        [Col 4] Contact — Mail icon + email, Phone icon + phone, MapPin icon + address, Globe icon + website
      </div>
      <div border-t>  ← "footer bar"
        <div> © 2026 GenePaw Genomics Inc. All rights reserved. </div>
        <div flex gap-6>
          Privacy Policy | Terms of Service | Cookie Policy | [Staff Login button]
        </div>
      </div>
    </div>
  </footer>
```

*"For Veterinarians" in the Company column (line 219) is an `<li>` with no onClick — wire it up as part of Task 2.

### Exact Lines to Change

**Task 1 — Contact section (lines 226–231):**

```jsx
// CURRENT:
<ul className="space-y-3 text-sm text-gray-400">
  <li className="flex items-center gap-2"><Mail size={16} /> support@genepaw.com</li>
  <li className="flex items-center gap-2"><Phone size={16} /> +1 (800) 555-GENE</li>
  <li className="flex items-center gap-2"><MapPin size={16} /> San Francisco, CA</li>
  <li className="flex items-center gap-2"><Globe size={16} /> www.genepaw.com</li>
</ul>

// AFTER:
<ul className="space-y-3 text-sm text-gray-400">
  <li className="flex items-center gap-2"><Mail size={16} /> support@genepaw.com</li>
  <li className="flex items-center gap-2"><Phone size={16} /> +91 80 0000 0000</li>
  <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> GenePaw Genomics Pvt. Ltd., Agrahara Main Rd., Yelahanka, Bangalore – 560064, Karnataka, India</li>
  <li className="flex items-center gap-2"><Globe size={16} /> www.genepaw.com</li>
</ul>
```

Key: `items-start` + `mt-0.5 shrink-0` on the MapPin icon keeps it top-aligned and prevents it from stretching when the address wraps to two lines. The other three lines are single-line — keep `items-center`.

**Task 2 — Company column (line 219):**

```jsx
// CURRENT:
<li className="hover:text-green-400 cursor-pointer">For Veterinarians</li>

// AFTER:
<li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/vet-program")}>For Veterinarians</li>
```

**Task 2 — Footer bar (lines 236–240):**

```jsx
// CURRENT:
<div className="flex gap-6 text-sm text-gray-500">
  <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
  <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
  <span className="hover:text-gray-300 cursor-pointer">Cookie Policy</span>
  <button type="button" className="text-gray-600 hover:text-gray-400 cursor-pointer bg-transparent border-0 p-0 text-sm" onClick={() => navigate("/staff-login")}>Staff Login</button>
</div>

// AFTER:
<div className="flex gap-6 text-sm text-gray-500">
  <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
  <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
  <span className="hover:text-gray-300 cursor-pointer">Cookie Policy</span>
  <button type="button" className="hover:text-gray-300 cursor-pointer bg-transparent border-0 p-0 text-sm text-gray-500" onClick={() => navigate("/vet-program")}>For Veterinarians</button>
  <button type="button" className="text-gray-600 hover:text-gray-400 cursor-pointer bg-transparent border-0 p-0 text-sm" onClick={() => navigate("/staff-login")}>Staff Login</button>
</div>
```

"For Veterinarians" uses `text-gray-500` (same as the legal links) — it is a public link, not a hidden admin entry point. Staff Login stays at the lower-contrast `text-gray-600` since it's intentionally discreet per UX spec.

### Imports — No Changes Needed

All icons and hooks already imported at line 2 of `shared.jsx`:
```jsx
import { Dna, Menu, X, LogOut, Mail, Phone, MapPin, Globe } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
```

`navigate` is already called in the Footer function via `const navigate = useNavigate();` (line 190). No new imports or hooks needed.

### What NOT to Change

- Footer layout, grid structure, column headings — no changes
- Brand column (Col 1) — no changes
- Services column (Col 2) — no changes
- Email line (`support@genepaw.com`) — already AC3-compliant, no change
- Website line (`www.genepaw.com`) — no change
- Copyright year / company name — no change
- Privacy Policy, Terms of Service, Cookie Policy spans — no change
- Staff Login button — no change
- Any file other than `src/shared.jsx`

### Route Exists for /vet-program

`/vet-program` is already registered in `App.jsx` (line 41):
```jsx
<Route path="/vet-program" element={<VetPortal />} />
```

The footer link navigates to a live route — it will not 404.

### No Tests

Project has no test framework configured (project-context.md). Verification is manual via `npm run build`. Do NOT add tests.

### Story 2-1 Learnings

- No git repository — verify changes via `npm run build` (clean output = success)
- All changes are surgical; confirm build passes before marking tasks complete
- `shared.jsx` exports are used by multiple portal files — any import change must not break any of the 6 consumers

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log

### Completion Notes

- Phone updated: `+1 (800) 555-GENE` → `+91 80 4567 8900` (shared.jsx contact section).
- Address updated: `San Francisco, CA` → `GenePaw Genomics Pvt. Ltd., Koramangala, Bangalore – 560034, Karnataka, India`; MapPin `<li>` uses `items-start` + `mt-0.5 shrink-0` on icon for clean top-alignment when address wraps.
- Email (`support@genepaw.com`) unchanged — already AC3-compliant.
- "For Veterinarians" button added to footer bar before Staff Login; navigates to `/vet-program`; styled `text-gray-500` (same as legal links, not low-contrast like Staff Login).
- Company column "For Veterinarians" `<li>` wired to `onClick={() => navigate("/vet-program")}`.
- No new imports. No other files modified. Build passes clean (✓ 6.19s).

### File List

**Files modified:**
- `src/shared.jsx` — Footer component: Contact section (phone, address), footer bar (For Veterinarians button), Company column (For Veterinarians onClick)

**No other files modified.**

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Story created |
| 2026-05-20 | Implemented — phone and address updated to India; For Veterinarians link added to footer bar and Company column; build passes clean |
| 2026-05-20 | Code review — 3 patches applied: copyright "Inc." → "Pvt. Ltd."; `break-words` on address li; `flex-wrap` on footer bar link row |
