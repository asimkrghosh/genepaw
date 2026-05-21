# Story 2.4 — Single Order Path: Remove Duplicate Form from SpeciesSection

## Story

**As a** customer browsing species on the home page,
**I want** the "Species Not Listed?" tile to take me directly to the Order Kit wizard with "Other Species" pre-selected,
**so that** there is only one ordering flow and I never encounter a duplicate inline form.

## Status

done

## Context

Epic 2 is polishing the India-market frontend. Stories 2-1 through 2-3 added species filtering, India localization, and full India address fields to both the SpeciesSection inline form and the OrderFlow wizard. This story eliminates the now-redundant inline form from `SpeciesSection` (CustomerPortal.jsx) and from OrderFlow Step 1 (when "other" is selected), unifying all ordering through the 4-step wizard.

## Acceptance Criteria

- **AC1:** `SpeciesSection` in `CustomerPortal.jsx` contains no inline order form — no `showOrderForm` state, no `orderData` form, no `submitOrder` function.
- **AC2:** The "Species Not Listed?" tile is still present as the final tile in the species grid.
- **AC3:** Clicking the tile navigates to `/order-kit` with `other` pre-selected via `location.state` (`{ species: { id: "other", name: "Other Species", icon: "❓", isCustom: true, variants: [] } }`).
- **AC4:** The OrderFlow wizard correctly handles `other` pre-selection — starts at Step 2, displays "Other Species / ❓" in the summary, and completes without errors.
- **AC5:** No duplicate CTAs or inline forms exist anywhere; the only ordering path for any species (including unlisted) is through the 4-step wizard.

## Tasks / Subtasks

- [x] Task 1: Clean up `CustomerPortal.jsx` — replace inline form with navigation tile
  - [x] 1a. Remove `showOrderForm`, `orderData`, `orderSubmitted` state declarations (lines 154, 156, 157)
  - [x] 1b. Remove `submitOrder()` function (lines 176–181)
  - [x] 1c. Remove `isValidIndianPhone` and `isValidPincode` helpers (lines 9–10) — only used by `submitOrder`
  - [x] 1d. Remove `INDIA_STATES` from the shared.jsx import (line 5) — only used by the inline form
  - [x] 1e. Replace the entire `{!isAdmin && (...)}` block (lines 237–326) with a simple navigation tile

- [x] Task 2: Clean up `OrderFlow.jsx` — remove inline form from Step 1 "other" path
  - [x] 2a. Remove `unlistedData` state (line 22)
  - [x] 2b. Remove `unlistedSubmitted` state (line 23)
  - [x] 2c. Remove `submitUnlistedOrder()` function (lines 25–29)
  - [x] 2d. Remove inline form block shown when `selectedSpecies?.id === "other" && !unlistedSubmitted` (lines 76–137)
  - [x] 2e. Remove success state block shown when `selectedSpecies?.id === "other" && unlistedSubmitted` (lines 139–147)
  - [x] 2f. Remove the `selectedSpecies?.id !== "other"` guard on the Continue button (lines 149–153) so Continue renders whenever any species is selected

- [x] Task 3: Build verification
  - [x] 3a. Run `npm run build` and confirm zero errors (pre-existing chunk size warning for reportPdf is acceptable)

## Dev Notes

### Architecture

- **No git repo** — all verification is done via `npm run build` (takes ~6s). There are no automated tests.
- **No TypeScript** — plain `.jsx` files throughout.
- **Monolithic component files**: all changes are in `src/CustomerPortal.jsx` and `src/OrderFlow.jsx`.
- **No new dependencies** — this story only removes code.

### How OrderFlow pre-selection works (MUST preserve)

```jsx
// OrderFlow.jsx lines 15-17
const preSelectedSpecies = location.state?.species || null;
const [step, setStep] = useState(preSelectedSpecies ? 2 : 1);
const [selectedSpecies, setSelectedSpecies] = useState(preSelectedSpecies || null);
```

When navigating to `/order-kit` with `state: { species: { id: "other", ... } }`, the wizard:
1. Sets `selectedSpecies` to `{ id: "other", name: "Other Species", icon: "❓", isCustom: true, variants: [] }`
2. Starts at **Step 2** (Plan selection) — skipping Step 1 entirely
3. Displays `❓ Other Species` in the Step 4 summary

This mechanism already works correctly. Do NOT touch it.

### Task 1e — Replacement tile for CustomerPortal.jsx

The entire block at lines 237–326:
```jsx
{!isAdmin && (
  !showOrderForm ? (
    <div onClick={() => setShowOrderForm(true)} ...>...</div>
  ) : orderSubmitted ? (
    <div ...>...</div>  {/* success card */}
  ) : (
    <div ...>...</div>  {/* inline form — 70+ lines */}
  )
)}
```

Replace with the following simple tile (identical visual appearance to the existing collapsed tile, same Tailwind classes, same `PackageCheck` icon):

```jsx
{!isAdmin && (
  <div
    onClick={() => navigate("/order-kit", { state: { species: { id: "other", name: "Other Species", icon: "❓", isCustom: true, variants: [] } } })}
    className="bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-gray-200 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1"
  >
    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
      <PackageCheck size={28} className="text-amber-600" />
    </div>
    <h3 className="text-lg font-bold text-gray-700 mb-1">Species Not Listed?</h3>
    <p className="text-sm text-gray-400">Order a kit for any unlisted species</p>
  </div>
)}
```

### Task 2f — Continue button change in OrderFlow.jsx

Current (lines 149–153):
```jsx
{selectedSpecies?.id !== "other" && (
  <div className="mt-8 flex justify-end">
    <Button disabled={!selectedSpecies} onClick={() => setStep(2)}>Continue <ArrowRight size={18} /></Button>
  </div>
)}
```

Replace with (remove the `!== "other"` guard — always show when a species is selected):
```jsx
<div className="mt-8 flex justify-end">
  <Button disabled={!selectedSpecies} onClick={() => setStep(2)}>Continue <ArrowRight size={18} /></Button>
</div>
```

Note: With the inline form removed, there is no longer any reason to hide the Continue button when `other` is selected. The `disabled={!selectedSpecies}` condition is sufficient.

### Task 1c/1d — Import cleanup in CustomerPortal.jsx

After removing `isValidIndianPhone`, `isValidPincode`, and `INDIA_STATES`, confirm none of these are used elsewhere in the file.

- `isValidIndianPhone` — only used in `submitOrder()` (being removed). Safe to delete.
- `isValidPincode` — only used in `submitOrder()` (being removed). Safe to delete.
- `INDIA_STATES` — only used in the inline form dropdown (being removed). Remove from import on line 5.

The `PackageCheck` icon import on line 3 is still used by the replacement tile. Do NOT remove it.

### Task 2 — Unused imports in OrderFlow.jsx after cleanup

After removing `submitUnlistedOrder`, `unlistedData`, `unlistedSubmitted`, and the two conditional blocks:
- `INDIA_STATES` on line 4 — still used in Step 3 (line 228). **Keep.**
- `isValidIndianPhone` / `isValidPincode` on lines 8–9 — still used in Step 3 (line 243). **Keep.**
- `PackageCheck` on line 3 — still used in the "Species Not Listed?" tile (line 69). **Keep.**

No import changes needed in `OrderFlow.jsx`.

### Step 4 summary display with "other"

In OrderFlow.jsx Step 4 (line 253–258), the summary shows:
```jsx
<span className="text-3xl">{selectedSpecies?.icon}</span>  // "❓"
<div className="font-bold text-gray-900">{selectedSpecies?.name} — {selectedPlan?.name}</div>  // "Other Species — Health + Breed"
```

This renders correctly as-is. No changes needed.

### Previous story learnings (from Story 2-3)

- Build command: `npm run build` run from `C:\Users\pc\_workarea\gene_annotation\GenePaw`
- Pre-existing warning: `reportPdf` chunk is 1,004 kB — this is expected and acceptable
- Surgical changes only — do not refactor, rename, or touch anything outside the scope of tasks
- The `INDIA_STATES` constant lives in `src/shared.jsx` and is still exported; this story only removes the *import* from CustomerPortal.jsx

## Dev Agent Record

### Implementation Plan

Pure deletion story — removed all dead code paths for the inline "other species" order form from both components, then replaced the trigger tile in CustomerPortal with a navigation call that uses the existing `location.state` pre-selection mechanism in OrderFlow.

### Debug Log

No issues. All edits were clean surgical deletions matching the exact strings in the story Dev Notes.

### Completion Notes

**CustomerPortal.jsx:**
- Removed `isValidIndianPhone` and `isValidPincode` module-level helpers (were only used by the inline form's `submitOrder`)
- Removed `INDIA_STATES` from the `shared.jsx` import (was only used by the inline form's State dropdown)
- Removed `showOrderForm`, `orderData`, `orderSubmitted` state from `SpeciesSection`
- Removed `submitOrder()` function
- Replaced the 90-line `{!isAdmin && (ternary...)}` block with a 10-line navigation tile; clicking it calls `navigate("/order-kit", { state: { species: { id: "other", ... } } })`

**OrderFlow.jsx:**
- Removed `unlistedData` and `unlistedSubmitted` state declarations
- Removed `submitUnlistedOrder()` function
- Removed the 62-line inline form block (conditional on `selectedSpecies?.id === "other" && !unlistedSubmitted`)
- Removed the 9-line success state block (conditional on `selectedSpecies?.id === "other" && unlistedSubmitted`)
- Changed Continue button: dropped `{selectedSpecies?.id !== "other" && (...)}` guard; now always renders (disabled until a species is selected)
- `INDIA_STATES`, `isValidIndianPhone`, `isValidPincode` kept — still used by Step 3

**Build:** `✓ built in 8.55s` — zero errors; only pre-existing reportPdf chunk size warning (811 kB).

**AC verification:**
- AC1 ✅ No inline form in SpeciesSection — all related state/functions removed
- AC2 ✅ "Species Not Listed?" tile still present as final item in the grid
- AC3 ✅ Tile navigates to `/order-kit` with `state: { species: { id: "other", ... } }`
- AC4 ✅ OrderFlow pre-selection mechanism (`location.state?.species`) unchanged; `other` starts at Step 2, displays `❓ Other Species` in summary
- AC5 ✅ Only one ordering path remains — the 4-step wizard

### Review Findings

- [x] [Review][Defer] `X` icon still in lucide-react import but unused after inline form removal [`src/CustomerPortal.jsx:3`] — deferred, cosmetic; remove in a future cleanup pass
- [x] [Review][Defer] Step 4 "Place Order" button has no `onClick` handler for any species [`src/OrderFlow.jsx:195`] — deferred, pre-existing; wizard payment step not yet wired (Epic 3)
- [x] [Review][Defer] `isCustom: true` (navigation state) vs `custom: true` (admin-added species) property name mismatch [`src/CustomerPortal.jsx:226`, `src/OrderFlow.jsx:57`] — deferred, pre-existing; neither property is read by the wizard flow
- [x] [Review][Defer] `location.state` survives browser Back/Forward — stale `other` pre-selection on `/order-kit` revisit [`src/OrderFlow.jsx:15`] — deferred, pre-existing for all species; address when order submission is wired in Epic 3

## File List

- `src/CustomerPortal.jsx`
- `src/OrderFlow.jsx`

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Story created |
| 2026-05-20 | Implemented: removed duplicate inline order forms from CustomerPortal SpeciesSection and OrderFlow Step 1; unified ordering through 4-step wizard |
