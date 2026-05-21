# Story 2.3: India Address Forms — OrderKit & SpeciesSection

Status: done

## Story

As a customer,
I want to enter my delivery address using Indian fields (city, state, pincode),
so that the form makes sense for my location and I'm not asked for a zip code or country.

## Acceptance Criteria

1. The OrderKit address step (Step 3) contains exactly these fields: Full Name, Phone Number, Address Line 1, Address Line 2 (optional), City, State (dropdown of Indian states and UTs), Pincode (6-digit numeric).
2. The SpeciesSection address form (the "Species Not Listed?" inline order form in `CustomerPortal.jsx`) uses the same India-specific address field set: Address Line 1, Address Line 2 (optional), City, State (dropdown), Pincode.
3. No "Zip Code", "ZIP", "Country", or "State/Province" (US-style) labels appear in either form.
4. The State dropdown lists all 28 Indian states and 8 Union Territories (36 entries total), sourced from `INDIA_STATES` constant in `src/shared.jsx`.
5. Pincode field validates to exactly 6 digits (numeric only) — the "Review Order" button and the SpeciesSection "Place Order" button remain disabled until pincode passes validation.
6. Phone number field validates to a 10-digit Indian mobile number (optionally prefixed with `+91`) — both buttons remain disabled until phone passes validation.
7. Existing form validation logic is preserved — all previously required fields (Full Name, Email, Phone, Address Line 1, City, State, Pincode) still block progression if empty.

## Tasks / Subtasks

- [x] Task 1: Add `INDIA_STATES` constant to `src/shared.jsx` (AC: 4)
  - [x] Add `export const INDIA_STATES = [...]` after the `COLORS` constant — 36 entries (28 states + 8 UTs), sorted alphabetically; see complete list in Dev Notes

- [x] Task 2: Update OrderKit Step 3 address form in `src/OrderFlow.jsx` (AC: 1, 3, 5, 6, 7)
  - [x] Update `form` initial state (line ~20): remove `zip` and `country`; add `address2: ""`, `state: ""`, `pincode: ""`
  - [x] Import `INDIA_STATES` from `./shared.jsx` (update line 4 import)
  - [x] Rename "Shipping Address" label → "Address Line 1" (keep required)
  - [x] Add Address Line 2 input (optional, full width) immediately after Address Line 1
  - [x] Replace the 3-column `{City, ZIP Code, Country}` grid with `{City, State dropdown, Pincode}` — same `sm:grid-cols-3` layout
  - [x] State field: `<select>` populated from `INDIA_STATES`; first option is `<option value="">Select State</option>`
  - [x] Pincode field: text input, no special type needed
  - [x] Update step advance validation: replace `form.zip && form.country` with `form.state && form.pincode && isValidPincode(form.pincode) && isValidIndianPhone(form.phone)` — both the `onClick` guard and `disabled` prop
  - [x] Update Step 4 summary address display: `{form.address}{form.address2 ? `, ${form.address2}` : ''}, {form.city}, {form.state} – {form.pincode}`

- [x] Task 3: Update SpeciesSection inline order form in `src/CustomerPortal.jsx` (AC: 2, 3, 4, 5, 6, 7)
  - [x] Import `INDIA_STATES` from `./shared.jsx` (update line 5 import)
  - [x] Update `orderData` initial state (line ~153): add `address2: ""`
  - [x] Rename "Shipping Address" label → "Address Line 1"
  - [x] Add Address Line 2 input (optional, `sm:col-span-2`) after Address Line 1
  - [x] Change State text input → `<select>` with `INDIA_STATES` options (first option: `<option value="">Select State</option>`)
  - [x] Add `orderData.state` to the `submitOrder()` required field check (currently missing from validation)
  - [x] Add `isValidPincode(orderData.pincode)` and `isValidIndianPhone(orderData.phone)` guards to `submitOrder()` and to the Place Order button `disabled` prop

- [x] Task 4: Build verification (AC: all)
  - [x] Run `npm run build` — confirm clean build
  - [x] Confirm no "ZIP", "Zip Code", or "Country" labels remain in either form

### Review Findings

- [x] [Review][Defer] No inline validation error when phone/pincode format fails — button silently stays disabled; fix in a UX hardening pass [`src/OrderFlow.jsx:243`, `src/CustomerPortal.jsx:322`]
- [x] [Review][Defer] Leading-zero pincodes accepted (`/^\d{6}$/` allows `000000–099999`); harden to `/^[1-9]\d{5}$/` in future [`src/shared.jsx` (helpers in `OrderFlow.jsx:9`, `CustomerPortal.jsx:10`)]
- [x] [Review][Defer] `maxLength={6}` mobile paste bypass — pasting "400 001" shows "400 00", fails silently [`src/OrderFlow.jsx:233`, `src/CustomerPortal.jsx:313`]
- [x] [Review][Defer] CustomerPortal SpeciesSection Pincode wraps to new row in 2-col grid (City + State fill row, Pincode alone below); OrderFlow uses 3-col grid — cosmetic inconsistency [`src/CustomerPortal.jsx:300-314`]
- [x] [Review][Defer] Address Line 2 inlined with comma in Step 4 summary — no label or line break; staff cannot reliably split address1 from address2 [`src/OrderFlow.jsx:264`]

## Dev Notes

### Files to Modify (3 files)

1. `src/shared.jsx` — Add `INDIA_STATES` constant
2. `src/OrderFlow.jsx` — Update Step 3 form and Step 4 summary
3. `src/CustomerPortal.jsx` — Update SpeciesSection inline form

### Validation Helpers — Define at Module Level in Each File

Add these two helpers near the top of **both** `OrderFlow.jsx` and `CustomerPortal.jsx` (after imports, before component declarations):

```javascript
const isValidIndianPhone = (phone) => /^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));
const isValidPincode = (pin) => /^\d{6}$/.test(pin);
```

- Phone regex: matches 10-digit Indian mobile (starts with 6–9); allows optional `+91` prefix with space/dash.
- Pincode regex: exactly 6 numeric digits.

### INDIA_STATES Complete List (36 entries)

Add to `src/shared.jsx` as:
```javascript
export const INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
```

Place this immediately after the `COLORS` constant in `shared.jsx`.

### OrderFlow.jsx — Exact State Changes

**`form` state (line ~20):**
```javascript
// BEFORE:
const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", zip: "", country: "", petName: "", notes: "" });

// AFTER:
const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", address2: "", city: "", state: "", pincode: "", petName: "", notes: "" });
```

**Import line 4 — add `INDIA_STATES`:**
```javascript
// BEFORE:
import { COLORS, formatINR, Button, Navbar, Footer } from "./shared.jsx";

// AFTER:
import { COLORS, formatINR, Button, Navbar, Footer, INDIA_STATES } from "./shared.jsx";
```

**Step 3 address grid (replace ZIP Code + Country with State dropdown + Pincode):**

```jsx
{/* REMOVE this 3-col row: */}
<div className="grid sm:grid-cols-3 gap-4">
  <div>City input</div>
  <div>ZIP Code input</div>
  <div>Country input</div>
</div>

{/* REPLACE WITH: */}
<div className="grid sm:grid-cols-3 gap-4">
  <div>
    <label className="text-sm font-medium text-gray-700 block mb-1">City <span className="text-red-500">*</span></label>
    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
  </div>
  <div>
    <label className="text-sm font-medium text-gray-700 block mb-1">State <span className="text-red-500">*</span></label>
    <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white">
      <option value="">Select State</option>
      {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  </div>
  <div>
    <label className="text-sm font-medium text-gray-700 block mb-1">Pincode <span className="text-red-500">*</span></label>
    <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} maxLength={6} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
  </div>
</div>
```

**Address Line 2 (add after Address Line 1):**
```jsx
<div>
  <label className="text-sm font-medium text-gray-700 block mb-1">Address Line 2 <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
  <input value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
</div>
```

**Step 3 → Step 4 validation (the "Review Order" button):**
```jsx
// BEFORE:
<Button
  onClick={() => { if (form.name && form.email && form.phone && form.address && form.city && form.zip && form.country) setStep(4); }}
  disabled={!form.name || !form.email || !form.phone || !form.address || !form.city || !form.zip || !form.country}>

// AFTER:
<Button
  onClick={() => { if (form.name && form.email && form.phone && form.address && form.city && form.state && form.pincode && isValidPincode(form.pincode) && isValidIndianPhone(form.phone)) setStep(4); }}
  disabled={!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode || !isValidPincode(form.pincode) || !isValidIndianPhone(form.phone)}>
```

**Step 4 summary address line:**
```jsx
// BEFORE:
<div><span className="text-gray-400">Address:</span> <span className="text-gray-700 font-medium">{form.address || "—"}, {form.city} {form.zip}</span></div>

// AFTER:
<div><span className="text-gray-400">Address:</span> <span className="text-gray-700 font-medium">{form.address || "—"}{form.address2 ? `, ${form.address2}` : ""}, {form.city}, {form.state} – {form.pincode}</span></div>
```

### CustomerPortal.jsx — Exact State Changes

**`orderData` initial state (line ~153) — add `address2`:**
```javascript
// BEFORE:
const [orderData, setOrderData] = useState({ speciesName: "", petName: "", name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", description: "", plan: "Health + Breed" });

// AFTER:
const [orderData, setOrderData] = useState({ speciesName: "", petName: "", name: "", email: "", phone: "", address: "", address2: "", city: "", state: "", pincode: "", description: "", plan: "Health + Breed" });
```

**Import line 5 — add `INDIA_STATES`:**
```javascript
// BEFORE:
import { COLORS, formatINR, Button, SectionTitle, Badge, Navbar, Footer } from "./shared.jsx";

// AFTER:
import { COLORS, formatINR, Button, SectionTitle, Badge, Navbar, Footer, INDIA_STATES } from "./shared.jsx";
```

**`submitOrder()` validation (line ~173) — add state, pincode format, phone format:**
```javascript
// BEFORE:
if (orderData.speciesName && orderData.name && orderData.email && orderData.phone && orderData.address && orderData.city && orderData.pincode) {

// AFTER:
if (orderData.speciesName && orderData.name && orderData.email && isValidIndianPhone(orderData.phone) && orderData.address && orderData.city && orderData.state && isValidPincode(orderData.pincode)) {
```

**State text input → select dropdown:**
```jsx
// BEFORE:
<div>
  <label className="text-xs font-medium text-gray-500 block mb-1">State</label>
  <input value={orderData.state} onChange={(e) => setOrderData({ ...orderData, state: e.target.value })} placeholder="e.g., Maharashtra" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
</div>

// AFTER:
<div>
  <label className="text-xs font-medium text-gray-500 block mb-1">State <span className="text-red-500">*</span></label>
  <select value={orderData.state} onChange={(e) => setOrderData({ ...orderData, state: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400 bg-white cursor-pointer">
    <option value="">Select State</option>
    {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
  </select>
</div>
```

**Add Address Line 2 (optional) after Address Line 1 in the SpeciesSection form:**
```jsx
<div className="sm:col-span-2">
  <label className="text-xs font-medium text-gray-500 block mb-1">Address Line 2 <span className="text-gray-400 font-normal">(optional)</span></label>
  <input value={orderData.address2} onChange={(e) => setOrderData({ ...orderData, address2: e.target.value })} placeholder="Apartment, suite, landmark..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
</div>
```

**Place Order button disabled prop — add validation:**
```jsx
// Find the Place Order button and add disabled prop:
<Button size="sm" variant="accent" onClick={submitOrder}
  disabled={!orderData.speciesName || !orderData.name || !orderData.email || !isValidIndianPhone(orderData.phone) || !orderData.address || !orderData.city || !orderData.state || !isValidPincode(orderData.pincode)}>
  <PackageCheck size={14} /> Place Order
</Button>
```

### What NOT to Change

- `unlistedData` state and its form in OrderFlow.jsx Step 1 — out of scope; Story 2-4 removes this path
- Step 1, Step 2 of the OrderKit wizard — no address fields there
- `form.email`, `form.petName`, `form.notes` fields — unchanged
- The "Special Notes" textarea in Step 3 — unchanged
- Any other part of CustomerPortal.jsx outside the SpeciesSection inline order form
- `shared.jsx` beyond adding `INDIA_STATES`

### Story 2-2 Learnings

- No git repository — verify changes via `npm run build`
- `shared.jsx` exports are consumed by multiple files — any new export is purely additive (safe)
- All changes are surgical; test build passes before marking tasks complete

### No Tests

Project has no test framework configured (project-context.md). Verification is manual via `npm run build`.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log

### Completion Notes

- `INDIA_STATES` (36 entries: 28 states + 8 UTs) added to `src/shared.jsx` after the `COLORS` constant; exported as named const.
- `isValidIndianPhone` and `isValidPincode` helpers added at module level in both `OrderFlow.jsx` and `CustomerPortal.jsx`.
- OrderFlow.jsx Step 3: `form` state updated (removed `zip`, `country`; added `address2`, `state`, `pincode`); "Shipping Address" → "Address Line 1"; Address Line 2 field added (optional, full width); City/State dropdown/Pincode 3-col grid replaces City/ZIP/Country; "Review Order" button uses `isValidPincode` + `isValidIndianPhone` validation; Step 4 address summary uses new fields.
- CustomerPortal.jsx SpeciesSection: `orderData` state adds `address2`; "Shipping Address" → "Address Line 1"; Address Line 2 field added (`sm:col-span-2`); State `<input>` → `<select>` with INDIA_STATES; `submitOrder()` now requires `state`, validates phone and pincode format; Place Order button has matching `disabled` prop. Reset object in `setTimeout` also updated to include `address2`.
- No "ZIP", "Zip Code", or "Country" labels remain in either updated form (remaining "Shipping Address" in `unlistedData` form is out of scope per story — removed in Story 2-4).
- Build passes clean: ✓ built in 6.60s (only pre-existing reportPdf chunk size warning).

### File List

**Files modified:**
- `src/shared.jsx` — Added `INDIA_STATES` constant (36 entries) after `COLORS`
- `src/OrderFlow.jsx` — Step 3: form state, import, Address Line 1/2 fields, City/State/Pincode grid, Review Order validation; Step 4 summary address
- `src/CustomerPortal.jsx` — Import, `orderData` state, submitOrder validation, Address Line 1/2 fields, State dropdown, Place Order disabled prop

## Change Log

| Date | Change |
|------|--------|
| 2026-05-20 | Story created |
| 2026-05-20 | Implemented — INDIA_STATES added to shared.jsx; OrderFlow Step 3 updated to India address fields with validation; CustomerPortal SpeciesSection State dropdown + Address Line 2 + validation; build passes clean |
| 2026-05-20 | Code review — 0 patches, 5 deferred items; story marked done |
