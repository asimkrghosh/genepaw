---
stepsCompleted: ['step-01-document-discovery', 'step-02-prd-analysis', 'step-03-epic-coverage-validation', 'step-04-ux-alignment', 'step-05-epic-quality-review', 'step-06-final-assessment']
documentsInventoried:
  prd: '_bmad-output/planning-artifacts/prd.md'
  architecture: '_bmad-output/planning-artifacts/architecture.md'
  epics: '_bmad-output/planning-artifacts/epics.md'
  ux: '_bmad-output/planning-artifacts/ux-design-specification.md'
  prdValidation: '_bmad-output/planning-artifacts/prd-validation-report.md'
status: 'complete'
completedAt: '2026-05-19'
---

# Implementation Readiness Assessment Report

**Date:** 2026-05-19
**Project:** GenePaw
**Assessor:** BMad Implementation Readiness Check

---

## Document Inventory

| Document Type | File | Status |
|---|---|---|
| PRD | `_bmad-output/planning-artifacts/prd.md` | Found (whole) |
| PRD Validation Report | `_bmad-output/planning-artifacts/prd-validation-report.md` | Found (supplementary) |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | Found (whole) |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` | Found (whole) |
| UX Design | `_bmad-output/planning-artifacts/ux-design-specification.md` | Found (whole) |

**Duplicate Issues:** None
**Missing Documents:** None

---

## PRD Analysis

### Document Structure Note

The PRD (`prd.md`) is an executive summary only (48 lines). The formal requirements were developed and documented during the epics creation phase; the canonical requirements list lives in `epics.md` under "Requirements Inventory." This is an intentional non-standard structure — epics.md is the single source of truth for requirements.

### Functional Requirements Extracted

| # | Requirement |
|---|---|
| FR1 | 4-step ordering wizard: species selection → package selection → India address + consent → confirmation |
| FR2 | Three genomic testing packages at fixed INR prices: Breed ID (₹7,999), Health + Breed (₹15,999), Complete Genome (₹27,999) |
| FR3 | Customer-facing species grid displays only 13 customer-relevant species |
| FR4 | Order confirm step collects explicit genomic data consent via plain-language paragraph and opt-in checkbox; submission disabled until checked |
| FR5 | Kit tracking status updates (kit_dispatched → sample_received → processing → results_ready) |
| FR6 | Genomic results display: breed composition (charts), health markers (traffic-light coded), **behavioral traits, nutrition profiles**, and lineage data |
| FR7 | Generate and allow download of consumer-facing PDF report |
| FR8 | Veterinarian partner landing page (`/vet-program`) |
| FR9 | Vet report showcase page (`/vet-report`) with clinical PDF download trigger |
| FR10 | JWT authentication with three RBAC roles: Customer, Staff, Veterinarian |
| FR11 | Staff portal accessible only via discreet "Staff Login" text link in footer |
| FR12 | Admin portal: staff can view/manage all orders, sample pipeline status, full species list |
| FR13 | India-specific address fields: city, state, pincode (no zip/country) |
| FR14 | All prices displayed in INR via `formatINR()` helper |
| FR15 | Lab results webhook endpoint (`POST /api/v1/webhook/lab-results`) validated by shared secret header |
| FR16 | Genomic results stored in PostgreSQL JSONB: `{ breed_composition, health_markers, trait_scores, lineage }` |
| FR17 | "Species Not Listed?" tile navigates to OrderKit wizard with `other` pre-selected |
| FR18 | Baseline genomic databank seeded into PostgreSQL via Alembic migration |

**Total FRs: 18**

### Non-Functional Requirements Extracted

| # | Requirement |
|---|---|
| NFR1 | DPDP Act 2023 compliance: consent audit trail, data residency in India, right to erasure support |
| NFR2 | HTTPS/TLS terminated at reverse proxy layer |
| NFR3 | bcrypt password hashing; JWT access tokens expire 24h; refresh tokens expire 30 days |
| NFR4 | PostgreSQL data encrypted at rest via cloud provider disk-level encryption |
| NFR5 | PII (name, email, phone) stored separately from genomic result data, linked only by internal ID |
| NFR6 | Web-first, fully responsive; mobile-optimised for results and tracking; minimum 44px touch targets on all interactive elements |
| NFR7 | App.jsx decomposed from 375KB monolith into domain modules using React Router v7 code splitting |
| NFR8 | Recharts: no multiple `ResponsiveContainer` instances on same page without lazy loading or tab-gating |
| NFR9 | Backend API versioned at `/api/v1/` from launch |
| NFR10 | All API errors return RFC 7807 Problem Details format |
| NFR11 | Backend emits structured JSON logs to stdout |
| NFR12 | GitHub Actions CI runs `pytest` (backend) and `npm run build` (frontend) on every push/PR to main |

**Total NFRs: 12**

### Additional Requirements (ARs)

AR1–AR10 documented in epics.md covering: backend scaffolding, Docker Compose, Alembic, databank seed, React Router v7, TanStack Query, API routing via `src/api.js`, GitHub Actions CI, webhook secret env var, and 3 open architectural decisions.

---

## Epic Coverage Validation

### FR Coverage Matrix

| FR | PRD Requirement (summary) | Epic / Story | Status |
|---|---|---|---|
| FR1 | 4-step ordering wizard | Epic 3 / Story 3.4 | ✅ Covered |
| FR2 | Three INR pricing tiers | Epic 3 / Stories 3.1, 3.4 | ✅ Covered |
| FR3 | 13 customer species grid | Epic 2 / Story 2.1 | ✅ Covered |
| FR4 | Consent checkbox in order flow | Epic 3 / Story 3.3 | ✅ Covered |
| FR5 | Kit tracking status | Epic 3 / Story 3.5 | ✅ Covered |
| FR6 | Genomic results display incl. **nutrition profiles** | Epic 4 / Story 4.3 | ⚠️ **Partial** — Story 4.3 has 4 tabs (Breed, Health, Traits, Lineage); **nutrition profiles absent** |
| FR7 | Consumer PDF download | Epic 4 / Story 4.4 | ✅ Covered |
| FR8 | /vet-program landing page | Epic 5 / Story 5.2 | ✅ Covered |
| FR9 | /vet-report + clinical PDF | Epic 5 / Stories 5.3, 5.4 | ✅ Covered |
| FR10 | JWT auth + RBAC | Epic 1 / Story 1.3 | ✅ Covered |
| FR11 | Staff Login footer link | Epic 1 / Story 1.5 | ✅ Covered |
| FR12 | Admin portal | Epic 6 / Stories 6.1–6.3 | ✅ Covered |
| FR13 | India address forms | Epic 2 / Story 2.3 | ✅ Covered |
| FR14 | formatINR() throughout | Epic 2 / Story 2.5, Epic 3 / Story 3.4 | ✅ Covered |
| FR15 | Lab results webhook | Epic 4 / Story 4.1 | ✅ Covered |
| FR16 | JSONB genomic results storage | Epic 4 / Story 4.1 | ✅ Covered |
| FR17 | Species Not Listed → OrderKit | Epic 2 / Story 2.4 | ✅ Covered |
| FR18 | Baseline databank seed | Epic 1 / Story 1.2 | ✅ Covered |

### Coverage Statistics

- **Total PRD FRs:** 18
- **Fully covered:** 17 (94%)
- **Partially covered:** 1 (FR6 — nutrition profiles)
- **Not covered:** 0

### Missing FR Coverage

**FR6 — Nutrition Profiles Not Implemented**
- FR6 requires: "behavioral traits, nutrition profiles, and lineage data"
- Story 4.3 defines exactly 4 result tabs: Breed, Health, Traits, Lineage
- "Nutrition profiles" is present in FR6 but does not appear in Story 4.3's Acceptance Criteria or anywhere in Epic 4
- **Impact:** A customer feature specified at the PRD/FR level will not be delivered
- **Recommendation:** Add a "Nutrition" tab to Story 4.3 AC, or explicitly defer nutrition profiles to a future epic (and update FR6 accordingly)

---

## UX Alignment Assessment

### UX Document Status

**Found:** `_bmad-output/planning-artifacts/ux-design-specification.md`

### UX-DR Coverage

All 15 UX Design Requirements are covered across the epics:

| UX-DR | Requirement (summary) | Story | Status |
|---|---|---|---|
| UX-DR1 | Remove 11 research organisms from customer grid | Story 2.1 | ✅ |
| UX-DR2 | Bangalore address + +91 phone in footer | Story 2.2 | ✅ |
| UX-DR3 | India address fields (city/state/pincode) | Story 2.3 | ✅ |
| UX-DR4 | Inline consent paragraph + checkbox in OrderKit | Story 3.3 | ✅ |
| UX-DR5 | Remove Admin from Navbar; add Staff Login footer link | Story 1.5 | ✅ |
| UX-DR6 | Remove duplicate order form from SpeciesSection | Story 2.4 | ✅ |
| UX-DR7 | /vet-program landing page | Story 5.2 | ✅ |
| UX-DR8 | /vet-report showcase page | Story 5.3 | ✅ |
| UX-DR9 | "For Veterinarians" footer link | Story 2.2 | ✅ |
| UX-DR10 | Mobile swipe tabs + 44px touch targets on results | Story 4.3 AC2 | ✅ |
| UX-DR11 | Breed composition chart entrance animation | Story 4.3 AC4 | ✅ |
| UX-DR12 | Traffic-light health markers | Story 4.3 AC5 | ✅ |
| UX-DR13 | Plain-language consent text (exact text specified) | Story 3.3 AC2 | ✅ |
| UX-DR14 | Vet clinical PDF — structured tables, clinical format | Story 5.4 | ✅ |
| UX-DR15 | India-native home hero credibility pass | Story 2.5 | ✅ |

**UX Coverage: 15/15 (100%)**

### Alignment Issues

1. **Nutrition profiles (UX ↔ FR6 ↔ Story 4.3)**: UX spec documents the Results Reveal as the core emotional experience but does not specifically call out nutrition profiles as a required tab. However FR6 does. Story 4.3 omits it. See FR6 finding above.

2. **NFR6 touch targets are only enforced in Story 4.3**: NFR6 requires 44px touch targets on ALL interactive elements. Story 4.3 AC2 explicitly enforces this for the results page. No other story (ordering wizard, tracking page, vet pages) explicitly validates touch targets. This creates inconsistent mobile UX.

---

## Epic Quality Review

### Epic Structure Assessment

| Epic | Title | User-Centric? | Independence | Verdict |
|---|---|---|---|---|
| Epic 1 | Foundation & Authentication | ⚠️ Largely technical | ✅ Stands alone | Acceptable for brownfield backend init |
| Epic 2 | India-Market Frontend Polish | ✅ Customer-facing | Requires Epic 1 Story 1.4 (Story 2.5 dependency) | ✅ Good |
| Epic 3 | Kit Ordering & Tracking | ✅ Strong user value | Requires Epic 1 | ✅ Good |
| Epic 4 | Lab Results Pipeline & Display | ✅ Core user value | Requires Epic 1 + Epic 3 orders | ✅ Good |
| Epic 5 | Veterinarian Channel | ✅ Vet user value | Requires Epic 4 (clinical PDF) | ✅ Good |
| Epic 6 | Admin Portal | ✅ Staff user value | Requires Epics 1 + 3 | ✅ Good |

### Dependency Analysis

**Documented cross-epic dependency (Story 2.5 → Story 1.4):**
Epics.md explicitly documents: "Story 2.5 requires Story 1.4 to be complete first (`formatINR()` must be exported from `shared.jsx` before Story 2.5 runs)." This is acceptable — it is explicitly documented in the Implementation Notes. Developer agents are warned.

**Forward reference (Story 2.2 → Epic 5):**
Story 2.2 adds a `/vet-program` footer link that will 404 until Epic 5 is implemented. Story 2.2 explicitly acknowledges this: "it will 404 until Epic 5 — that is acceptable." This is documented and acceptable.

**Schema gap (Story 3.1 → Story 1.2):**
Story 3.1 Technical Notes require a `guest_token` UUID column in the `orders` table. Story 1.2 defines the `orders` table without this column. A developer implementing Story 1.2 as written will not add `guest_token` — then Story 3.1 will fail at runtime. **This is an undocumented dependency.**

### Story Acceptance Criteria Quality

Stories are well-structured with numbered, testable ACs. Stories include explicit Technical Notes sections. Error conditions are specified (RFC 7807 returns for 401, 403, 404, 422, 409). Happy path and error paths are both covered.

**Minor concern — non-BDD format**: ACs use numbered assertions rather than Given/When/Then format. This is a style choice, not a functional problem — the ACs are clear and testable as written.

---

## Critical Issues

### 🔴 CRITICAL 1 — Architecture ↔ Epics Conflict: Data Model (No `samples` table)

**The architecture.md describes a `Sample` model, `samples.py` route, and `GET /api/v1/samples/{id}/tracking`. The epics.md explicitly overrides this and says the opposite.**

From epics.md Implementation Notes:
> "No `samples` table. Pipeline tracking is via `orders.status`. There is no separate `Sample` model or `/api/v1/samples/` route."
> "Results are keyed by `order_id`, not `sample_id`. The table is `genomic_results` with an `order_id` FK."

**Risk:** Developer agents reading architecture.md will implement `Sample` model, `samples.py`, and `GET /api/v1/results/{sample_id}` — all of which contradict the story ACs. This will cause broken stories at review.

**Action required:** Either (a) update architecture.md to reflect the epics data model, or (b) add a prominent banner to architecture.md pointing to the epics.md Implementation Notes as the authoritative override. Currently only epics.md contains this warning.

---

### 🔴 CRITICAL 2 — Architecture ↔ Epics Conflict: Auth Route Naming

**Architecture uses `/api/v1/users/register`. Epics use `/api/v1/auth/register` (Story 1.3) and `/api/v1/vets/register` (Story 5.1).**

The architecture's `users.py` route file doesn't match the epics' `auth.py` registration endpoint. Developer agents implementing Story 1.3 will create the correct route (`/api/v1/auth/register`) per AC1, but agents referencing architecture.md for file structure will create a `users.py` route file that conflicts.

**Action required:** Update architecture.md route file list to show `auth.py` handles customer registration and `vets.py` handles vet registration. Remove the implied `/api/v1/users/register` endpoint.

---

### 🔴 CRITICAL 3 — Architecture ↔ Epics Conflict: Consent Model

**Architecture puts `consent_given: bool` + `consent_timestamp` directly on the `Order` model. Epics create a separate `consent_records` table with its own endpoint.**

- Architecture: `orders` table has `consent_given` + `consent_timestamp` columns; no `consent_records` table
- Epics Story 1.2: `consent_records` is a separate table (id, user_id FK, order_id FK, consent_text, consented_at, ip_address)
- Epics Story 3.2: `POST /api/v1/orders/{order_id}/consent` creates a `consent_records` row

**Risk:** Developer agent implementing Story 1.2 from architecture.md will add consent fields to the `orders` table instead of creating the `consent_records` table. Story 3.2 will then reference a non-existent table/endpoint.

**Action required:** Update architecture.md to reflect the `consent_records` separate table pattern. This also better supports NFR1 (DPDP audit trail).

---

### 🔴 CRITICAL 4 — `guest_token` Column Missing from Story 1.2 Schema

**Story 3.1 requires a `guest_token` UUID column in the `orders` table. Story 1.2 defines the `orders` schema without it.**

Story 1.2 AC2 defines the `orders` table columns. The `guest_token` field is not listed. Story 3.1 Technical Notes say: "generate a `uuid4` at order creation time, return it in the response body as `guest_token`, store it in the `orders` table."

A developer strictly following Story 1.2's AC2 column list will not add `guest_token`. Story 3.1 will then fail to write it to the database.

**Action required:** Add `guest_token` (UUID, nullable) to the `orders` table column list in Story 1.2 AC2.

---

### 🔴 CRITICAL 5 — FR6 Nutrition Profiles Not Covered

**FR6 explicitly requires "nutrition profiles" as part of genomic results display. No story implements this feature.**

Story 4.3 defines result tabs as: Breed, Health, Traits, Lineage. The JSONB result shape in FR16 / Story 4.1 is `{ breed_composition, health_markers, trait_scores, lineage }` — there is no `nutrition` key.

**Action required:** Either:
- Add a "Nutrition" tab to Story 4.3 and a `nutrition_profile` key to the JSONB shape (FR16, Story 4.1 AC2)
- Or explicitly update FR6 to remove "nutrition profiles" and document it as a future phase feature

---

## Major Issues

### 🟠 MAJOR 1 — `vet_profiles` Table Absent from Architecture

Architecture.md has no `vet_profiles` table in its data model or directory structure. Epic 5 Story 5.1 introduces this table (`id`, `user_id`, `clinic_name`, `registration_number`, `city`, `state`, `phone`, `is_verified`).

Since epics.md supersedes architecture.md (as stated in its own Implementation Notes), this is a documentation gap rather than an implementation blocker. However, developer agents referencing architecture.md for the full data model will be surprised by this new table.

**Recommendation:** Add `vet_profiles` to architecture.md's data model section, or add it to the epics.md supersession notes.

---

### 🟠 MAJOR 2 — AR10 Decision (b): Customer Registration Flow Unresolved

AR10 listed three open decisions to resolve in stories:
- (a) Vet clinical PDF template strategy → **Resolved in Epic 5** (jsPDF decision in Story 5.4)
- (b) Customer registration flow (self-register vs order-creates-account) → **UNRESOLVED**
- (c) CORS `ALLOWED_ORIGINS` → **Resolved in Architecture**

Story 3.4 allows guest orders (guest_token flow). Story 1.3 provides a `/api/v1/auth/register` endpoint. But no story explicitly decides: Do customers NEED to create an account before ordering? Is the guest flow the recommended path? When does account creation happen for repeat customers?

This ambiguity can cause scope creep during Story 3.4 implementation.

**Recommendation:** Add a decision to Story 3.4 Technical Notes or a new pre-sprint decision record: "Guest flow is the primary path. Account creation is optional and self-initiated via `/api/v1/auth/register`. No forced account creation in the ordering flow."

---

### 🟠 MAJOR 3 — `result_data` vs `genomic_data` Column Name Inconsistency

- Architecture.md uses `genomic_data` as the JSONB column name in the `result.py` model
- Epics.md (Story 1.2 AC2, Story 4.1 AC2) uses `result_data` as the column name in the `genomic_results` table

Developer agents implementing Story 1.2 (database schema) and Story 4.1 (webhook ingestion) may use different column names depending on which document they reference first.

**Recommendation:** Epics.md supersedes architecture.md. The correct column name is `result_data` (per stories). Add a note to the architecture supersession list in epics.md: "`result_data` (not `genomic_data`) is the JSONB column name."

---

## Minor Issues

### 🟡 MINOR 1 — NFR6 Touch Targets Not Enforced Across All Stories

NFR6 requires 44px touch targets on "all interactive elements." Only Story 4.3 AC2 explicitly enforces this for the results page. The ordering wizard (Stories 3.3, 3.4), tracking page (Story 3.5), and vet pages (Stories 5.2, 5.3) have no equivalent AC.

**Recommendation:** Add a touch target validation note to Stories 3.3, 3.4, 3.5, 5.2, 5.3 — or add a project-wide implementation standard note in project-context.md.

---

### 🟡 MINOR 2 — DPDP Right to Erasure Has No Story

NFR1 requires "right to erasure support." Story 3.2 explicitly defers `DELETE /api/v1/users/{user_id}/data` as out of scope but states "the schema must not make it impossible." No story defines even a placeholder for this capability.

**Recommendation:** Add a backlog story to Epic 6 (or a post-MVP epic): "Backend — User Data Erasure Endpoint (DPDP Compliance)" with a note that the schema accommodates it. This prevents right-to-erasure from being forgotten entirely.

---

### 🟡 MINOR 3 — Epics.md Supersession Warning Is Insufficient

The epics.md Implementation Notes say: "This document supersedes `architecture.md` for all implementation details." This critical instruction appears mid-document on line 146. Developer agents starting from architecture.md will not see this warning.

**Recommendation:** Add a prominent warning at the top of architecture.md: "⚠️ Implementation agents: read `epics.md` Implementation Notes before implementing any story. That document supersedes this one for data model and route decisions."

---

## Summary and Recommendations

### Overall Readiness Status

## ⚠️ READY WITH CONDITIONS

The planning documentation is comprehensive. All 6 epics, 26 stories, and 18 FRs are present and detailed. The UX design is fully aligned with 100% UX-DR coverage. Story acceptance criteria are specific, testable, and include error conditions.

However, **5 Critical issues must be resolved before committing developer agents to implementation** — particularly the architecture/epics conflicts which will cause developer agents to implement the wrong data model, wrong routes, and wrong consent schema.

---

### Critical Issues Requiring Immediate Action (Priority Order)

1. **[CRIT-1]** Add supersession banner to `architecture.md` top — point agents to `epics.md` Implementation Notes as authoritative override. This single fix reduces the impact of CRIT-1, 2, 3.

2. **[CRIT-4]** Add `guest_token` (UUID, nullable) to Story 1.2 AC2 `orders` table column list.

3. **[CRIT-5]** Resolve FR6 nutrition profiles: either add a Nutrition tab to Story 4.3 + `nutrition_profile` to JSONB shape, or explicitly remove nutrition from FR6 as a future phase feature.

4. **[CRIT-2]** Update architecture.md route file list: replace `users.py` registration implication with `auth.py` (customer) + `vets.py` (vet).

5. **[CRIT-3]** Update architecture.md data model to show `consent_records` as a separate table (not `consent_given` field on `orders`).

---

### Recommended Next Steps

1. **Fix Story 1.2 immediately** — add `guest_token` to the `orders` table column list (AC2). Stories 1.1–1.3 are already in "review" status; this gap will break Story 3.1 at implementation time.

2. **Add a supersession notice to architecture.md** — a one-line header banner protects all future developer agents from the critical data model conflicts.

3. **Decide on FR6 nutrition profiles** — a quick yes/no decision. If yes, add a Nutrition tab to Story 4.3. If no, mark it as future phase and update FR6.

4. **Add `guest_token` and `result_data` override notes to epics.md Implementation Notes** — centralise all known architecture overrides in one place.

5. **Proceed to Sprint Planning / Story Automator** — once the above fixes are in place, the implementation is ready to begin with high confidence.

---

### Issue Summary

| Severity | Count | Category |
|---|---|---|
| 🔴 Critical | 5 | Architecture/Epics conflicts (3), Schema gap (1), Missing FR coverage (1) |
| 🟠 Major | 3 | Missing table in architecture, Unresolved AR decision, Column name inconsistency |
| 🟡 Minor | 3 | NFR6 enforcement gaps, Missing DPDP erasure story, Supersession warning placement |

**Total issues: 11**

This assessment identified 11 issues across 3 severity categories. The 5 critical issues should be addressed before developer agents proceed with Epic 2 or later stories. Stories 1.1, 1.2, 1.3 (currently in review) should be re-checked for the consent model conflict (CRIT-3) and guest_token gap (CRIT-4) before being approved.
