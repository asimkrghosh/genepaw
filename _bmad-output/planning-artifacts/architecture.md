---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
lastStep: 8
status: 'complete'
completedAt: '2026-05-18'
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/prd-validation-report.md', '_bmad-output/planning-artifacts/ux-design-specification.md', '_bmad-output/project-context.md']
workflowType: 'architecture'
project_name: 'GenePaw'
user_name: 'Pc'
date: '2026-05-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The platform is a brownfield brownfield React SPA transitioning to a full-stack product. Functional scope spans two portals:

- **Customer portal:** 4-step kit ordering wizard (species selection → package → India address + consent → confirm), filtered species grid (13 customer-visible species), kit tracking, genomic results display (breed composition, health markers, traits, nutrition, lineage), PDF report download, veterinarian referral pages (`vet-program`, `vet-report`)
- **Admin/Staff portal:** Full species grid (24+ including research organisms), order management, sample pipeline visibility — accessed via discreet footer "Staff Login" link
- **Veterinarian channel:** Landing page, clinical PDF report showcase, registration form — drives organic referral acquisition
- **Consent infrastructure:** Inline consent in order wizard confirm step; backend must store, audit, and honour consent decisions
- **Authentication:** Currently mock/client-side only; real role-based auth (Customer / Staff / Vet) to be designed

**Non-Functional Requirements:**

- **Performance:** App.jsx is 375KB monolithic; chart components are expensive — lazy loading and code-splitting strategy required
- **Security:** No real auth exists; admin gate is purely client-side — full backend auth must replace the mock pattern entirely
- **Privacy & Compliance:** Genomic data is among the most sensitive personal data categories; India's DPDP Act (2023) applies — data residency, consent audit trail, right to erasure, and breach notification obligations
- **Mobile responsiveness:** Web-first SPA; mobile-optimised for results and tracking; minimum 44px touch targets; no native app or offline mode required
- **Data integrity:** Proprietary databank is append-only by design; versioned analysis outputs; no public exposure path
- **Localization:** INR throughout, Bangalore contact details, Indian address forms (city / state / pincode), India-first positioning

**Scale & Complexity:**

The customer-facing UX is Medium complexity. The backend, genomics pipeline, and compliance infrastructure push the overall platform to **Medium-High**.

- Primary domain: Full-stack — React SPA + REST API + genomics data pipeline + dual portal
- Complexity level: Medium-High
- Estimated architectural components: 7 major domains (Auth, Orders, Sample Pipeline, Genomics Databank, Results, Consent/Privacy, Admin)

### Technical Constraints & Dependencies

- **Frontend stack is fixed:** React 18.3.1 (JSX only, no TypeScript), Vite 5.3.1, Tailwind CSS 3.4.4 — do not change
- **No React Router today:** Navigation uses `currentPage` state; router introduction is a planned architectural step, not assumed
- **Mock data = API contract:** `SPECIES_DATA`, `SAMPLE_RESULTS`, `TRACKING_STEPS`, `DEFAULT_PRICING`, `FAQS` define the shape of future API responses
- **Open infrastructure decision:** Sequencing in-house vs. lab partner — this gates the genomics pipeline design and latency SLA
- **No deployment pipeline:** Manual `dist/` deployment today; CI/CD to be designed
- **No test framework:** Vitest + React Testing Library are the designated tools when tests are added

### Cross-Cutting Concerns Identified

1. **Authentication & role authorization** — Customer / Staff / Vet with different data visibility and capabilities
2. **Consent & genomic data privacy** — DPDP Act compliance; consent stored, auditable, and honoured across the pipeline
3. **Genomics data pipeline** — sample ingestion → sequencing → analysis → results storage; sequencing infrastructure decision is the primary unknown
4. **Frontend decomposition** — monolithic App.jsx (375KB) must be decomposed into domain modules; React Router introduction required
5. **API contract definition** — mock data shapes become API response specifications; backend must honour these contracts exactly
6. **India data localization** — data residency within India; INR; Indian address and contact standards
7. **Proprietary databank isolation** — internal-only access, append-only ingestion, no public API exposure

## Starter Template Evaluation

### Primary Technology Domain

Full-stack — brownfield React SPA (frontend fixed) + new Python/FastAPI backend service. The frontend (`genepaw/`) and backend (`genepaw-api/`) live as sibling directories.

### Starter Options Considered

| Option | Verdict |
|---|---|
| FastAPI (Python) | ✅ Selected — natural genomics fit, auto-docs, Pydantic validation, fast to ship solo |
| Express.js (Node.js) | ❌ JS consistency doesn't outweigh needing Python for genomics processing anyway |
| NestJS (TypeScript) | ❌ TypeScript conflicts with project's no-TypeScript philosophy; overkill for solo build |
| Django/DRF (Python) | ❌ Heavier than needed; FastAPI is better for a pure API + pipeline architecture |

### Selected Starter: `fastapi-new` (official FastAPI scaffolder)

**Rationale:** Python is the scientific computing standard (BioPython, Pandas, VCF parsers). FastAPI 0.136.1 is the fastest Python framework to learn and ship; it auto-generates OpenAPI docs and uses Pydantic for data validation — which will enforce the shape contracts already defined by the React mock data constants. A single Python language throughout the backend avoids split-brain architecture between the API layer and the genomics processing workers.

**Initialization Commands:**

```bash
# Install uv (modern Python package manager)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Scaffold the backend service
uvx fastapi-new genepaw-api
cd genepaw-api

# Add PostgreSQL + auth + migration dependencies
uv add sqlalchemy alembic asyncpg psycopg2-binary pydantic-settings python-jose passlib
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
Python 3.12, async-first via FastAPI 0.136.1. `uv` for dependency management (fast, modern, solo-developer friendly).

**API Contract / Validation:**
Pydantic v2 models serve as the schema layer — these will mirror the existing React mock data shapes (`SPECIES_DATA`, `SAMPLE_RESULTS`, `TRACKING_STEPS`, `DEFAULT_PRICING`) to ensure zero drift between frontend expectations and backend responses.

**Build Tooling:**
`uv` + `pyproject.toml`. Docker Compose for local development (API service + PostgreSQL).

**Database Integration:**
SQLAlchemy 2.x (async) as ORM + Alembic for schema migrations + PostgreSQL as the database engine.

**Testing Framework:**
Pytest + `httpx` (async-compatible FastAPI test client). Test files co-located with source modules.

**Code Organization:**

```
genepaw-api/
├── app/
│   ├── api/v1/           # Route handlers (thin — HTTP concerns only)
│   │   ├── auth.py
│   │   ├── orders.py
│   │   ├── species.py
│   │   ├── results.py
│   │   └── consent.py
│   ├── core/             # Config, security, JWT, dependencies
│   ├── db/               # SQLAlchemy engine, session, Base
│   ├── models/           # ORM models (Order, Sample, Result, ConsentRecord…)
│   ├── schemas/          # Pydantic schemas = API contracts
│   ├── services/         # Business logic (orders, results, consent enforcement)
│   └── workers/          # Background tasks — genomics processing pipeline
├── alembic/              # Database migrations
├── tests/
├── Dockerfile
├── docker-compose.yml    # API + PostgreSQL local dev environment
└── pyproject.toml
```

**Development Experience:**
Auto-generated OpenAPI/Swagger UI at `/docs` (zero extra work). Hot-reload via `fastapi dev`. Docker Compose manages local PostgreSQL — no manual database setup required.

**Note:** Project initialization of `genepaw-api` using the above commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- JWT + RBAC authentication must be in place before any protected route is built
- React Router v7 must be introduced before the frontend is connected to real API endpoints
- JSONB data model for genomic markers must be established before the results schema is designed
- Docker Compose + PostgreSQL local environment must be running before any backend story begins

**Important Decisions (Shape Architecture):**
- TanStack Query replaces all mock data `useState` patterns as API integration proceeds
- Domain decomposition of App.jsx aligns with React Router introduction story
- Webhook pattern for lab results requires a documented webhook endpoint contract before lab partner negotiation
- RFC 7807 error format must be consistent across all API routes from day one
- Consent flag (`consent_given` + `consent_timestamp`) on the Order model gates sample processing

**Deferred Decisions (Post-MVP):**
- Redis / caching layer — add when query performance becomes a measured problem
- Full observability (Prometheus, Grafana, Sentry) — add after first live users
- Secrets manager (AWS Secrets Manager / Vault) — add when cloud provider is selected
- Celery/RQ task queue — upgrade from BackgroundTasks when retry logic is needed at volume
- Lab API polling — add as fallback if selected lab partner does not support outbound webhooks

### Data Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Genomic marker storage | PostgreSQL JSONB columns | Marker schemas evolve as the databank grows; JSONB avoids constant migrations while keeping ACID compliance and SQL queryability |
| Caching | None at MVP | PostgreSQL performance is sufficient early; add Redis when queue or cache is a measured need |
| Background processing | FastAPI BackgroundTasks | Sequencing happens externally at the lab; GenePaw BackgroundTasks handles fast post-webhook work (notifications, result generation) — upgrade to RQ when retry logic is needed |
| Migrations | Alembic (`alembic upgrade head` on deploy) | Auto-generate via `alembic revision --autogenerate`; migrations in `alembic/versions/` |

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| Auth method | JWT via `python-jose` | Stateless, standard for REST + SPA, no session storage needed |
| Authorization | RBAC — Customer / Staff / Vet | Three clean roles; simple FastAPI dependency injection per role |
| Encryption at rest | Disk-level (cloud provider) | **Dependency:** cloud provider disk encryption must be enabled when infrastructure is provisioned |
| Encryption in transit | HTTPS/TLS at reverse proxy layer | FastAPI does not terminate TLS; Nginx or cloud load balancer handles this |
| PII isolation | User identity separate from genomic data | Name/email/phone linked to genomic results only by internal ID; limits breach exposure, simplifies DPDP compliance |
| Consent enforcement | `consent_given: bool` + `consent_timestamp` on Order | API layer blocks order from transitioning to `processing` state without consent flag; simple, auditable |

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| API versioning | URL versioning (`/api/v1/`) | Explicit, debuggable, easy to evolve — add `/api/v2/` without breaking existing clients |
| CORS | Strict — explicit allowed origins via env variable | Genomic data sensitivity; wildcard origin never acceptable |
| Frontend ↔ Backend (dev) | Direct fetch to `localhost:8000` via `VITE_API_URL` | Single env var to flip between dev and prod; no Vite proxy complexity |
| Error format | RFC 7807 Problem Details (`type`, `title`, `status`, `detail`) | Standard format; future-proofs API for vet and institution clients |
| Lab results ingestion | Lab webhook → `/api/v1/webhook/lab-results` → BackgroundTask | Event-driven; **dependency:** lab partner selection criteria must include webhook support |

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Routing | React Router v7 | Enables auth-protected routes, deep linking, browser navigation — introduced at start of implementation |
| App.jsx decomposition | Domain-based: `CustomerPortal`, `AdminPortal`, `VetPortal`, `OrderFlow`, `Results` | Aligns with role boundaries and routing; decomposed during React Router introduction story |
| API data fetching | TanStack Query (React Query) | Replaces mock `useState` constants; handles loading/error states, caching, background refetch |
| Env configuration | Vite env variables (`VITE_API_URL` in `.env.local`) | Vite standard; injected at build time for production |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Local dev environment | Docker Compose: `api` (port 8000) + `db` (port 5432); React Vite outside Docker (port 3000) | One command starts backend; Vite outside Docker for fast hot reload |
| Backend env config | `pydantic-settings` + `.env` files | Settings class reads env vars with `.env` fallback; integrates with Docker Compose `env_file:` |
| CI/CD | GitHub Actions | Free for solo dev; runs on push/PR; one YAML file to maintain |
| Monitoring & logging | Structured JSON logging to stdout | Zero infrastructure; cloud provider captures automatically; upgrade to Sentry post-launch |

### Decision Impact Analysis

**Implementation sequence driven by dependencies:**
1. Docker Compose + PostgreSQL setup (unblocks all backend work)
2. Alembic + base models + JSONB schema (unblocks data layer)
3. JWT + RBAC auth (unblocks all protected routes)
4. React Router v7 + App.jsx domain decomposition (unblocks frontend integration)
5. API endpoints (`/api/v1/`) + TanStack Query wiring (unblocks feature stories)
6. Consent flag + webhook endpoint (unblocks order flow and lab integration)
7. GitHub Actions CI (can run in parallel with any of the above)

**Cross-component dependencies:**
- Encryption at rest → must be confirmed when cloud provider is selected
- Lab webhook pattern → must be validated against lab partner capabilities during partner selection
- RBAC roles → affect every API route, every React Router guard, and the vet/admin portal decomposition
- JSONB genomic schema → defines Pydantic response schema → defines TanStack Query data shape in React

## Implementation Patterns & Consistency Rules

**Critical conflict points addressed: 6 areas** — naming, structure, API format, state management, error handling, auth flow

### Naming Patterns

**Database Naming (PostgreSQL / SQLAlchemy):**

| Element | Convention | Example |
|---|---|---|
| Tables | `snake_case` plural | `orders`, `samples`, `consent_records`, `genomic_results` |
| Columns | `snake_case` | `user_id`, `consent_given`, `created_at` |
| Foreign keys | `{singular_table}_id` | `order_id`, `user_id`, `sample_id` |
| Primary keys | always `id` | `id` (integer or UUID — decide per model) |
| Indexes | `ix_{table}_{column}` | `ix_orders_user_id` |
| SQLAlchemy models | `PascalCase` | `Order`, `User`, `Sample`, `ConsentRecord` |

**API Naming (FastAPI):**

| Element | Convention | Example |
|---|---|---|
| Resource paths | plural nouns | `/api/v1/orders`, `/api/v1/species`, `/api/v1/results` |
| Multi-word paths | `kebab-case` | `/api/v1/genomic-results`, `/api/v1/lab-results` |
| Route parameters | `{name}` | `{order_id}`, `{sample_id}` |
| Query parameters | `snake_case` | `?species_id=1&page_size=20` |
| Webhook path | `/api/v1/webhook/{source}` | `/api/v1/webhook/lab-results` |

**Python Backend Code:**

| Element | Convention | Example |
|---|---|---|
| Variables / functions | `snake_case` | `create_order`, `get_results_by_sample_id` |
| Classes | `PascalCase` | `OrderService`, `ConsentRepository` |
| Constants | `SCREAMING_SNAKE_CASE` | `JWT_ALGORITHM`, `MAX_PAGE_SIZE` |
| Pydantic schemas | `{Domain}{Action}` | `OrderCreate`, `OrderResponse`, `OrderUpdate` |
| Service functions | `verb_noun` | `create_order`, `process_webhook`, `mark_consent_given` |
| Router files | `snake_case` | `orders.py`, `species.py`, `consent.py` |

**React Frontend Code (extends project-context.md rules):**

| Element | Convention | Example |
|---|---|---|
| API field access | `snake_case` (matches API) | `result.breed_name`, `order.consent_given` |
| TanStack Query hooks | `use{Resource}` | `useOrders`, `useResults`, `useSpecies` |
| Route paths | `kebab-case` | `/order-kit`, `/vet-program`, `/results/:sample_id` |
| API client module | single file | `src/api.js` (all fetch calls, uses `VITE_API_URL`) |

### Structure Patterns

**Backend test files:** Co-located alongside source (`orders_test.py` next to `orders.py`). Pytest discovers both automatically.

**Pydantic schema pattern:** Every domain has three schemas:
- `{Domain}Create` — fields required to create (POST body)
- `{Domain}Update` — fields allowed to update (PATCH body, all optional)
- `{Domain}Response` — fields returned to client (never expose internal fields like password hashes)

**FastAPI dependency injection:** All shared dependencies (current user, DB session, role checks) live in `app/core/dependencies.py`. Never inline auth logic in route handlers.

**React domain files:** Each domain module imports from `src/api.js` and uses TanStack Query hooks internally. Domain files do not import from each other — shared primitives go in `src/shared.jsx`.

### Format Patterns

**API response shapes:**

```
GET  /api/v1/orders          → { "items": [...], "total": N, "page": N, "page_size": N }
GET  /api/v1/orders/{id}     → { order object directly — no wrapper }
POST /api/v1/orders          → { created order object }
PATCH /api/v1/orders/{id}    → { updated order object }
DELETE /api/v1/orders/{id}   → { "deleted": true }
```

**Date/time:** Always ISO 8601 UTC strings — `"2026-05-18T10:30:00Z"`. Never Unix timestamps. Never locale-formatted strings in the API.

**Booleans:** Always `true`/`false`. Never `1`/`0`, never `"yes"`/`"no"`.

**Null fields:** Always include as `null`. Never omit fields from response objects — omission breaks frontend destructuring.

**Error format (RFC 7807):**
```json
{
  "type": "https://genepaw.in/errors/not-found",
  "title": "Order Not Found",
  "status": 404,
  "detail": "No order with id 42 exists."
}
```
Validation errors (422) add: `"errors": [{"field": "email", "msg": "Invalid email format"}]`

### State Management Patterns

**React state split — strict rule:**

| State type | Where it lives |
|---|---|
| Server data (orders, results, species) | TanStack Query — never duplicate in `useState` |
| UI state (modal open, selected tab, form input) | `useState` — never put in TanStack Query |
| Auth token | `localStorage` under key `genepaw_token` |

**TanStack Query key convention:**
```js
["species"]                             // all species
["species", { customer_visible: true }] // filtered
["orders", userId]                      // user's orders
["results", sampleId]                   // specific result
```

**Mutations:** Always use `useMutation` for POST/PATCH/DELETE. On success, invalidate the relevant query key to trigger a refetch.

### Process Patterns

**Error handling flow:**
- Backend: raise `HTTPException` with RFC 7807 `detail` dict. Global handler in `app/core/exceptions.py` formats all unhandled exceptions.
- Frontend: TanStack Query `error` object → `error.detail` displayed via shared `ErrorMessage` component. React Router v7 `errorElement` catches route-level errors.
- 401 from API → clear `localStorage` token → redirect to login page.

**Loading state rules:**
- Initial data load (`isLoading === true`): show skeleton or spinner in place of content
- Background refresh (`isFetching === true`, `isLoading === false`): subtle indicator only — never block the UI
- Mutations in progress: disable submit button, show inline spinner

**Auth flow:**
- Login → store JWT in `localStorage` as `genepaw_token`
- React Router v7 `loader` on protected routes: check token existence + expiry; redirect to `/login` if invalid
- Role check in `loader`: decode JWT claims, verify role matches route requirement (customer / staff / vet)

### Enforcement Guidelines

**All agents MUST:**
- Use `snake_case` for all database columns, API response fields, and Python identifiers
- Use the three-schema pattern (`Create` / `Update` / `Response`) for every domain entity
- Put all fetch calls in `src/api.js` — never inline `fetch()` directly in components
- Use TanStack Query for all server data — never `useEffect` + `useState` for API calls
- Return RFC 7807 error shape for all error responses
- Never expose SQLAlchemy model objects directly from routes — always go through a `Response` schema
- Co-locate backend test files alongside the source file they test

**Anti-patterns to reject:**
- `camelCase` field names in API responses
- `useEffect(() => { fetch(...) }, [])` for data loading
- Inline `try/catch` in route handlers instead of the global exception handler
- Hardcoded `localhost:8000` in React — always use `VITE_API_URL`
- Direct SQLAlchemy model returns from FastAPI routes

## Project Structure & Boundaries

### Repository Layout

Two sibling directories — frontend exists, backend is new:

```
_workarea/gene_annotation/
├── GenePaw/          ← existing React SPA (evolving)
└── genepaw-api/      ← new FastAPI backend (to be created)
```

### Frontend: `GenePaw/` (brownfield evolution)

```
GenePaw/
├── src/
│   ├── main.jsx                  # Entry point — do not modify
│   ├── App.jsx                   # React Router v7 setup + auth guards
│   ├── index.css                 # Tailwind directives
│   ├── api.js                    # All fetch calls — uses VITE_API_URL
│   ├── shared.jsx                # Reusable primitives: Button, Badge, SectionTitle, ErrorMessage
│   ├── CustomerPortal.jsx        # Home, Species grid, Pricing, Tracking
│   ├── OrderFlow.jsx             # 4-step kit ordering wizard + consent step
│   ├── Results.jsx               # Breed charts, health markers, traits, PDF download
│   ├── VetPortal.jsx             # vet-program landing, vet-report showcase
│   └── AdminPortal.jsx           # Staff-only: order management, sample pipeline
├── .env.local                    # VITE_API_URL=http://localhost:8000 (gitignored)
├── .env.example                  # VITE_API_URL=https://api.genepaw.in
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .gitignore
```

**Requirements → frontend files:**

| Requirement | File |
|---|---|
| Species grid (customer-filtered) | `CustomerPortal.jsx` |
| Kit ordering wizard + consent | `OrderFlow.jsx` |
| Results reveal + PDF download | `Results.jsx` |
| Kit tracking status | `CustomerPortal.jsx` |
| Vet landing + report showcase | `VetPortal.jsx` |
| Admin order/sample management | `AdminPortal.jsx` |
| All API calls | `api.js` |
| Shared UI primitives | `shared.jsx` |
| Auth guards + routing | `App.jsx` |

### Backend: `genepaw-api/` (new)

```
genepaw-api/
├── app/
│   ├── main.py                         # FastAPI app: middleware, CORS, router registration
│   ├── api/
│   │   └── v1/
│   │       ├── router.py               # Aggregates all v1 routers
│   │       ├── auth.py                 # POST /api/v1/auth/login, /auth/refresh
│   │       ├── auth_test.py
│   │       ├── orders.py               # CRUD /api/v1/orders — consent enforcement
│   │       ├── orders_test.py
│   │       ├── species.py              # GET /api/v1/species (role-filtered)
│   │       ├── species_test.py
│   │       ├── samples.py              # GET /api/v1/samples/{id}/tracking
│   │       ├── samples_test.py
│   │       ├── results.py              # GET /api/v1/results/{sample_id}
│   │       ├── results_test.py
│   │       ├── users.py                # POST /api/v1/users/register (+ vet registration)
│   │       ├── users_test.py
│   │       ├── admin.py                # Admin-only: all orders, sample pipeline view
│   │       ├── admin_test.py
│   │       ├── webhooks.py             # POST /api/v1/webhook/lab-results
│   │       └── webhooks_test.py
│   ├── core/
│   │   ├── config.py                   # pydantic-settings Settings (reads .env)
│   │   ├── config_test.py
│   │   ├── security.py                 # JWT encode/decode, bcrypt password hashing
│   │   ├── security_test.py
│   │   ├── dependencies.py             # get_db, get_current_user, require_role(Customer/Staff/Vet)
│   │   └── exceptions.py              # Global RFC 7807 exception handler
│   ├── db/
│   │   ├── base.py                     # SQLAlchemy Base, async engine
│   │   └── session.py                  # AsyncSession factory
│   ├── models/
│   │   ├── user.py                     # id, email, hashed_password, role
│   │   ├── order.py                    # id, user_id, package_tier, status, consent_given, consent_timestamp
│   │   ├── sample.py                   # id, order_id, tracking_status, lab_reference_id
│   │   ├── result.py                   # id, sample_id, genomic_data (JSONB), generated_at
│   │   ├── species.py                  # id, name, customer_visible (bool), research_only (bool)
│   │   └── consent_record.py           # id, order_id, given_at, ip_address
│   ├── schemas/
│   │   ├── auth.py                     # LoginRequest, TokenResponse
│   │   ├── user.py                     # UserCreate, UserUpdate, UserResponse
│   │   ├── order.py                    # OrderCreate, OrderUpdate, OrderResponse
│   │   ├── sample.py                   # SampleResponse, TrackingStatusResponse
│   │   ├── result.py                   # ResultResponse (genomic_data: dict)
│   │   ├── species.py                  # SpeciesCreate, SpeciesResponse
│   │   └── webhook.py                  # LabResultWebhookPayload
│   ├── services/
│   │   ├── auth_service.py             # authenticate_user, create_access_token
│   │   ├── auth_service_test.py
│   │   ├── order_service.py            # create_order, mark_consent_given, submit_order
│   │   ├── order_service_test.py
│   │   ├── sample_service.py           # update_tracking_status, get_sample_by_order
│   │   ├── result_service.py           # store_result, get_result_by_sample_id
│   │   └── webhook_service.py          # process_lab_result_webhook
│   └── workers/
│       └── result_processor.py         # BackgroundTask: raw lab data → structured result
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/                       # Migration files (auto-generated)
├── conftest.py                         # Shared pytest fixtures: test DB, test client, mock JWT
├── .env                                # Local dev values (gitignored)
├── .env.example                        # Template — committed to repo
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

**Requirements → backend files:**

| Requirement | Models | Schemas | Service | Route |
|---|---|---|---|---|
| Auth (JWT + RBAC) | `user.py` | `auth.py` | `auth_service.py` | `auth.py` |
| Kit ordering + consent | `order.py`, `consent_record.py` | `order.py` | `order_service.py` | `orders.py` |
| Species (role-filtered) | `species.py` | `species.py` | — | `species.py` |
| Sample tracking | `sample.py` | `sample.py` | `sample_service.py` | `samples.py` |
| Genomic results (JSONB) | `result.py` | `result.py` | `result_service.py` | `results.py` |
| Lab webhook ingestion | `sample.py`, `result.py` | `webhook.py` | `webhook_service.py` | `webhooks.py` |
| Vet registration | `user.py` (role=vet) | `user.py` | `auth_service.py` | `users.py` |
| Admin portal API | all models | all schemas | all services | `admin.py` |

### Architectural Boundaries

**API Boundary (React ↔ FastAPI):**
- All React calls go through `src/api.js` — single `baseURL = import.meta.env.VITE_API_URL`
- JWT attached as `Authorization: Bearer {token}` header on every authenticated request
- All responses in `snake_case` JSON; all errors in RFC 7807 format

**Role Boundary (RBAC):**
- `Customer` — orders, own results, tracking, species (filtered), vet pages
- `Staff` — all of the above + admin routes, full species list, raw webhook data
- `Vet` — own registration, results viewer (clinical format), vet-specific PDF endpoint

**Data Boundary (JSONB genomic data):**
- `result.genomic_data` JSONB column holds the full analysis output
- Shape contract: `{ "breed_composition": [...], "health_markers": {...}, "trait_scores": {...}, "lineage": {...} }`
- Flexible structure — new marker categories appended without migrations

**Lab Boundary (Webhook):**
- Single inbound endpoint: `POST /api/v1/webhook/lab-results`
- Payload defined in `schemas/webhook.py` — contract agreed with lab partner
- Webhook validates shared secret via `X-Lab-Secret` header before processing

### Data Flow

```
Customer orders kit
  → POST /api/v1/orders        (consent_given=true required to proceed)
  → order_service.create_order
  → Order row + ConsentRecord row created; status: "kit_dispatched"

Lab processes sample
  → POST /api/v1/webhook/lab-results  (X-Lab-Secret validated)
  → webhook_service.process_lab_result_webhook
  → Sample.tracking_status → "results_ready"
  → BackgroundTask: result_processor.generate_result
  → Result row created (genomic_data JSONB populated)

Customer views results
  → GET /api/v1/results/{sample_id}  (JWT: Customer role)
  → result_service.get_result_by_sample_id → ResultResponse
  → React Results.jsx: useResults(sampleId) via TanStack Query
  → Recharts breed charts + health marker traffic lights + PDF download
```

### Development Workflow

```bash
# Backend (from genepaw-api/)
docker compose up           # API (port 8000) + PostgreSQL (port 5432)
alembic upgrade head        # run migrations
fastapi dev app/main.py     # hot-reload dev server

# Frontend (from GenePaw/)
npm run dev                 # Vite dev server (port 3000), reads .env.local
```

**GitHub Actions CI** (`.github/workflows/ci.yml` in `genepaw-api/`):
- On push/PR to main: `pytest` (backend) → `npm run build` (frontend build check)

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

| Check | Result |
|---|---|
| FastAPI 0.136.1 + SQLAlchemy 2.x + Alembic + PostgreSQL | ✅ All async-compatible, production-proven stack |
| React 18.3.1 + React Router 7.15.1 + TanStack Query 5.100.10 | ✅ All compatible, actively maintained |
| JWT (python-jose) + FastAPI dependency injection + RBAC | ✅ Standard FastAPI auth pattern |
| JSONB + PostgreSQL + SQLAlchemy | ✅ First-class SQLAlchemy `JSONB` column type support |
| Docker Compose + FastAPI + PostgreSQL | ✅ Standard local dev setup |
| GitHub Actions + pytest + Vite build | ✅ All compatible |

**Version note:** TanStack Query v5 prefers `isPending` over `isLoading` for initial loads (`isLoading` still works as a derived alias — `isPending && isFetching`). Agents should use `isPending` per v5 idiom.

**Pattern Consistency:** ✅ `snake_case` throughout API/DB/Python is internally consistent. Three-schema pattern maps to every domain model. RFC 7807 errors are the single error format at all layers. `src/api.js` as the sole fetch boundary is consistent with the TanStack Query rule.

**Structure Alignment:** ✅ Domain decomposition (CustomerPortal/AdminPortal/VetPortal) matches RBAC roles exactly. Webhook route + BackgroundTask worker maps cleanly to the lab results ingestion decision. Co-located test files match the declared pattern.

### Requirements Coverage Validation

**Functional Requirements:**

| Requirement | Status |
|---|---|
| Kit ordering wizard + consent enforcement | ✅ OrderFlow.jsx → orders.py → ConsentRecord model |
| Species grid (customer-filtered vs admin-full) | ✅ `customer_visible` flag on Species model, role-filtered route |
| Genomic results (breed, health, traits, lineage) | ✅ JSONB `genomic_data` with defined shape contract |
| PDF download (consumer + vet clinical) | ⚠️ Vet clinical template strategy deferred to story (Gap 1) |
| Kit tracking status | ✅ Sample model `tracking_status` → samples.py |
| Vet partner pages + registration | ✅ VetPortal.jsx + users.py (role=vet) |
| Admin portal | ✅ AdminPortal.jsx + admin.py (Staff role) |
| Lab webhook ingestion | ✅ webhooks.py + webhook_service + result_processor BackgroundTask |
| Auth (JWT + RBAC: Customer/Staff/Vet) | ✅ core/security.py + core/dependencies.py |
| Consent inline in order flow | ✅ `consent_given` + `consent_timestamp` on Order model |
| India localization (INR, Bangalore, Indian address) | ✅ Preserved in existing React frontend |

**Non-Functional Requirements:**

| NFR | Status |
|---|---|
| Performance (App.jsx → decomposed) | ✅ Domain decomposition + React Router code splitting |
| Security (JWT, bcrypt, HTTPS, PII isolation) | ✅ Fully documented |
| Privacy/DPDP Act compliance | ✅ ConsentRecord model + PII isolation pattern |
| Mobile responsiveness | ✅ Existing Tailwind responsive design preserved |
| Proprietary databank isolation | ✅ Internal-only access, no public endpoint for raw genomic data |
| Encryption at rest | ✅ Documented as cloud provider dependency |

### Gap Analysis

**Important Gaps (address in early stories, not blocking sprint start):**

**Gap 1 — Vet clinical PDF template**
UX spec requires a separate vet-formatted clinical PDF distinct from the consumer-facing PDF. Architecture does not yet decide whether this is client-side jsPDF with a second template or server-side PDF generation (Python `reportlab`). Resolve in the vet portal story.

**Gap 2 — Baseline databank migration**
`marker_categories_362.js` and `Cross_Species_Gene_Annotation_Database.xlsx` in the project root represent the existing baseline databank referenced in the PRD. These must be loaded into PostgreSQL (`species` table + reference genomic data) via an Alembic seed migration. This is the second implementation story after Docker Compose setup.

**Gap 3 — Customer registration flow**
Not yet decided: customer self-registers via signup form, or account is created automatically on first order submission. Resolve when designing `users.py` and `UserCreate` schema.

**Gap 4 — Webhook secret management**
Env variable name: `LAB_WEBHOOK_SECRET` in `.env`, read via `Settings` class. `X-Lab-Secret` request header validated against this value before processing any webhook payload.

**Defaults to use unless overridden:**
- JWT access token expiry: 24 hours; refresh token expiry: 30 days
- Default pagination `page_size`: 20
- CORS allowed origins env variable: `ALLOWED_ORIGINS`

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**
**Confidence Level: High**
**Checklist Score: 16/16**

**Key Strengths:**
- Brownfield evolution is clear — existing React prototype preserved and extended, not replaced
- JSONB genomic data model accommodates the growing databank without constant migrations
- Single-responsibility boundaries (`api.js`, `dependencies.py`, `exceptions.py`) eliminate the most common agent inconsistency points
- All three user roles are architecturally first-class from day one — no RBAC retrofitting later
- End-to-end data flow (lab webhook → background processing → customer results) is fully specified

**Areas for Future Enhancement:**
- Redis + RQ task queue when lab result volume demands retry logic
- Full observability stack (Sentry + log aggregation) post-launch
- Secrets manager when cloud provider is selected
- API v2 design when vet/institutional clients need divergent contracts

### Implementation Handoff

**Technology Versions (verified May 2026):**
- FastAPI: 0.136.1
- Python: 3.12
- React: 18.3.1
- React Router: 7.15.1
- TanStack Query: 5.100.10
- Vite: 5.3.1
- Tailwind CSS: 3.4.4
- PostgreSQL: latest stable
- SQLAlchemy: 2.x (async)
- Alembic: latest stable

**First Implementation Story:** Initialize `genepaw-api/` with `uvx fastapi-new genepaw-api` + Docker Compose setup with PostgreSQL.

**Second Story:** Seed migration — load `marker_categories_362.js` and `Cross_Species_Gene_Annotation_Database.xlsx` into the `species` table via Alembic seed migration.

**AI Agent Guidelines:**
- Read this document before implementing any story
- Follow all architectural decisions exactly as documented
- Use the three-schema pattern for every new domain entity
- All fetch calls go through `src/api.js` — no exceptions
- All API errors must return RFC 7807 format
- Never expose SQLAlchemy models directly from routes — always use a `Response` schema
- Refer to this document for all architectural questions before making independent decisions
