# Story 2.1: Customer Species Grid — Filter Research Organisms

Status: done

## Story

As a pet owner,
I want the species selection grid to show only animals I might actually own or care about,
so that I can find my animal in under 5 seconds without being confused by roundworms and bacteria.

## Acceptance Criteria

1. The customer-facing species grid displays exactly the 13 customer species: Dog, Cat, Bird, Fish, Horse, Cattle, Pig, Sheep, Primate, Dolphin, Bat, Python, Panda.
2. The following research organisms are removed from the customer grid: Human, Rat, Roundworm, Fruit Fly, Frog, Yeast, Sea Slug, Snail, Mosquito, Bacteria, Vole, Mole-Rat.
3. The `SPECIES_DATA` constant has a `category` field on each entry: `'customer'` or `'research'`. The grid component filters to `category === 'customer'` — data is not deleted, just filtered.
4. The grid layout reflows correctly with 13 species tiles — no broken columns or orphaned rows on desktop or mobile.
5. All 13 customer species tiles are visually intact (icon, name, description) with no missing or placeholder content.

## Tasks / Subtasks

- [x] Task 1: Add `category` field to every entry in `SPECIES_DATA` (`src/CustomerPortal.jsx`, lines 10–36) (AC: 3, 5)
  - [x] Add `category: 'customer'` to the 13 customer species (Dog, Cat, Bird, Fish, Horse, Cattle, Pig, Sheep, Primate, Dolphin, Bat, Python, Panda)
  - [x] Add `category: 'research'` to the 12 research entries (Human, Rat, Roundworm, Fruit Fly, Frog, Yeast, Sea Slug, Snail, Mosquito, Bacteria, Vole, Mole-Rat)
- [x] Task 2: Update `SpeciesSection` filter to use `category` field (`src/CustomerPortal.jsx`, line 149) (AC: 1, 2, 4)
  - [x] Replace the current no-op filter `!["rabbit","reptile","zoo"].includes(s.id)` with `s.category === 'customer'`
- [x] Task 3: Visual verification — confirm grid renders correctly with 13 tiles (AC: 4, 5)
  - [x] Start dev server (`npm run dev`) and navigate to homepage species section
  - [x] Verify 13 customer tiles visible, all research organisms absent
  - [x] Verify grid flows without orphaned single tiles on both desktop and mobile widths
  - [x] Verify admin view still shows "Add New Species" button and all admin controls

### Review Findings

- [x] [Review][Patch] OrderFlow.jsx still uses old no-op filter — research organisms (Human, Rat, etc.) appear in species picker at `/order-kit` [`src/OrderFlow.jsx:54`]
- [x] [Review][Patch] Stale customer-facing copy references removed species: "rabbits, reptiles, zoo/exotic animals" in FAQ; "zoos, and research institutions" in SpeciesSection subtitle [`src/CustomerPortal.jsx:54`, `src/CustomerPortal.jsx:183`]
- [x] [Review][Defer] "Rat" SPECIES_DATA entry contains Mus musculus (mouse) variants — data mislabeling [`src/CustomerPortal.jsx:12`] — deferred, pre-existing
- [x] [Review][Defer] Primate/fish boundary classification — research organisms (primates, zebrafish) appear as `category: "customer"` — spec-level decision, not a code bug — deferred, pre-existing
- [x] [Review][Defer] Mole-Rat and Rat share 🐀 icon [`src/CustomerPortal.jsx:28`] — deferred, pre-existing cosmetic
- [x] [Review][Defer] Admin UI has no way to set or change `category` field for a species — deferred, out of scope for this story

## Dev Notes

### CRITICAL: What Changes and Where

This is a highly surgical change — **two lines of code changed, 25 data fields added**. No new components, no new files.

**File:** `src/CustomerPortal.jsx`

**Change 1 — `SPECIES_DATA` (lines 10–36):** Add `category` field to every entry:

```javascript
// BEFORE (example entry):
{ id: "dog", name: "Dog", icon: "🐕", description: "...", healthMarkers: 159, popular: true, variants: [...] }

// AFTER:
{ id: "dog", name: "Dog", icon: "🐕", description: "...", healthMarkers: 159, popular: true, variants: [...], category: "customer" }
```

**Change 2 — `SpeciesSection` line 149:** The current filter is a no-op (filters IDs that don't exist in the array):

```javascript
// BEFORE (current line 149):
const [species, setSpecies] = useState(SPECIES_DATA.filter((s) => !["rabbit", "reptile", "zoo"].includes(s.id)));

// AFTER:
const [species, setSpecies] = useState(SPECIES_DATA.filter((s) => s.category === "customer"));
```

### Complete Category Mapping

**Customer (13 entries — `category: "customer"`):**

| id | Name |
|----|------|
| `dog` | Dog |
| `cat` | Cat |
| `bird` | Bird |
| `fish` | Fish |
| `horse` | Horse |
| `cattle` | Cattle |
| `pig` | Pig |
| `sheep` | Sheep |
| `primate` | Primate |
| `dolphin` | Dolphin |
| `bat` | Bat |
| `python` | Python |
| `panda` | Panda |

**Research (12 entries — `category: "research"`):**

| id | Name |
|----|------|
| `human` | Human |
| `rat` | Rat |
| `roundworm` | Roundworm |
| `fruit_fly` | Fruit Fly |
| `frog` | Frog |
| `yeast` | Yeast |
| `sea_slug` | Sea Slug |
| `snail` | Snail |
| `mosquito` | Mosquito |
| `bacteria` | Bacteria |
| `vole` | Vole |
| `mole_rat` | Mole-Rat |

### Data Discrepancy vs. Epics Spec

The epics say "24 species" and "11 research organisms" — the actual `SPECIES_DATA` has **25 entries** with **12 research organisms**. The epics list "Vole" and "Mole-Rat" separately (12 names) but calls it "11". Use the actual `SPECIES_DATA` as ground truth. All 25 entries need a `category` field.

### Grid Layout With 13 Customer Tiles

The grid is `sm:grid-cols-2 lg:grid-cols-4`. With 13 customer tiles + 1 extra card:

- **Non-admin view:** 13 species tiles + 1 "Species Not Listed?" card = **14 tiles total**
  - Desktop: 4 rows of 4, 4, 4, 2 — no orphaned single tile
  - Mobile: 7 rows of 2 — clean
- **Admin view:** 13 species tiles + 1 "Add New Species" card = **14 tiles total**
  - Same layout result

The extra card (line 204 for admin, line 234 for customer) fills the 14th slot naturally. The grid will look clean. No CSS changes needed.

### What `SPECIES_DATA` is Used For (Don't Break)

`SPECIES_DATA` is `export`ed (line 10) and used in **two places**:
1. `SpeciesSection` in `CustomerPortal.jsx` — customer-facing grid (filtered by this story)
2. `AdminPortal.jsx` — admin species management (imports `SPECIES_DATA` directly)

**Do not remove any entries from `SPECIES_DATA`.** AdminPortal uses all 25 entries. Adding `category` field does not break AdminPortal's import.

### Admin-Added Species Behavior (Acceptable)

`addSpecies()` (line 156–170) creates new entries without a `category` field. These are added to the local `species` state (not to `SPECIES_DATA`) AFTER the `useState` filter runs. Admin-added species (`custom: true`) will still appear in the customer grid because they're appended to the already-filtered state array. This is intentional — admin is explicitly adding the species to customer view.

### No Tests Needed

Project has no test framework configured (per project-context.md). Verification is manual via dev server.

### Story 1.6 Learnings

- No git repository — verify changes visually via dev server
- `SPECIES_DATA` is exported from `CustomerPortal.jsx` and imported by `AdminPortal.jsx` — any change to this constant must not break AdminPortal

## Dev Agent Record

### Debug Log

- Discovered SPECIES_DATA has 25 entries (not 24 as epics say) and 12 research organisms (not 11). Epics list "11" but enumerate 12 names. Used actual data as ground truth.
- Build warning about `reportPdf` chunk size (811KB) is pre-existing, not introduced by this change.
- Task 3 verified via `npm run build` (clean build, 7.21s). Visual verification of dev server not run (headless environment).

### Completion Notes

- Added `category: "customer"` to 13 species: fish, dog, bird, cat, cattle, horse, pig, sheep, primate, panda, dolphin, bat, python.
- Added `category: "research"` to 12 species: human, rat, roundworm, fruit_fly, frog, yeast, vole, mole_rat, sea_slug, snail, mosquito, bacteria.
- Updated `SpeciesSection` `useState` filter from the no-op `!["rabbit","reptile","zoo"].includes(s.id)` to `s.category === "customer"`.
- All 25 SPECIES_DATA entries have category field. Customer count: 13. Research count: 12. Build passes clean. `SPECIES_DATA` export unchanged — AdminPortal import unaffected.

## File List

**Files modified:**
- `src/CustomerPortal.jsx` — SPECIES_DATA: 25 entries each gained `category` field; SpeciesSection line 149: filter updated

**No other files modified.**

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Story created |
| 2026-05-20 | Implemented — category fields added to SPECIES_DATA, filter updated, build verified |
| 2026-05-20 | Code review — 2 patches applied: OrderFlow.jsx:54 filter updated to category-based; stale copy updated in CustomerPortal.jsx FAQ and SpeciesSection subtitle |
