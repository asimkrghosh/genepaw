# Story 2.5 — Home Hero: India-Native Credibility Pass

## Story

**As a** first-time visitor,
**I want** the home page hero to feel like a credible Indian product,
**so that** I trust GenePaw enough to continue browsing rather than bouncing.

## Status

done

## Context

Epic 2 is the India-market frontend polish sprint. Stories 2-1 through 2-4 handled species filtering, localization, address forms, and the single order path. Story 2-5 is the final Epic 2 story — a light copy/content pass on the home page hero to add India-native trust signals. This is not a redesign; the hero layout and component structure are untouched.

## Acceptance Criteria

- **AC1:** The home hero section contains at least one India-specific trust signal: either a "Bangalore, India" location mention, an India-first positioning statement, or a reference to Indian breed expertise.
- **AC2:** The hero headline and subheadline do not reference competitor brand names (Embark, Wisdom Panel) — they make a positive claim about GenePaw.
- **AC3:** The hero CTA (primary button) leads directly to the species grid or the ordering wizard — no dead-end links.
- **AC4:** All prices visible on the home page or pricing section are formatted using `formatINR()` in INR (₹) — no USD amounts.
- **AC5:** The page renders without console errors or broken images on desktop and mobile viewports (375px and 1280px) — verified via `npm run build`.

## Tasks / Subtasks

- [x] Task 1: Add India trust signal to the Hero component in `CustomerPortal.jsx`
  - [x] 1a. Update the hero badge chip to include an India-first positioning statement
  - [x] 1b. Update the hero stats array to include a "Bangalore, India" location entry

- [x] Task 2: Verify AC2, AC3, AC4 (read-only confirmation — no changes needed)
  - [x] 2a. Confirm no competitor names appear in Hero, HowItWorks, PricingSection, or FAQs
  - [x] 2b. Confirm primary CTA "Order Your Kit" still calls `navigate("/order-kit")` (unchanged)
  - [x] 2c. Confirm PricingSection uses `formatINR(p.price)` — no hardcoded USD amounts

- [x] Task 3: Build verification
  - [x] 3a. Run `npm run build` and confirm zero errors

### Review Findings

- [x] [Review][Defer] Hero badge emoji `🇮🇳` has no `aria-label` [`src/CustomerPortal.jsx:85`] — deferred, pre-existing a11y pattern; all emoji spans in the codebase lack aria attributes; address in a future accessibility hardening pass

## Dev Notes

### Architecture

- **No git repo** — all verification is via `npm run build`.
- **No TypeScript** — plain `.jsx` files.
- **Single file change**: only `src/CustomerPortal.jsx` — the Hero component.
- **No new dependencies** — copy/content changes only.

### Current Hero component state (`CustomerPortal.jsx` lines 63–113)

```jsx
// ─── Hero ───
function Hero() {
  const navigate = useNavigate();
  const stats = [
    { value: "500K+", label: "Animals Tested" },
    { value: "1,500+", label: "Breeds Covered" },
    { value: "99.1%", label: "Accuracy Rate" },
    { value: "8+", label: "Species Supported" },
  ];

  return (
    <section ...>
      ...
      <div>
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <span className="text-amber-400 text-sm">✨</span>
          <span className="text-green-100 text-sm font-medium">Multi-Species Genomics Platform</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Decode Your Pet's <span className="text-amber-400">DNA Story</span>
        </h1>
        <p className="text-xl text-green-100 mb-8 leading-relaxed">
          From breed ancestry to health markers, behavioral traits to nutrition — unlock the complete genetic blueprint of any animal with GenePaw's advanced genomic sequencing.
        </p>
        <div className="flex flex-wrap gap-4 mb-12">
          <Button size="lg" variant="accent" onClick={() => navigate("/order-kit")}>
            Order Your Kit <ArrowRight size={20} />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate("/results")}>
            View Sample Results
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-green-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      ...
    </section>
  );
}
```

### Task 1a — Badge chip change

BEFORE:
```jsx
<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
  <span className="text-amber-400 text-sm">✨</span>
  <span className="text-green-100 text-sm font-medium">Multi-Species Genomics Platform</span>
</div>
```

AFTER:
```jsx
<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
  <span className="text-amber-400 text-sm">🇮🇳</span>
  <span className="text-green-100 text-sm font-medium">India's Multi-Species Genomics Platform</span>
</div>
```

This satisfies AC1 with an "India-first positioning statement" directly in the first visible element of the hero.

### Task 1b — Stats array update

Replace the generic "8+ Species Supported" stat with a Bangalore location entry:

BEFORE:
```jsx
const stats = [
  { value: "500K+", label: "Animals Tested" },
  { value: "1,500+", label: "Breeds Covered" },
  { value: "99.1%", label: "Accuracy Rate" },
  { value: "8+", label: "Species Supported" },
];
```

AFTER:
```jsx
const stats = [
  { value: "500K+", label: "Animals Tested" },
  { value: "1,500+", label: "Breeds Covered" },
  { value: "99.1%", label: "Accuracy Rate" },
  { value: "📍", label: "Bangalore, India" },
];
```

This adds a "Bangalore, India" location mention (AC1) while preserving the 4-stat layout unchanged. The `📍` emoji is consistent with the emoji-as-icon pattern used throughout the codebase (e.g., species icons).

### Task 2 — AC2/AC3/AC4 verification (no code changes needed)

**AC2 (no competitor names):** Current hero, HowItWorks, PricingSection, and FAQ text contain no mention of Embark, Wisdom Panel, or any competitor name. Confirm by visual scan — no change needed.

**AC3 (primary CTA):** The "Order Your Kit" button at line ~98 calls `navigate("/order-kit")` — leads to the ordering wizard. Already satisfied. No change needed.

**AC4 (INR formatting):** PricingSection renders prices via `{formatINR(p.price)}` from the `pricing` context array. OrderFlow Step 2 also uses `formatINR(p.price)`. No hardcoded USD amounts exist anywhere in the current codebase. Confirm by scan — no change needed.

### Previous story learnings (from Story 2-4)

- Build command: `npm run build` from `C:\Users\pc\_workarea\gene_annotation\GenePaw`
- Pre-existing warning: `reportPdf` chunk is ~811 kB — expected and acceptable
- Surgical changes only — do not refactor, rename, or touch anything outside story scope
- The `COLORS` constants drive all brand colors — do not hardcode hex values

### What NOT to change

- Hero layout, grid structure, animations, or CSS classes — this is copy/content only
- The `"View Sample Results"` secondary CTA — it goes to `/results` which shows mock results; this is intentional for the demo
- The headline "Decode Your Pet's DNA Story" — it is brand copy, not a competitor reference
- PricingSection, FAQSection, HowItWorks, KitTracking — out of scope

## Dev Agent Record

### Implementation Plan

Two surgical edits to the Hero component in `CustomerPortal.jsx`:
1. Badge chip: swapped `✨` for `🇮🇳` and prepended "India's" to the label text
2. Stats array: replaced the `{ value: "8+", label: "Species Supported" }` entry with `{ value: "📍", label: "Bangalore, India" }`

AC2/AC3/AC4 were verified by grep scan — no competitor names, CTA unchanged, all prices use `formatINR()`.

### Debug Log

No issues. Both edits were clean surgical replacements.

### Completion Notes

**CustomerPortal.jsx:**
- Badge chip: `✨` → `🇮🇳`, label "Multi-Species Genomics Platform" → "India's Multi-Species Genomics Platform" (line 85–86)
- Stats array: `{ value: "8+", label: "Species Supported" }` → `{ value: "📍", label: "Bangalore, India" }` (line 67)

**AC verification:**
- AC1 ✅ Hero badge now reads "India's Multi-Species Genomics Platform" (India-first positioning); hero stats now show "📍 Bangalore, India"
- AC2 ✅ grep across `src/` found zero matches for "Embark" or "Wisdom Panel"
- AC3 ✅ Primary CTA `Button` at line 95 calls `navigate("/order-kit")` — unchanged
- AC4 ✅ PricingSection (CustomerPortal.jsx:734) and OrderFlow all use `formatINR(p.price)` — no hardcoded USD
- AC5 ✅ `npm run build` completed `✓ built in 6.92s` — zero errors; only pre-existing reportPdf chunk size warning (811 kB)

## File List

- `src/CustomerPortal.jsx`

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Story created |
| 2026-05-20 | Implemented: added India trust signals to Hero badge and stats; all ACs verified; build clean |
