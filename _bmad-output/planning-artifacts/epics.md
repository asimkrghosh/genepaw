---
stepsCompleted: ['step-01-validate', 'step-02-design-epics', 'step-03-epic-1', 'step-03-epic-2', 'step-03-epic-3', 'step-03-epic-4', 'step-03-epic-5', 'step-03-epic-6', 'step-03-complete', 'step-04-final-validation']
status: 'complete'
completedAt: '2026-05-18'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/project-context.md'
---

# GenePaw - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for GenePaw, decomposing the requirements from the PRD, UX Design Specification, and Architecture document into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: The system shall allow customers to order genomic testing kits through a 4-step wizard: species selection → package selection → India address + consent → confirmation.
FR2: The system shall offer three genomic testing packages at fixed INR prices: Breed ID (₹7,999), Health + Breed (₹15,999), and Complete Genome (₹27,999).
FR3: The customer-facing species grid shall display only 13 customer-relevant species: Dog, Cat, Bird, Fish, Horse, Cattle, Pig, Sheep, Primate, Dolphin, Bat, Python, Panda.
FR4: The order confirm step shall collect explicit genomic data consent via a plain-language paragraph and opt-in checkbox; submission is disabled until consent is checked.
FR5: The system shall provide kit tracking status updates to customers (kit_dispatched → sample_received → processing → results_ready).
FR6: The system shall display genomic results including breed composition (pie/bar/radar charts), health markers (traffic-light coded), behavioral traits, nutrition profiles, and lineage data.
FR7: The system shall generate and allow download of a consumer-facing PDF report from the results page.
FR8: The system shall provide a veterinarian partner landing page (`/vet-program`) with referral model description and a vet registration form.
FR9: The system shall provide a vet report showcase page (`/vet-report`) with a clinical PDF download trigger.
FR10: The system shall authenticate users via JWT with three RBAC roles: Customer, Staff, and Veterinarian.
FR11: The admin/staff portal shall be accessible only to Staff role users via a discreet "Staff Login" text link in the footer.
FR12: The admin portal shall allow staff to view and manage all orders, sample pipeline status, and the full species list including research organisms.
FR13: All order address forms shall use India-specific fields: city, state, pincode (no zip/country fields).
FR14: All prices shall be displayed in Indian Rupees (INR) using the `formatINR()` helper throughout the application.
FR15: The system shall ingest lab results via a webhook endpoint (`POST /api/v1/webhook/lab-results`) validated by a shared secret header (`X-Lab-Secret`).
FR16: Genomic results shall be stored in a PostgreSQL JSONB column with shape: `{ breed_composition, health_markers, trait_scores, lineage }`.
FR17: The "Species Not Listed?" tile shall navigate to the OrderKit wizard with `other` pre-selected — no duplicate inline order form.
FR18: The baseline genomic databank (`marker_categories_362.js` and `Cross_Species_Gene_Annotation_Database.xlsx`) shall be seeded into the PostgreSQL `species` and reference data tables via Alembic migration.

### NonFunctional Requirements

NFR1: The system shall comply with India's DPDP Act 2023 for genomic data — consent audit trail stored in `consent_records` table, data residency in India, right to erasure support.
NFR2: All API communication shall use HTTPS/TLS terminated at the reverse proxy layer.
NFR3: User passwords shall be hashed with bcrypt; JWT access tokens expire in 24 hours; refresh tokens expire in 30 days.
NFR4: PostgreSQL data shall be encrypted at rest via cloud provider disk-level encryption (required when cloud provider is provisioned).
NFR5: User identity data (PII: name, email, phone) shall be stored separately from genomic result data, linked only by an internal ID.
NFR6: The platform shall be web-first, fully responsive; mobile-optimised for results and tracking; minimum 44px touch targets on all interactive elements.
NFR7: App.jsx shall be decomposed from a 375KB monolith into domain modules (CustomerPortal, AdminPortal, VetPortal, OrderFlow, Results) using React Router v7 code splitting.
NFR8: Recharts components shall not render multiple `ResponsiveContainer` instances on the same page without lazy loading or tab-gating.
NFR9: The backend API shall be versioned at `/api/v1/` from launch.
NFR10: All API errors shall return RFC 7807 Problem Details format: `{ type, title, status, detail }`.
NFR11: The backend shall emit structured JSON logs to stdout; cloud provider captures automatically.
NFR12: GitHub Actions CI shall run `pytest` (backend) and `npm run build` (frontend) on every push/PR to main.

### Additional Requirements

- AR1: Backend starter — scaffold `genepaw-api/` with `uvx fastapi-new genepaw-api` (FastAPI 0.136.1, Python 3.12, uv). **This is Epic 1 Story 1.**
- AR2: Docker Compose local dev environment: `api` service (port 8000) + `db` PostgreSQL service (port 5432). React Vite dev server (port 3000) runs outside Docker.
- AR3: Alembic database migrations — auto-generate with `alembic revision --autogenerate`; run with `alembic upgrade head` on every deploy.
- AR4: Baseline databank seed migration from `marker_categories_362.js` + `Cross_Species_Gene_Annotation_Database.xlsx` → PostgreSQL. **This is Epic 1 Story 2.**
- AR5: React Router v7 (7.15.1) introduced at implementation start; App.jsx decomposed into domain modules concurrently.
- AR6: TanStack Query (5.100.10) replaces all mock `useState` data constants as API endpoints are wired up.
- AR7: All React API calls routed through `src/api.js` using `VITE_API_URL` env variable.
- AR8: GitHub Actions CI pipeline in `genepaw-api/.github/workflows/ci.yml`.
- AR9: `LAB_WEBHOOK_SECRET` env variable for webhook shared-secret validation.
- AR10: Three decisions to resolve in stories: (a) vet clinical PDF template strategy — jsPDF vs server-side reportlab; (b) customer registration flow — self-register vs order-creates-account; (c) CORS `ALLOWED_ORIGINS` env var configuration.

### UX Design Requirements

UX-DR1: Remove 11 research organisms from the customer-facing species grid: Human, Rat, Roundworm, Fruit Fly, Frog, Yeast, Sea Slug, Snail, Mosquito, Bacteria, Vole, Mole-Rat. These remain in the admin/research portal only.
UX-DR2: Update footer contact information to Bangalore address and +91 phone number.
UX-DR3: Replace USA-centric address fields (zip/country) with India-specific fields (city, state, pincode) in both OrderKit and SpeciesSection forms.
UX-DR4: Add inline consent paragraph ("Your pet's DNA stays yours" — plain language, not legal boilerplate) and opt-in checkbox to the OrderKit "Confirm" step; submit disabled until checked.
UX-DR5: Remove "Admin" button from main Navbar; add low-contrast "Staff Login" text link to footer (same row as Privacy Policy / Terms of Service).
UX-DR6: Remove duplicate inline order form from SpeciesSection; "Species Not Listed?" tile navigates to OrderKit with `other` pre-selected.
UX-DR7: Create `/vet-program` page: vet partner landing page with referral model, report depth description, and registration form.
UX-DR8: Create `/vet-report` page: sample vet report showcase with PDF download trigger.
UX-DR9: Add "For Veterinarians" link in footer that connects to `/vet-program`.
UX-DR10: Results tab navigation on mobile must be swipeable and not require horizontal scrolling; all tab elements minimum 44px touch targets.
UX-DR11: Breed composition chart on results reveal shall animate in on first render (entrance animation for "wonder and delight" emotional design goal).
UX-DR12: Health markers shall display with traffic-light color coding (green/amber/red) and plain-language explanations alongside gene codes.
UX-DR13: Consent paragraph text must be human-written plain language — never legal boilerplate.
UX-DR14: Vet clinical PDF report must use structured tables, standard clinical terminology, and GenePaw logo — formatted to look like a lab report, not a consumer summary.
UX-DR15: Home hero must feel India-native and credible; customer species must be findable within 5 seconds in the filtered grid.

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 3 | 4-step ordering wizard |
| FR2 | Epic 3 | Three pricing tiers |
| FR3 | Epic 2 | Customer species grid (13 species) |
| FR4 | Epic 3 | Inline consent enforcement |
| FR5 | Epic 3 | Kit tracking status |
| FR6 | Epic 4 | Genomic results display |
| FR7 | Epic 4 | Consumer PDF download |
| FR8 | Epic 5 | vet-program page |
| FR9 | Epic 5 | vet-report + clinical PDF |
| FR10 | Epic 1 | JWT auth + RBAC |
| FR11 | Epic 1 | Staff Login footer link |
| FR12 | Epic 6 | Admin portal |
| FR13 | Epic 2 | India address forms |
| FR14 | Epic 3 | INR pricing |
| FR15 | Epic 4 | Lab webhook |
| FR16 | Epic 4 | JSONB result storage |
| FR17 | Epic 2 | Single order path |
| FR18 | Epic 1 | Baseline databank seed |

## Epic List

### Epic 1: Foundation & Authentication
The platform runs locally, staff can authenticate, and all development infrastructure is operational. Every subsequent epic builds on this.
**FRs covered:** FR10, FR11, FR18
**NFRs covered:** NFR3, NFR5, NFR7, NFR9, NFR10, NFR11, NFR12
**ARs covered:** AR1–AR9

### Epic 2: India-Market Frontend Polish
The existing React prototype is India-market ready — correct species visible to customers, Indian address forms, clean navigation with no admin noise, single ordering path.
**FRs covered:** FR3, FR13, FR17
**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR3, UX-DR5, UX-DR6, UX-DR15

### Epic 3: Kit Ordering & Tracking
Customers can order a genomic kit, give informed consent, pay in INR, and track their sample through the lab pipeline.
**FRs covered:** FR1, FR2, FR4, FR5, FR14
**UX-DRs covered:** UX-DR4, UX-DR13

### Epic 4: Lab Results Pipeline & Display
Lab results flow automatically into the platform and customers experience the genomic results reveal — breed composition, health markers, traits, lineage — and can download their personal PDF.
**FRs covered:** FR6, FR7, FR15, FR16
**NFRs covered:** NFR8
**UX-DRs covered:** UX-DR10, UX-DR11, UX-DR12

### Epic 5: Veterinarian Channel
Veterinarians can register as GenePaw partners, explore the referral program, and preview the clinical report format — turning the PDF infrastructure into an organic referral loop.
**FRs covered:** FR8, FR9
**UX-DRs covered:** UX-DR7, UX-DR8, UX-DR9, UX-DR14
**Resolves:** Architecture Gap 1 (vet clinical PDF template strategy)

### Epic 6: Admin Portal
Staff can log in to a dedicated portal to manage all orders, monitor the sample pipeline status, and maintain the full species catalog including research organisms.
**FRs covered:** FR12

---

## Implementation Notes for Developer Agents

> **This document supersedes `architecture.md` for all implementation details.** Where conflicts exist, follow the story Acceptance Criteria exactly. Known discrepancies:
>
> - **No `samples` table.** Pipeline tracking is via `orders.status` (`pending` → `kit_dispatched` → `sample_received` → `processing` → `results_ready`). There is no separate `Sample` model or `/api/v1/samples/` route.
> - **Results are keyed by `order_id`, not `sample_id`.** The table is `genomic_results` with an `order_id` FK and a `result_data` JSONB column. The retrieval route is `GET /api/v1/orders/{order_id}/results` (Story 4.2), not `/api/v1/results/{sample_id}`.
> - **Auth routes use `/api/v1/auth/` prefix.** Customer registration is `POST /api/v1/auth/register` (Story 1.3). Vet registration is `POST /api/v1/vets/register` (Story 5.1). There is no `/api/v1/users/register` route.
> - **Story 2.5 requires Story 1.4 to be complete first** (`formatINR()` must be exported from `shared.jsx` before Story 2.5 runs).

---

## Epic 1: Foundation & Authentication

**Goal:** The platform runs locally, staff can authenticate, and all development infrastructure is operational. Every subsequent epic builds on this.

**FRs covered:** FR10, FR11, FR18
**NFRs covered:** NFR3, NFR5, NFR7, NFR9, NFR10, NFR11, NFR12
**ARs covered:** AR1–AR9

---

### Story 1.1: Backend Project Scaffold & Docker Compose

**As a** developer,
**I want** a working FastAPI backend and Docker Compose local environment,
**so that** I can develop and test the API locally without any cloud dependency.

**Acceptance Criteria:**

1. Running `uvx fastapi-new genepaw-api` creates the `genepaw-api/` directory as a sibling to the existing frontend directory.
2. Running `uv add sqlalchemy alembic asyncpg psycopg2-binary pydantic-settings python-jose passlib` completes without errors and all packages appear in `pyproject.toml`.
3. `docker-compose.yml` in `genepaw-api/` defines two services: `api` (port 8000) and `db` (PostgreSQL, port 5432). The `db` service uses `postgres:16` image with `POSTGRES_DB=genepaw`, `POSTGRES_USER=genepaw`, `POSTGRES_PASSWORD=genepaw_dev`.
4. `docker compose up` starts both services; `curl http://localhost:8000/health` returns `{"status": "ok"}`.
5. The React Vite dev server (`npm run dev`, port 3000) runs outside Docker and is unaffected by this story.
6. `genepaw-api/app/core/config.py` uses `pydantic-settings` `BaseSettings` to load `DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_ALGORITHM` (default `HS256`), `ACCESS_TOKEN_EXPIRE_MINUTES` (default `1440`), `REFRESH_TOKEN_EXPIRE_DAYS` (default `30`), `LAB_WEBHOOK_SECRET`, and `ALLOWED_ORIGINS` from environment variables or a `.env` file.
7. `genepaw-api/.env.example` documents all required environment variables with placeholder values. The actual `.env` file is git-ignored.
8. `genepaw-api/app/core/exceptions.py` defines a global FastAPI exception handler that returns RFC 7807 Problem Details format: `{"type": "...", "title": "...", "status": <int>, "detail": "..."}` for all `HTTPException` and unhandled `Exception`.
9. `genepaw-api/app/core/logging.py` configures Python's `logging` to emit structured JSON to stdout (one JSON object per log line with `level`, `message`, `timestamp` fields at minimum).
10. All API routes are registered under the `/api/v1/` URL prefix.

**Technical Notes:**
- `uvx fastapi-new genepaw-api` uses FastAPI 0.136.1 and Python 3.12 — do not pin versions lower than these.
- The `db` service data volume should be named `genepaw_db_data` so data persists across `docker compose down` restarts.
- `DATABASE_URL` for the `api` service in Docker Compose should reference the service name: `postgresql+asyncpg://genepaw:genepaw_dev@db:5432/genepaw`.
- For local development outside Docker (e.g., running `uvicorn` directly), `DATABASE_URL` in `.env` should use `localhost`: `postgresql+asyncpg://genepaw:genepaw_dev@localhost:5432/genepaw`.

---

### Story 1.2: Database Schema & Baseline Species Seed

**As a** developer,
**I want** the PostgreSQL schema created via Alembic migrations and the baseline species and genomic reference data seeded from the existing source files,
**so that** the application has real species and marker data to work with from the first run.

**Acceptance Criteria:**

1. Alembic is initialised in `genepaw-api/` (`alembic init alembic`). `alembic/env.py` is configured to use `app.core.config.settings.DATABASE_URL` and auto-detect all SQLAlchemy models.
2. Running `alembic upgrade head` creates the following tables:
   - `users` — `id` (UUID PK), `email` (unique), `password_hash`, `role` (enum: `customer`/`staff`/`vet`), `created_at`
   - `consent_records` — `id`, `user_id` (FK → users), `order_id` (FK → orders), `consent_text` (text), `consented_at`, `ip_address`
   - `species` — `id`, `name`, `scientific_name`, `category` (enum: `customer`/`research`), `is_active`
   - `orders` — `id`, `user_id` (FK → users, nullable for guest orders), `species_id` (FK → species), `package` (enum: `breed_id`/`health_breed`/`complete_genome`), `status` (enum: `pending`/`kit_dispatched`/`sample_received`/`processing`/`results_ready`), `address_city`, `address_state`, `address_pincode`, `created_at`
   - `genomic_results` — `id`, `order_id` (FK → orders, unique), `result_data` (JSONB with shape `{breed_composition, health_markers, trait_scores, lineage}`), `created_at`
   - `marker_categories` — `id`, `name`, `species_id` (FK → species), `markers` (JSONB)
3. A second Alembic migration (data migration) seeds the `species` table from `marker_categories_362.js` (located in the project root): all 13 customer-facing species get `category = 'customer'`; all research organisms get `category = 'research'`.
4. The data migration also seeds the `marker_categories` table from `marker_categories_362.js` — each category entry becomes one row linked to its species.
5. Running `alembic upgrade head` on a fresh database completes without errors and leaves the `species` table with at least 24 rows and `marker_categories` with at least 362 rows.
6. Running `alembic upgrade head` twice (idempotency check) does not raise an error or create duplicate rows.
7. `alembic downgrade -1` reverses the most recent migration cleanly.

**Technical Notes:**
- `marker_categories_362.js` exports a JavaScript object — write a Python parser in the data migration that extracts the data without requiring Node.js (parse it as text using regex or string manipulation, or convert it to JSON manually before the migration).
- The `Cross_Species_Gene_Annotation_Database.xlsx` file is seeded in a later story (or deferred to a separate migration) — this story covers only `marker_categories_362.js`.
- All UUIDs use `uuid4` default; use `server_default=text("gen_random_uuid()")` for PostgreSQL-native UUID generation.
- PII isolation rule (NFR5): `users` table stores identity data; `genomic_results` stores genomic data. They are linked only by `order_id` — never join them unnecessarily.

---

### Story 1.3: JWT Authentication & Role-Based Access Control

**As a** user,
**I want** to register and log in with email/password and receive a JWT token,
**so that** my session is authenticated and my role controls what I can access.

**Acceptance Criteria:**

1. `POST /api/v1/auth/register` accepts `{"email", "password", "role"}` and creates a user. Password is hashed with bcrypt (via `passlib`). Returns `201` with the created user object (no password hash in response).
2. `POST /api/v1/auth/login` accepts `{"email", "password"}` and returns `{"access_token", "refresh_token", "token_type": "bearer"}`. Access token expires in 24 hours; refresh token expires in 30 days.
3. `POST /api/v1/auth/refresh` accepts `{"refresh_token"}` and returns a new access token. Returns `401` if the refresh token is expired or invalid.
4. JWT tokens contain claims: `sub` (user ID as string), `role` (one of `customer`/`staff`/`vet`), `exp`.
5. `app/core/dependencies.py` exposes `get_current_user` FastAPI dependency that extracts and validates the JWT from the `Authorization: Bearer <token>` header. Returns the user object or raises `401`.
6. `app/core/dependencies.py` exposes `require_role(*roles)` dependency factory that wraps `get_current_user` and raises `403` if the user's role is not in the allowed list.
7. A protected test route `GET /api/v1/auth/me` returns the current user's `id`, `email`, and `role`. Requires valid JWT. Returns `401` without token.
8. All auth errors return RFC 7807 format (per Story 1.1 AC8).
9. At least one pytest test covers: successful register → login → `/me` flow; expired token returns `401`; wrong role returns `403`.

**Technical Notes:**
- `JWT_SECRET_KEY` must be a randomly generated string (minimum 32 characters) — document this in `.env.example`.
- Do not store refresh tokens in the database for this phase — stateless refresh token validation only.
- The `role` field on `/register` should default to `customer` if not provided; `staff` and `vet` roles cannot be self-assigned in production (enforce this in a future story; for now, allow it to simplify seeding).

---

### Story 1.4: React Router v7 & Frontend Infrastructure

**As a** developer,
**I want** the React frontend decomposed into domain modules with React Router v7 routing and TanStack Query for API communication,
**so that** the codebase is maintainable and all subsequent frontend stories have a consistent structure to build on.

**Acceptance Criteria:**

1. `npm install react-router@7.15.1 @tanstack/react-query@5.100.10` completes without errors; both appear in `package.json`.
2. `src/main.jsx` wraps the app in `<BrowserRouter>` (React Router v7) and `<QueryClientProvider>` (TanStack Query). No other changes to `main.jsx`.
3. `src/App.jsx` is refactored: all route definitions use `<Routes>` and `<Route>` components. The monolithic single-file approach is replaced with these domain module files, each as a separate `.jsx` file in `src/`:
   - `CustomerPortal.jsx` — home, species, pricing pages
   - `OrderFlow.jsx` — the 4-step kit ordering wizard
   - `Results.jsx` — genomic results and PDF download
   - `VetPortal.jsx` — vet-program and vet-report pages
   - `AdminPortal.jsx` — admin dashboard (staff-only)
   - `shared.jsx` — reusable primitives: `Button`, `SectionTitle`, `Badge`, `Navbar`, `Footer`
4. `src/App.jsx` after refactor: imports domain modules, defines routes, implements JWT auth guard (redirect to login if no valid token for protected routes). File size is under 100 lines.
5. `src/api.js` exports an `apiFetch(path, options)` function that prefixes all requests with `VITE_API_URL` (from `.env`). Attaches `Authorization: Bearer <token>` header from `localStorage.getItem('genepaw_token')` when present. Throws on non-2xx responses with the RFC 7807 error body.
6. `.env` (gitignored) and `.env.example` (committed) define `VITE_API_URL=http://localhost:8000`.
7. All existing UI features (species grid, pricing page, order wizard, results demo, tracking demo) continue to work in the browser after refactoring — no visual regression.
8. `npm run build` exits with code 0 after the refactor.

**Technical Notes:**
- React Router v7 uses `createBrowserRouter` or JSX `<Routes>` — use the JSX `<Routes>/<Route>` approach to match the existing code style.
- `App.jsx` currently uses `currentPage` state for routing — replace this with `<Routes>` but keep the `COLORS`, `formatINR`, and other constants in `shared.jsx` or their current location.
- Code splitting via `React.lazy()` for each domain module satisfies NFR7 — wrap lazy imports in `<Suspense>`.
- Do not remove existing mock data constants (`SPECIES_DATA`, `SAMPLE_RESULTS`, etc.) — they remain as the data shape contract until API endpoints are wired in later epics.

---

### Story 1.5: Staff Login Flow

**As a** staff member,
**I want** a discreet login path that gives me access to the admin portal,
**so that** customers never see or accidentally navigate to admin functionality.

**Acceptance Criteria:**

1. The "Admin" button is removed from the main `Navbar` component.
2. The `Footer` component contains a low-contrast "Staff Login" text link in the same row as the Privacy Policy and Terms of Service links. Contrast is intentionally low (e.g., `text-gray-400`) so it blends into the footer without drawing customer attention.
3. Clicking "Staff Login" navigates to `/staff-login` — a minimal login form (email + password fields, submit button). No GenePaw branding hero or marketing content — just the form.
4. Successful login with a `staff`-role JWT stores the token in `localStorage` under key `genepaw_token` and redirects to `/admin`.
5. Failed login (wrong credentials or non-staff role) displays an inline error message: "Invalid credentials or insufficient permissions."
6. The `/admin` route is protected: a non-authenticated user or a non-staff-role token is redirected to `/staff-login`.
7. The existing admin mock login (`ADMIN_USER` constant and `LoginModal`) is fully removed — replaced by the real JWT flow from Story 1.3.
8. A "Log out" action in the admin portal clears `genepaw_token` from `localStorage` and redirects to `/`.

**Technical Notes:**
- This story depends on Story 1.3 (JWT auth endpoint) being complete.
- The staff login page must not appear in the customer navigation — it is accessible only by direct URL or the footer link.
- Do not add a "forgot password" flow — out of scope for this phase.

---

### Story 1.6: GitHub Actions CI Pipeline

**As a** developer,
**I want** automated CI checks on every push to main,
**so that** broken builds and failing tests are caught before they accumulate.

**Acceptance Criteria:**

1. `genepaw-api/.github/workflows/ci.yml` defines a GitHub Actions workflow triggered on `push` and `pull_request` to `main`.
2. The workflow runs two jobs in parallel: `backend` and `frontend`.
3. The `backend` job: checks out the repo, sets up Python 3.12 with `uv`, installs dependencies (`uv sync`), runs `pytest genepaw-api/` (all tests). Job fails if any test fails.
4. The `frontend` job: checks out the repo, sets up Node.js 20, runs `npm ci` in the frontend directory, runs `npm run build`. Job fails if the build fails.
5. Both jobs run on `ubuntu-latest`.
6. The workflow file is valid YAML and passes `actionlint` (or equivalent syntax check) — no syntax errors.
7. The `backend` job sets a `DATABASE_URL` environment variable pointing to a PostgreSQL service container (`postgres:16`) for test isolation.

**Technical Notes:**
- The PostgreSQL service container in GitHub Actions: use `services.postgres` block with `postgres:16` image, same credentials as local dev.
- Do not add coverage thresholds or reporting — tests must pass, that is the only gate.
- `npm ci` (not `npm install`) is required in CI for deterministic installs.

---

## Epic 2: India-Market Frontend Polish

**Goal:** The existing React prototype is India-market ready — correct species visible to customers, Indian address forms, clean navigation with no admin noise, single ordering path.

**FRs covered:** FR3, FR13, FR17
**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR3, UX-DR5, UX-DR6, UX-DR15

---

### Story 2.1: Customer Species Grid — Filter Research Organisms

**As a** pet owner,
**I want** the species selection grid to show only animals I might actually own or care about,
**so that** I can find my animal in under 5 seconds without being confused by roundworms and bacteria.

**Acceptance Criteria:**

1. The customer-facing species grid displays exactly these 13 species: Dog, Cat, Bird, Fish, Horse, Cattle, Pig, Sheep, Primate, Dolphin, Bat, Python, Panda.
2. The following 11 research organisms are removed from the customer grid: Human, Rat, Roundworm, Fruit Fly, Frog, Yeast, Sea Slug, Snail, Mosquito, Bacteria, Vole, Mole-Rat.
3. The `SPECIES_DATA` constant is updated to include a `category` field on each entry: `'customer'` or `'research'`. The grid component filters to `category === 'customer'` — the data is not deleted, just filtered.
4. The grid layout reflows correctly with 13 items — no broken columns or orphaned rows on desktop or mobile.
5. All 13 customer species tiles are visually intact (icon, name, description) with no missing or placeholder content.

**Technical Notes:**
- The `SPECIES_DATA` array already contains all 24 species; add a `category` field rather than deleting research entries — they will be needed by the Admin Portal in Epic 6.
- Research organisms remain in `SPECIES_DATA` so the admin species list can render them without a separate data structure.

---

### Story 2.2: India Localization — Footer & Contact

**As an** Indian customer,
**I want** GenePaw's contact information to show a Bangalore address and Indian phone number,
**so that** the platform feels like a domestic product, not a foreign service with Indian pricing.

**Acceptance Criteria:**

1. The `Footer` component's contact section displays a Bangalore address (e.g., "GenePaw Genomics Pvt. Ltd., Koramangala, Bangalore – 560034, Karnataka, India").
2. The phone number displayed in the footer is a +91 Indian number (e.g., "+91 80 4567 8900").
3. The email contact (if present) uses a `@genepaw.in` or `@genepaw.com` domain — no USA-format phone numbers (no area codes formatted as `(xxx) xxx-xxxx`).
4. The "For Veterinarians" link is added to the footer (same row as Privacy Policy / Terms of Service). It links to `/vet-program`. This link is present even before the vet-program page exists (it will 404 until Epic 5 — that is acceptable).
5. No USA phone number formats or zip codes appear anywhere in the footer.

---

### Story 2.3: India Address Forms — OrderKit & SpeciesSection

**As a** customer,
**I want** to enter my delivery address using Indian fields (city, state, pincode),
**so that** the form makes sense for my location and I'm not asked for a zip code or country.

**Acceptance Criteria:**

1. The OrderKit address step contains exactly these fields: Full Name, Phone Number, Address Line 1, Address Line 2 (optional), City, State (dropdown of Indian states and UTs), Pincode (6-digit numeric).
2. The SpeciesSection address form (if any address fields exist there) uses the same India-specific field set.
3. No "Zip Code", "ZIP", "Country", or "State/Province" (US-style) labels appear in either form.
4. The State dropdown lists all 28 Indian states and 8 Union Territories.
5. Pincode field validates to exactly 6 digits (numeric only) before the step can proceed.
6. Phone number field validates to a 10-digit Indian mobile number (optionally prefixed with `+91`).
7. Existing form validation logic is preserved — required fields still block progression if empty.

**Technical Notes:**
- Indian states/UTs list is a static constant `INDIA_STATES` in `shared.jsx` — do not fetch it from an API.
- Address fields feed into the `orders` table schema defined in Story 1.2 (`address_city`, `address_state`, `address_pincode`).

---

### Story 2.4: Single Order Path — Remove Duplicate Form from SpeciesSection

**As a** customer,
**I want** one clear path to order a kit for an unlisted species,
**so that** I'm not confused by two different order forms on the same page.

**Acceptance Criteria:**

1. The `SpeciesSection` component no longer contains an inline order form (any form fields for ordering a kit are removed).
2. The "Species Not Listed?" tile is present in the species grid as the final tile.
3. Clicking the "Species Not Listed?" tile navigates to the OrderKit wizard (`/order-kit`) with the species pre-selected as `other`.
4. The OrderKit wizard correctly handles `other` as a species selection — it progresses through the wizard without errors and `other` is displayed in the order summary.
5. The species grid page has no duplicate CTAs or forms — the only ordering path is through the 4-step wizard.

---

### Story 2.5: Home Hero — India-Native Credibility Pass

**As a** first-time visitor,
**I want** the home page hero to feel like a credible Indian product,
**so that** I trust GenePaw enough to continue browsing rather than bouncing.

**Acceptance Criteria:**

1. The home hero section contains at least one India-specific trust signal: either a "Bangalore, India" location mention, an India-first positioning statement, or a reference to Indian breed expertise.
2. The hero headline and subheadline do not reference competitor brand names (Embark, Wisdom Panel) — they make a positive claim about GenePaw.
3. The hero CTA (primary button) leads directly to the species grid or the ordering wizard — no dead-end links.
4. All prices visible on the home page or pricing section are formatted using `formatINR()` in INR (₹) — no USD amounts.
5. The page renders without console errors or broken images on desktop and mobile viewports (375px and 1280px).

**Technical Notes:**
- This story is a copy/content pass, not a full redesign — work within the existing hero component structure.
- `formatINR()` helper must already exist in `shared.jsx` before this story runs (it exists in the current `App.jsx`; ensure it is exported from `shared.jsx` after Story 1.4 refactoring).

---

## Epic 3: Kit Ordering & Tracking

**Goal:** Customers can order a genomic kit, give informed consent, pay in INR, and track their sample through the lab pipeline.

**FRs covered:** FR1, FR2, FR4, FR5, FR14
**UX-DRs covered:** UX-DR4, UX-DR13

---

### Story 3.1: Backend — Order Creation API

**As a** customer,
**I want** my kit order to be saved to the database when I submit the wizard,
**so that** GenePaw has a real record of my purchase and can dispatch my kit.

**Acceptance Criteria:**

1. `POST /api/v1/orders` accepts `{"species_id", "package", "address_city", "address_state", "address_pincode", "full_name", "phone"}`. The `user_id` is set from the JWT if authenticated, or `null` for guest orders.
2. The endpoint creates an `orders` row with `status = 'pending'` and returns `201` with the created order including its `id`.
3. `package` must be one of `breed_id`, `health_breed`, `complete_genome` — returns `422` with RFC 7807 body if invalid.
4. `species_id` must reference an existing species in the `species` table — returns `422` if not found.
5. `GET /api/v1/orders/{order_id}` returns the order's current status and details. A customer can only retrieve their own order (matched by `user_id` or by a guest lookup token — guest token approach: include a `guest_token` UUID in the order creation response and accept it as a query param `?token=` for status checks).
6. `GET /api/v1/orders` (staff only, requires `staff` role) returns all orders, paginated (`?page=1&page_size=20`), newest first.
7. At least two pytest tests: successful order creation; invalid package returns 422.

**Technical Notes:**
- Pricing is fixed — the backend does not accept a price field. Price is derived from `package` on the backend:
  - `breed_id` → ₹7,999
  - `health_breed` → ₹15,999
  - `complete_genome` → ₹27,999
- Payment integration is out of scope — `status = 'pending'` means "order received, awaiting kit dispatch." No payment gateway in this phase.
- Guest token: generate a `uuid4` at order creation time, return it in the response body as `guest_token`, store it in the `orders` table. Frontend stores it in `localStorage`.

---

### Story 3.2: Backend — Consent Record Storage

**As a** platform operator,
**I want** every order to have a linked consent record in the database,
**so that** GenePaw complies with India's DPDP Act 2023 and can demonstrate informed consent was collected.

**Acceptance Criteria:**

1. `POST /api/v1/orders/{order_id}/consent` accepts `{"consent_text", "consented_at"}`. Creates a `consent_records` row linking the order and storing the exact consent paragraph text and timestamp.
2. The endpoint records the caller's IP address in `consent_records.ip_address` (from the request).
3. Returns `201` on success. Returns `409` if a consent record already exists for this order (prevents double-submission).
4. The consent endpoint does not require authentication — it accepts the guest token (`?token=`) for guest orders, or the JWT for authenticated orders.
5. `GET /api/v1/orders/{order_id}/consent` (staff only) returns the consent record for audit purposes.
6. The `consent_records` table has a non-nullable `consented_at` timestamp column — it cannot be null if the row exists.

**Technical Notes:**
- The `consent_text` stored must be the exact paragraph shown to the user — the frontend sends the text string as displayed. This creates a verifiable audit trail: if the consent language ever changes, old records prove what text the user saw.
- DPDP Act 2023 requires right to erasure — a `DELETE /api/v1/users/{user_id}/data` endpoint is out of scope for this story but the schema must not make it impossible (no cascading hard deletes that would destroy the audit trail — use soft deletes or anonymization in future).

---

### Story 3.3: Frontend — Inline Consent Step

**As a** customer,
**I want** to read a plain-language explanation of how my pet's DNA will be used before I submit my order,
**so that** I feel informed and respected rather than surveilled.

**Acceptance Criteria:**

1. The consent UI is embedded in Step 3 of the OrderKit wizard (address + consent step), below the address form.
2. The consent paragraph reads (exact text, do not paraphrase):
   > "Your pet's DNA stays yours. We use your sample only to generate the report you ordered. Your genomic data is stored securely in India, never sold to third parties, and you can request deletion at any time by contacting us."
3. Below the paragraph, a checkbox with label "I understand and agree to GenePaw's use of my pet's genomic data."
4. The "Next" button (proceeding to Step 4) is disabled until the checkbox is checked. The button re-enables immediately when the checkbox is checked.
5. The checkbox is unchecked by default every time Step 3 is reached (not persisted across wizard sessions).
6. The consent text is rendered in body copy size (not footnote/small) with adequate line height — it must be readable, not buried.

**Technical Notes:**
- This satisfies UX-DR4 and UX-DR13. The exact paragraph text above is the canonical consent text — it is also what the frontend sends to `POST /api/v1/orders/{id}/consent` as `consent_text`.
- Do not use legal boilerplate or add terms like "hereby" or "aforementioned" — the text must remain plain language.

---

### Story 3.4: Frontend — 4-Step Ordering Wizard (API-Wired)

**As a** customer,
**I want** to complete the kit ordering wizard and have my order actually saved,
**so that** I get a real order confirmation with a tracking reference.

**Acceptance Criteria:**

1. The OrderKit wizard has exactly 4 steps: (1) Species Selection, (2) Package Selection, (3) Address + Consent, (4) Confirmation.
2. Step 1 displays the 13 customer-facing species tiles (filtered per Story 2.1) plus the "Species Not Listed?" tile.
3. Step 2 displays the three packages with INR prices formatted via `formatINR()`: Breed ID (₹7,999), Health + Breed (₹15,999), Complete Genome (₹27,999). Each package tile lists its key features.
4. Step 3 collects the India address form (per Story 2.3 AC1–AC6) and displays the consent paragraph and checkbox (per Story 3.3). The "Next" button is disabled until all required fields are valid and the consent checkbox is checked.
5. Step 4 (Confirmation) shows a summary: species, package, address, price. The "Place Order" button calls `POST /api/v1/orders` then `POST /api/v1/orders/{id}/consent`. On success, displays the order ID and guest token as a tracking reference. On API error, displays the RFC 7807 `detail` message inline.
6. The wizard uses TanStack Query `useMutation` for the order creation and consent calls — not raw `fetch` or `useState` loading flags.
7. The guest token returned from the API is stored in `localStorage` under key `genepaw_guest_token_{orderId}`.
8. The wizard progress indicator (step 1 of 4, etc.) updates correctly at each step.

**Technical Notes:**
- The wizard already exists in the prototype as mock UI — this story wires it to the real API. Do not redesign the wizard layout.
- If the user is authenticated (JWT in localStorage), the order is created with their user ID — the guest token is still returned and displayed but the order is also accessible via `/orders` with their JWT.

---

### Story 3.5: Frontend — Kit Tracking Status Page

**As a** customer who has placed an order,
**I want** to check the status of my sample as it moves through the lab pipeline,
**so that** I know what's happening without having to contact support.

**Acceptance Criteria:**

1. A tracking page is accessible at `/track/{orderId}?token={guestToken}` (or `/track` with a lookup form if no params are present).
2. The page calls `GET /api/v1/orders/{orderId}?token={guestToken}` and displays the current order status.
3. The status pipeline is displayed as a visual progress stepper with these 5 stages in order: Order Placed → Kit Dispatched → Sample Received → Processing → Results Ready.
4. The current status is highlighted; completed stages show as checked/filled; future stages show as upcoming/unfilled.
5. When status is `results_ready`, a prominent CTA "View Your Results" links to the results page for that order.
6. If the order is not found or the guest token is invalid, displays: "Order not found. Please check your order reference."
7. The page uses TanStack Query with a `staleTime` of 5 minutes — no auto-polling (the user must manually refresh to see updates).
8. The page is mobile-optimised: the stepper renders vertically on viewports under 640px.

**Technical Notes:**
- The 5 status stages map to the `orders.status` enum values: `pending` → Order Placed, `kit_dispatched` → Kit Dispatched, `sample_received` → Sample Received, `processing` → Processing, `results_ready` → Results Ready.
- The tracking page is the entry point for returning customers — the order confirmation page (Story 3.4 Step 4) should link to it after order placement.

---

## Epic 4: Lab Results Pipeline & Display

**Goal:** Lab results flow automatically into the platform and customers experience the genomic results reveal — breed composition, health markers, traits, lineage — and can download their personal PDF.

**FRs covered:** FR6, FR7, FR15, FR16
**NFRs covered:** NFR8
**UX-DRs covered:** UX-DR10, UX-DR11, UX-DR12

---

### Story 4.1: Backend — Lab Results Webhook

**As a** lab partner,
**I want** to POST genomic results to GenePaw via a webhook,
**so that** results automatically appear in the platform without manual data entry.

**Acceptance Criteria:**

1. `POST /api/v1/webhook/lab-results` is an unauthenticated endpoint (no JWT) secured instead by shared secret header validation: the request must include `X-Lab-Secret: <value>` matching the `LAB_WEBHOOK_SECRET` environment variable. Returns `401` if the header is missing or wrong.
2. The request body accepts: `{"order_id": "<uuid>", "result_data": {"breed_composition": [...], "health_markers": [...], "trait_scores": {...}, "lineage": {...}}}`.
3. On receipt, the endpoint: (a) validates the `order_id` exists, (b) creates or updates a `genomic_results` row with `result_data` stored in the JSONB column, (c) updates `orders.status` to `results_ready`.
4. All three database operations (validate, upsert result, update order) execute atomically in a single transaction — if any step fails, none are committed.
5. The webhook processing runs in a FastAPI `BackgroundTask` so the HTTP response returns `202 Accepted` immediately without waiting for downstream work.
6. Returns `404` RFC 7807 if the `order_id` is not found; returns `422` if `result_data` is missing required top-level keys (`breed_composition`, `health_markers`, `trait_scores`, `lineage`).
7. The endpoint logs a structured JSON entry on every call: `{event: "webhook_received", order_id: "...", status: "accepted"|"rejected", reason: "..."}`.
8. At least two pytest tests: valid payload with correct secret returns 202; missing/wrong secret returns 401.

**Technical Notes:**
- `LAB_WEBHOOK_SECRET` must be documented in `.env.example`. Its absence at startup should raise a configuration error (not silently use `None`).
- The `result_data` JSONB shape is the contract: `breed_composition` is a list of `{species: str, percentage: float}` objects; `health_markers` is a list of `{marker: str, status: "green"|"amber"|"red", description: str}` objects; `trait_scores` is a dict of trait names to numeric scores; `lineage` is a dict with at least `paternal_line` and `maternal_line` keys.

---

### Story 4.2: Backend — Results Retrieval API

**As a** customer,
**I want** to fetch my genomic results from the API,
**so that** the frontend can display my breed composition, health markers, traits, and lineage.

**Acceptance Criteria:**

1. `GET /api/v1/orders/{order_id}/results` returns the `genomic_results` row for the order. Requires either a valid JWT (customer who owns the order) or the guest token (`?token=`).
2. Returns `404` RFC 7807 if no results exist yet for the order (lab hasn't submitted yet).
3. Returns `403` if the JWT user does not own the order.
4. The response body includes: `{"order_id", "result_data": {"breed_composition", "health_markers", "trait_scores", "lineage"}, "created_at"}`.
5. At least one pytest test: results retrieved successfully with valid guest token.

---

### Story 4.3: Frontend — Results Reveal Page

**As a** customer,
**I want** to see my pet's genomic results in a rich, visual display,
**so that** I experience the "wow moment" that makes GenePaw worth talking about.

**Acceptance Criteria:**

1. The results page is at `/results/{orderId}?token={guestToken}`. It calls `GET /api/v1/orders/{orderId}/results` using TanStack Query.
2. The page has four tabs: **Breed**, **Health**, **Traits**, **Lineage**. On mobile (< 640px), tabs are swipeable using touch gestures — no horizontal scroll bar visible. All tab elements have a minimum 44px touch target height.
3. Only one Recharts chart is rendered at a time (the active tab's chart). Inactive tab charts are not mounted in the DOM — satisfies NFR8 (no multiple `ResponsiveContainer` instances simultaneously).
4. **Breed tab:** Displays a Recharts `PieChart` of breed composition percentages. On first render (first time this tab is active in the session), the chart animates in (`isAnimationActive={true}`, `animationBegin={0}`, `animationDuration={1200}`). Labels show breed name + percentage.
5. **Health tab:** Displays each health marker as a card with a traffic-light color badge (`green` = `bg-green-100 text-green-800`, `amber` = `bg-amber-100 text-amber-800`, `red` = `bg-red-100 text-red-800`), the plain-language `description`, and the marker code in small secondary text.
6. **Traits tab:** Displays trait scores as a Recharts `RadarChart` or horizontal `BarChart` — whichever renders more clearly with the available data.
7. **Lineage tab:** Displays paternal and maternal line information as formatted text cards — no chart required.
8. A "Download PDF Report" button in the page header triggers the PDF export (Story 4.4). Always visible regardless of active tab.
9. If results are not yet available (API returns 404), displays: "Your results are being processed. Check back soon." with a link back to the tracking page.

**Technical Notes:**
- Tab-gating charts (AC3) uses `activeTab` state and conditional rendering (`{activeTab === 'breed' && <BreedChart />}`), not CSS `display: none`.
- The breed composition animation (AC4) is the UX-DR11 "wonder and delight" moment — do not disable Recharts animation.
- Update the mock `SAMPLE_RESULTS` constant to match the JSONB shape exactly so the component works against mock data before the API is live.
- Swipe detection (AC2): implement using native React touch events (`onTouchStart`/`onTouchEnd` delta tracking) — do not add a swipe library.

---

### Story 4.4: Frontend — Consumer PDF Report Download

**As a** customer,
**I want** to download a PDF of my genomic report,
**so that** I can share it with my vet or keep it for my records.

**Acceptance Criteria:**

1. Clicking "Download PDF Report" on the results page generates and downloads a PDF using jsPDF + jspdf-autotable — client-side generation only, no server round-trip.
2. The PDF filename is `GenePaw_Report_{orderId}.pdf`.
3. The PDF contains: GenePaw header, pet species and order ID, breed composition table (breed name + percentage), health markers table (marker, status label, description), trait scores section, and a footer with GenePaw contact information.
4. The PDF uses `autoTable` for the breed and health tables — not manually positioned text.
5. Health marker status values are rendered as text labels ("Healthy", "Watch", "At Risk") — not color codes (PDF color support is inconsistent across viewers).
6. The download triggers without opening a new browser tab — use `jsPDF.save()` directly.
7. The PDF generates within 3 seconds on a mid-range device.

**Technical Notes:**
- Extend the existing jsPDF + jspdf-autotable pattern in the prototype rather than rewriting from scratch.
- "GenePaw header" can be text-based (large-font "GenePaw" wordmark) if no image asset is available — do not add a binary image asset to satisfy this story.

---

## Epic 5: Veterinarian Channel

**Goal:** Veterinarians can register as GenePaw partners, explore the referral program, and preview the clinical report format — turning the PDF infrastructure into an organic referral loop.

**FRs covered:** FR8, FR9
**UX-DRs covered:** UX-DR7, UX-DR8, UX-DR9, UX-DR14
**Resolves:** Architecture Gap 1 (vet clinical PDF template strategy — decision: client-side jsPDF)

---

### Story 5.1: Backend — Vet Registration API

**As a** veterinarian,
**I want** to register as a GenePaw partner,
**so that** I can receive referral benefits and access clinical reports for my clients.

**Acceptance Criteria:**

1. `POST /api/v1/vets/register` accepts `{"name", "email", "password", "clinic_name", "registration_number", "city", "state", "phone"}`. Creates a user with `role = 'vet'` and a linked `vet_profiles` table row containing the clinic and registration details.
2. The `vet_profiles` table has columns: `id`, `user_id` (FK → users), `clinic_name`, `registration_number`, `city`, `state`, `phone`, `is_verified` (boolean, default `false`), `created_at`.
3. Returns `201` with the created user `id` and `email`. Returns `409` if the email is already registered.
4. A new Alembic migration creates the `vet_profiles` table.
5. `GET /api/v1/vets/me` (requires `vet` role JWT) returns the authenticated vet's profile including `is_verified` status.
6. At least one pytest test: successful vet registration returns 201 with correct fields.

**Technical Notes:**
- `is_verified` is set manually by staff in this phase — no automated verification against a veterinary council API. A vet can register and log in with `is_verified = false`; verification gating for specific features is a future story.
- `registration_number` is a free-text field — no format validation at this stage.

---

### Story 5.2: Frontend — Vet Partner Landing Page (`/vet-program`)

**As a** veterinarian discovering GenePaw,
**I want** a dedicated landing page explaining the referral program and report depth,
**so that** I understand the value proposition and can register as a partner.

**Acceptance Criteria:**

1. The page is accessible at `/vet-program` (React Router route in `VetPortal.jsx`).
2. The page contains these sections in order:
   - **Hero:** Headline targeting vets (e.g., "Clinical-grade genomics for your patients") with a brief value statement.
   - **Referral model:** How the referral program works — earn credit per kit ordered by referred clients; clinical PDF included with every Health + Breed and Complete Genome report.
   - **Report depth:** What the clinical PDF contains — structured tables, health markers with gene codes, breed composition, lineage data — positioned as complementary to clinical notes.
   - **Registration form:** Fields: Name, Email, Password, Clinic Name, Veterinary Registration Number, City, State (India dropdown), Phone. Submit calls `POST /api/v1/vets/register` via TanStack Query `useMutation`. On success, shows: "Welcome to GenePaw Vet Partners. We'll be in touch."
3. The "For Veterinarians" footer link (added in Story 2.2) correctly navigates to this page.
4. Form validation: all fields required. Email format validated. Phone: 10-digit Indian format. On API error, displays the RFC 7807 `detail` inline.
5. The page renders correctly on mobile (375px) — all sections stack vertically, form fields full-width.

**Technical Notes:**
- This is a public marketing page — no JWT required to view or submit the registration form.
- Referral program details are static copy for now (no dynamic referral tracking in this phase).

---

### Story 5.3: Frontend — Vet Report Showcase Page (`/vet-report`)

**As a** veterinarian evaluating GenePaw,
**I want** to see a sample clinical report before committing to the program,
**so that** I can judge whether the report format is suitable for my clinical records.

**Acceptance Criteria:**

1. The page is accessible at `/vet-report` (React Router route in `VetPortal.jsx`).
2. The page displays a mock clinical report preview — a read-only HTML/Tailwind representation styled to look like a lab report (not a real PDF viewer embed).
3. The preview includes: GenePaw header with logo text, patient section (species, order ID — use mock data), breed composition table, health markers table with gene codes and plain-language descriptions, lineage section, and a "Prepared for veterinary use" footer note.
4. A "Download Sample Report (PDF)" button triggers the clinical PDF generation (Story 5.4) using mock data.
5. The page is publicly accessible — no login required.
6. A "Learn about our Vet Partner Program" CTA links to `/vet-program`.

---

### Story 5.4: Frontend — Clinical PDF Generation

**As a** veterinarian,
**I want** to download a clinical-format PDF report,
**so that** I can attach it to patient records in a format that looks professional and medically appropriate.

**Acceptance Criteria:**

1. The clinical PDF is generated client-side using jsPDF + jspdf-autotable (resolves Architecture Gap 1 — decision: jsPDF over server-side reportlab).
2. The clinical PDF is visually distinct from the consumer PDF (Story 4.4): structured tables throughout, gene codes alongside plain-language descriptions, clinical terminology ("Breed Ancestry Analysis", "Heritable Health Marker Panel"), and a "For Veterinary Use" notation in the footer.
3. The PDF contains: GenePaw header, patient summary (species, order reference, report date), breed ancestry table (breed, percentage, confidence), health marker panel table (marker name, gene code, result, interpretation), behavioral trait summary, lineage table, and vet-use footer.
4. Health marker result column uses text values: "Within Normal Range", "Monitor", "Elevated Risk" — not color coding.
5. The PDF filename is `GenePaw_Clinical_Report_{orderId}.pdf` from a real order, or `GenePaw_Clinical_Sample.pdf` from the showcase page.
6. The PDF generates without errors using the mock data on the `/vet-report` page.

**Technical Notes:**
- Two separate, well-named functions: `generateConsumerPDF(resultData, orderId)` and `generateClinicalPDF(resultData, orderId)`. Do not combine them into one function with flags.
- `generateClinicalPDF` lives in `VetPortal.jsx` or a `src/pdf.js` utility module — not in `Results.jsx`.

---

## Epic 6: Admin Portal

**Goal:** Staff can log in to a dedicated portal to manage all orders, monitor the sample pipeline status, and maintain the full species catalog including research organisms.

**FRs covered:** FR12

---

### Story 6.1: Frontend — Admin Orders Dashboard

**As a** staff member,
**I want** to see all orders in a paginated table with their current status,
**so that** I can monitor the pipeline and identify orders that need attention.

**Acceptance Criteria:**

1. The `/admin` route renders the admin dashboard in `AdminPortal.jsx`, accessible only to staff-role JWT holders (auth guard from Story 1.5).
2. The dashboard's primary view is an orders table with columns: Order ID (truncated UUID), Species, Package, Status (badge), Customer Name, City, Created At.
3. The table is paginated (20 rows per page) via `GET /api/v1/orders?page=N&page_size=20` using TanStack Query. Page navigation controls (Previous / Next / page number) are displayed below the table.
4. Each order row has a status badge color-coded: `pending` = gray, `kit_dispatched` = blue, `sample_received` = yellow, `processing` = purple, `results_ready` = green.
5. Clicking an order row opens an order detail view (same page, slide-out panel or expanded row) showing full address, consent record status (collected / not collected), and a status update control (Story 6.2).
6. The table has a status filter dropdown (All / Pending / Kit Dispatched / Sample Received / Processing / Results Ready) that appends `?status=` to the API query.
7. The dashboard uses TanStack Query — data is refetched on window focus.

**Technical Notes:**
- The `GET /api/v1/orders` endpoint already exists from Story 3.1 (staff-only, paginated). This story is purely frontend work.
- Do not add search-by-customer-name in this story — status filtering is sufficient for the first admin view.

---

### Story 6.2: Backend + Frontend — Order Status Management

**As a** staff member,
**I want** to manually update an order's pipeline status,
**so that** customers see accurate tracking information as their sample moves through the lab.

**Acceptance Criteria:**

1. `PATCH /api/v1/orders/{order_id}/status` (staff only) accepts `{"status": "<new_status>"}` and updates `orders.status`. Returns `200` with the updated order.
2. Status transitions are validated: only forward transitions are allowed (`pending` → `kit_dispatched` → `sample_received` → `processing` → `results_ready`). Returns `422` RFC 7807 if an invalid transition is attempted.
3. In the admin dashboard order detail view, a dropdown of valid next statuses is shown. Selecting a status and clicking "Update Status" calls `PATCH /api/v1/orders/{order_id}/status` via TanStack Query `useMutation`.
4. After a successful update, the orders table row updates immediately (TanStack Query cache invalidation).
5. At least one pytest test: valid forward transition succeeds; invalid backward transition returns 422.

**Technical Notes:**
- The status transition validation is on the backend — the frontend dropdown shows valid next statuses for convenience, but the backend must reject invalid transitions regardless of what the frontend sends.

---

### Story 6.3: Frontend — Species Catalog Management

**As a** staff member,
**I want** to view and manage the full species catalog including research organisms,
**so that** I can keep the database accurate as new species are added to the databank.

**Acceptance Criteria:**

1. A "Species" tab or section in the admin portal displays all species (both `customer` and `research` categories) in a table: Name, Scientific Name, Category, Active (yes/no).
2. The species list is fetched from `GET /api/v1/species?include_research=true` (staff-only endpoint that returns all 24+ species).
3. Each species row has a toggle to set `is_active` true/false via `PATCH /api/v1/species/{species_id}` (staff only). Active = visible in the customer grid; inactive = hidden from customers.
4. `GET /api/v1/species` (public, no auth) returns only `category = 'customer'` AND `is_active = true` species — the endpoint the customer grid uses.
5. `GET /api/v1/species?include_research=true` (staff only) returns all species regardless of category or `is_active`.
6. The species table shows the Category column, making it clear which species are customer-facing and which are research-only.

**Technical Notes:**
- This story requires a new backend endpoint: `PATCH /api/v1/species/{species_id}` accepting `{"is_active": bool}`, staff role required.
- The customer grid in `CustomerPortal.jsx` should be updated to call `GET /api/v1/species` via TanStack Query rather than using the local `SPECIES_DATA` constant — wires the customer grid to live data.
