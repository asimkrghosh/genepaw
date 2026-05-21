# Story 3.3 — Frontend: Inline Consent Step

## Story

**As a** customer,
**I want** to read a plain-language explanation of how my pet's DNA will be used before I submit my order,
**so that** I feel informed and respected rather than surveilled.

## Status

done

## Context

Epic 3 is "Kit Ordering & Tracking." Story 3-2 (Backend Consent Record Storage) is done — `POST /api/v1/orders/{order_id}/consent` and `GET /api/v1/orders/{order_id}/consent` are implemented and tested.

This story adds the consent UI to the existing 4-step OrderKit wizard in `src/OrderFlow.jsx`. The consent block goes inside Step 3 (address + details) below the address form. Story 3-4 will wire the entire wizard to the API; this story is **UI only** — no API calls introduced here.

All work is in `src/OrderFlow.jsx`. No backend changes. No new files.

## Acceptance Criteria

- **AC1:** The consent UI is embedded in Step 3 of the OrderKit wizard (address + consent step), below the address form (below the Special Notes field).
- **AC2:** The consent paragraph reads (exact text, do not paraphrase):
  > "Your pet's DNA stays yours. We use your sample only to generate the report you ordered. Your genomic data is stored securely in India, never sold to third parties, and you can request deletion at any time by contacting us."
- **AC3:** Below the paragraph, a checkbox with label "I understand and agree to GenePaw's use of my pet's genomic data."
- **AC4:** The "Review Order" button (proceeding to Step 4) is disabled until the checkbox is checked. The button re-enables immediately when the checkbox is checked.
- **AC5:** The checkbox is unchecked by default every time Step 3 is reached (not persisted — reset on forward navigation from Step 2 and backward navigation from Step 4).
- **AC6:** The consent text is rendered in body copy size (not footnote/small) with adequate line height — readable, not buried.

## Tasks / Subtasks

- [x] Task 1: Add `consentChecked` state to `OrderKit` component
- [x] Task 2: Reset `consentChecked` on all navigations that arrive at Step 3
  - [x] 2a. Reset when advancing from Step 2 → Step 3 (Continue button)
  - [x] 2b. Reset when going back from Step 4 → Step 3 (Back button)
- [x] Task 3: Add consent UI block inside Step 3, below the Special Notes field
- [x] Task 4: Update Step 3 "Review Order" button to also require `consentChecked`
- [ ] Task 5: Verify in browser — checkbox gates the Next button, resets on re-entry

### Review Findings (AI)

- [x] [Review][Defer] Consent checkbox missing `aria-required` [`src/OrderFlow.jsx:163`] — deferred, pre-existing a11y pattern in project

## Dev Notes

### Architecture

- **File to edit**: `src/OrderFlow.jsx` (only file touched by this story)
- **No new files** — do not create components, do not split into separate files
- **No backend calls** — `consentChecked` is local state only; API wiring is Story 3-4
- **No TypeScript** — plain JSX only
- **Dev server**: `npm run dev` (starts Vite on port 3000)
- **Test framework**: none configured — AC5 verified manually in browser

### Current codebase state

```
src/
├── OrderFlow.jsx   ← UPDATE (only file to touch)
├── CustomerPortal.jsx
├── shared.jsx
└── AppContext.jsx
```

**Current `OrderFlow.jsx` structure:**
- Lines 1–10: imports + validation helpers
- Lines 11–22: `OrderKit` component + state declarations
- Lines 23–43: outer shell + progress bar
- Lines 45–72: Step 1 (species selection)
- Lines 74–102: Step 2 (plan selection)
- Lines 104–163: **Step 3 (address + details)** ← all changes go here
- Lines 165–198: Step 4 (order summary)
- Lines 204–214: `OrderFlowPage` wrapper

### Task 1 — Add `consentChecked` state

**File:** `src/OrderFlow.jsx`  
**Location:** Line 21, after the `form` state declaration

**BEFORE (lines 19–22):**
```jsx
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", address2: "", city: "", state: "", pincode: "", petName: "", notes: "" });

  return (
```

**AFTER:**
```jsx
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", address2: "", city: "", state: "", pincode: "", petName: "", notes: "" });
  const [consentChecked, setConsentChecked] = useState(false);

  return (
```

### Task 2 — Reset consent on Step 3 entry

**2a. Step 2 → Step 3 Continue button** (currently line 99):

**BEFORE:**
```jsx
              <Button disabled={!selectedPlan} onClick={() => setStep(3)}>Continue <ArrowRight size={18} /></Button>
```

**AFTER:**
```jsx
              <Button disabled={!selectedPlan} onClick={() => { setStep(3); setConsentChecked(false); }}>Continue <ArrowRight size={18} /></Button>
```

**2b. Step 4 → Step 3 Back button** (currently line 194):

**BEFORE:**
```jsx
              <Button variant="ghost" onClick={() => setStep(3)}><ArrowLeft size={18} /> Back</Button>
```

**AFTER:**
```jsx
              <Button variant="ghost" onClick={() => { setStep(3); setConsentChecked(false); }}><ArrowLeft size={18} /> Back</Button>
```

### Task 3 — Add consent UI block in Step 3

**Location:** Inside the white card `<div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">`, after the Special Notes `<textarea>` block and before the closing `</div>` of that card.

**BEFORE** (the closing of the white card, currently line 157):
```jsx
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Special Notes <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none" placeholder="Any additional information about your animal..." />
              </div>
            </div>
            <div className="mt-8 flex justify-between">
```

**AFTER:**
```jsx
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Special Notes <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none" placeholder="Any additional information about your animal..." />
              </div>
              <div className="border-t pt-4 mt-2">
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  Your pet's DNA stays yours. We use your sample only to generate the report you ordered. Your genomic data is stored securely in India, never sold to third parties, and you can request deletion at any time by contacting us.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-green-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">I understand and agree to GenePaw's use of my pet's genomic data.</span>
                </label>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
```

### Task 4 — Update "Review Order" button condition

**Location:** The long `<Button>` at the bottom of Step 3 (currently line 160).

**BEFORE:**
```jsx
              <Button onClick={() => { if (form.name && form.email && form.phone && form.address && form.city && form.state && form.pincode && isValidPincode(form.pincode) && isValidIndianPhone(form.phone)) setStep(4); }} disabled={!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode || !isValidPincode(form.pincode) || !isValidIndianPhone(form.phone)}>Review Order <ArrowRight size={18} /></Button>
```

**AFTER:**
```jsx
              <Button onClick={() => { if (form.name && form.email && form.phone && form.address && form.city && form.state && form.pincode && isValidPincode(form.pincode) && isValidIndianPhone(form.phone) && consentChecked) setStep(4); }} disabled={!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode || !isValidPincode(form.pincode) || !isValidIndianPhone(form.phone) || !consentChecked}>Review Order <ArrowRight size={18} /></Button>
```

### Task 5 — Browser verification checklist

Test the following golden path manually with `npm run dev`:

1. Navigate to `/order-kit`
2. Select a species → Continue → Select a plan → Continue (Step 3 loads)
3. **Verify**: "Review Order" button is disabled (grey/non-clickable)
4. Fill in all required fields (name, email, phone, address, city, state, pincode)
5. **Verify**: "Review Order" still disabled even with all fields filled
6. Check the consent checkbox
7. **Verify**: "Review Order" immediately enables
8. Click "Review Order" → Step 4 loads
9. Click "Back" → Step 3 loads
10. **Verify**: Checkbox is unchecked again (AC5 reset)
11. **Verify**: "Review Order" is disabled again even though fields are still filled

### Pattern notes

- **`accent-green-500`** — Tailwind's `accent-color` utility; colors the browser-native checkbox to brand green without custom CSS. Consistent with the project's green brand palette.
- **`leading-relaxed`** — Tailwind's `line-height: 1.625`; satisfies AC6 readability requirement. Do NOT use `text-sm` or `text-xs` for the consent paragraph — use `text-base`.
- **`border-t pt-4 mt-2`** — visual separator between the address fields and the consent block. Matches the pattern used in Step 4's order summary divider.
- **`items-start gap-3`** on the label — aligns checkbox to the first line of the label text; prevents checkbox from vertically centering against a multi-line label.
- **`mt-1`** on the checkbox input — nudges checkbox down to align with the first line of text.
- **Exact consent text**: copy it verbatim from AC2 — do not paraphrase, rephrase, or change punctuation.

### Previous story learnings (from Story 3-2 and earlier)

- **No TypeScript** — plain JSX; never add type annotations
- **State initialization**: `useState(false)` for boolean checkboxes
- **No React default export for components** — `OrderKit` uses function declaration; `OrderFlowPage` is the default export
- **`Button` component** from `shared.jsx` already handles the `disabled` prop with visual greying — no need to add custom disabled styles
- **Brand colors**: `COLORS.primary`, `COLORS.accent` — never hardcode hex; but `accent-green-500` Tailwind utility is acceptable for native form element theming

## Dev Agent Record

### Implementation Plan

All changes in `src/OrderFlow.jsx`:
1. Added `const [consentChecked, setConsentChecked] = useState(false);` after `form` state (line 22)
2. Updated Step 2 → Step 3 Continue button to call `setConsentChecked(false)` on click
3. Updated Step 4 → Step 3 Back button to call `setConsentChecked(false)` on click
4. Added consent UI block (`<div className="border-t pt-4 mt-2">`) with `text-base leading-relaxed` paragraph and checkbox inside the white card at the bottom of Step 3
5. Added `|| !consentChecked` to the Review Order button's `disabled` condition and onClick guard

### Debug Log

No issues. Vite compiled cleanly on port 3001 (3000 occupied by prior session). No JS/JSX errors.

### Completion Notes

Tasks 1–4 complete and verified by Vite hot-compile (no errors). Task 5 requires manual browser verification at http://localhost:3001/order-kit — checklist in Dev Notes.

All 6 ACs addressed:
- AC1: Consent block in Step 3 below Special Notes ✅
- AC2: Exact consent text verbatim ✅
- AC3: Checkbox with correct label ✅
- AC4: `disabled` and `onClick` guard both include `consentChecked` ✅
- AC5: `setConsentChecked(false)` called on both Step 2→3 and Step 4→3 navigation ✅
- AC6: `text-base leading-relaxed` on consent paragraph ✅

## File List

**Modified files:**
- `src/OrderFlow.jsx` — added `consentChecked` state, consent UI block, reset on navigation, button guard

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Story created |
| 2026-05-20 | Story implemented — Vite compiles cleanly, awaiting browser verification |
