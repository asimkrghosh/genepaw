# Deferred Work Log

## Deferred from: code review of 5-1-backend-vet-registration-api (2026-05-21)

- Email case-sensitivity allows registration bypass (`VET@clinic.com` passes the SELECT check that uses `=` comparison) — same gap exists in `auth.py`; fix both together by normalizing emails to lowercase on write [`app/api/v1/vets.py:21`].
- No password minimum length validation — `password: str` with no `min_length`; also absent in `auth.py` `RegisterRequest`; add consistently across all registration schemas [`app/schemas/vet.py:12`].
- Empty/whitespace strings accepted for all required string fields (`name`, `clinic_name`, `city`, `state`, `phone`) — no spec requirement for field-level validation; add `@field_validator` with `.strip()` check in a hardening pass [`app/schemas/vet.py`].
- `registration_number` has no uniqueness constraint in DB — spec treats it as free-text; revisit if VCI validation is added later [`app/models/vet_profile.py`].
- No rate limiting on `POST /vets/register` — cross-cutting infrastructure concern; address globally when rate limiting is added to the API gateway layer [`app/api/v1/vets.py`].
- Flush mock fragility: `obj.id is None` guard in `_db_register_new_vet` will silently fail to assign UUID if `User` ever gets a Python-side `uuid4()` default; revisit if User model default changes [`app/api/v1/vets_test.py`].

## Deferred from: code review of 4-4-frontend-consumer-pdf-report-download (2026-05-21)

- No null guard on `resultData` parameter in `generateConsumerPDF` — caller site (`Results.jsx:293`) structurally prevents null; add defensive guard when function is reused from other call sites [`src/reportPdf.js:515`].
- `orderId` used raw in PDF filename — URL router constrains orderId to URL-safe chars in practice; sanitize with `.replace(/[^a-zA-Z0-9_-]/g, "_")` before any new call site that accepts user-provided IDs [`src/reportPdf.js:521`].
- Empty `trait_scores` object renders section header with no rows — cosmetic; data contract prevents this in real API responses; add empty-state message when `traits.length === 0` in a future UX polish pass [`src/reportPdf.js:630`].

## Deferred from: code review of App.jsx (2026-05-21)

- No JWT signature verification in `AuthGuard` — client-side-only check; a forged token with `role: "staff"` passes the guard. Requires backend session validation or token introspection endpoint [`src/App.jsx:AuthGuard`].
- JWT stored in `localStorage` is XSS-vulnerable — any injected script can steal the token; requires HttpOnly cookie migration (architectural change) [`src/App.jsx:13`].
- Bare `catch {}` with no logging in `AuthGuard` — all error types (parse errors, injected values) silently redirect with no dev observability [`src/App.jsx:53`].
- `/vet-program` and `/vet-report` routes unguarded — design decision needed: do vet routes require authentication? [`src/App.jsx:74-75`].
- Role string comparison fragility + Navbar divergence — `"staff"` compared as a bare string in `AuthGuard`, `AppContext`, and `Navbar isAdmin`; a role constants module shared across all three would prevent silent drift when roles are added [`src/App.jsx:50`, `src/AppContext.jsx:92`, `src/shared.jsx`].
- Single top-level `Suspense` boundary — a slow chunk loading blocks user interaction on the entire app; each route should have its own `Suspense` boundary for independent loading [`src/App.jsx:33`].
- `/vet-report` aliases `/vet-program` with no differentiation — both render `<VetPortal />`; if `VetPortal` doesn't branch on `useLocation().pathname`, the two routes show identical content; verify intent [`src/App.jsx:74-75`].
- `/results` routes serve genetic PHI/PII with no customer-level frontend auth — no customer session mechanism exists; backend API is the authorization layer. Defer until a customer login/session flow is designed [`src/App.jsx:71-72`].

## Deferred from: code review of 4-3-frontend-results-reveal-page (2026-05-21)

- Empty `breed_composition` or `trait_scores` arrays render blank sections with no empty-state message — triggered only by lab data quality issues where webhook passes top-level key presence check but sends an empty array; AC scope does not require empty-state UI [`src/Results.jsx`].
- No `ErrorBoundary` in component tree — any render-time `TypeError` (e.g. from malformed result_data) unmounts the entire React tree to a white screen in production; pre-existing app-wide architectural gap not introduced by this story; applies to all pages.
- No `gcTime` configured on `useQuery` — TanStack Query default `gcTime` (5 min) means sensitive genomic health data lingers in in-memory cache after the user navigates away; set `gcTime: 0` in a future security hardening pass [`src/Results.jsx`].
- Stale `activeTab` closure during mid-swipe while React re-renders — if a query state update triggers a re-render mid-swipe, `handleTouchEnd` may read an outdated `activeTab` and switch to the wrong neighbour tab; very low probability in practice [`src/Results.jsx`].

## Deferred from: code review of 4-2-backend-results-retrieval-api (2026-05-21)

- JWT auth with guest orders (user_id=NULL) — JWT user receives 403 instead of passing auth; pre-existing behavior copied from get_order [`app/api/v1/orders.py:104-115`].
- Brute-force guest token via known order_id — no rate-limit or lockout; pre-existing architecture concern applies to all guest-token endpoints.
- No staff/admin role restriction on results endpoint — any authenticated user can attempt access; pre-existing pattern; admin portal is Epic 6.
- Call-count mock pattern fragile — test ordering implicitly depends on execute call sequence; pre-existing pattern established in webhooks_test.py [`app/api/v1/orders_test.py:165-184`].
- Guest token exposed in URL query param — leaks in access logs and browser history; pre-existing in get_order and consent endpoints.
- result_data returned as unfiltered dict[str,Any] — intentional passthrough per spec; lab webhook owns shape validation.
- ORM attributes assigned to MagicMock(spec=GenomicResult) in test fixtures — established pattern from webhooks_test.py _make_order helper.
- No order status guard — results returned for orders in any status, not just results_ready; not required by spec; AC1 specifies auth only.
- get_optional_user silently returns None for expired JWTs — pre-existing; affects all JWT-protected endpoints.
- Schema omits GenomicResult.id field — intentional per AC4 response spec (id not in required body).
- Duplicate auth-check logic across create_consent, get_order, get_results (3 copies) — pre-existing; refactor is separate concern.
- 401 returned when no auth provided — spec says "requires JWT or guest token" but doesn't list 401 explicitly; pre-existing behavior copied from get_order.
- Two distinct 404s (order not found vs results not available) not differentiated by error type/code — pre-existing pattern; AC2 explicitly specifies the distinct message strings.

## Deferred from: code review of 4-1-backend-lab-results-webhook (2026-05-21)

- AC3: Secret check runs after body parsing — FastAPI resolves all dependencies (including body) before handler; malformed-body + wrong-secret returns 422, not 401. Fix requires middleware or Depends-based pre-body secret gate [`app/api/v1/webhooks.py`].
- Race condition: concurrent duplicate webhooks can both see no GenomicResult, both attempt INSERT, second hits `uq_genomic_results_order_id` → 500. Fix with `INSERT … ON CONFLICT DO UPDATE` or `SELECT … FOR UPDATE` when concurrency SLA is defined [`app/api/v1/webhooks.py`].
- order.status overwritten unconditionally on redelivery — safe today (idempotent same-value write), but a guard on current status would prevent masking upstream pipeline errors [`app/api/v1/webhooks.py`].
- LAB_WEBHOOK_SECRET dev default `"dev-only-webhook-secret"` ships in source — rotate before any staging/production deployment; pre-existing in config.py [`app/core/config.py:16`].
- result_data not deeply validated beyond top-level key presence — inner shape (list/dict/type assertions) not checked; intentional per spec; harden in a future schema story when 4.3 consumer shapes are confirmed [`app/schemas/webhook.py`].
- Test file inside app package — `webhooks_test.py` lives at `app/api/v1/`; pre-existing pattern (orders_test.py same location); migrate to top-level `tests/` in a future test-structure story.
- process_result has no error boundary — placeholder no-op; when real PDF/email logic is added, exceptions will be silently swallowed by FastAPI's background task runner; add try/except when implementing [`app/workers/result_processor.py`].
- Re-delivered webhook fires duplicate background task — `process_result` is scheduled on every call including upsert-update path; harmless now (no-op), but may cause duplicate emails/PDFs once implemented [`app/api/v1/webhooks.py`].
- Order-ID oracle via rejected logs — invalid-secret 401s log the order_id, leaking order existence to unauthenticated callers who can observe log output; by spec design (AC8 requires logging order_id on every call).

## Deferred from: code review of 3-5-frontend-kit-tracking-status-page (2026-05-21)

- Navbar "Track Kit" link not highlighted on `/track/:orderId` — Navbar compares `activePath === l.path` (exact `/track`); fails on parameterised path; `currentPage` prop is unused inside Navbar; fix requires Navbar to use `startsWith` or a `matchPath` check [`src/shared.jsx`].
- `isError` branch shows "Order Not Found" for network failures — same message for HTTP 404/403 and transient connection errors; fix requires `apiFetch` to expose HTTP status codes so the component can distinguish "bad order ref" from "network down" [`src/CustomerPortal.jsx LiveTracking`].
- `statusIndex === -1` has no fallback UI for unknown/future API status values — if the backend adds a new status (e.g. `"cancelled"`), the stepper renders all stages grey with no label; add a "Status unknown" fallback message when `statusIndex === -1` and `order` is defined [`src/CustomerPortal.jsx:818`].
- "View Your Results" uses `navigate()` not a navigable `<Link>` — prevents right-click → open in new tab; consistent with app-wide button pattern; revisit in a UX hardening pass [`src/CustomerPortal.jsx:950`].

## Deferred from: code review of 3-4-frontend-4-step-ordering-wizard-api-wired (2026-05-20)

- Consent failure + retry creates orphaned orders — `placeOrder` mutation calls `POST /api/v1/orders` again on retry rather than re-attempting consent for the existing order; each failed-consent retry leaves a new order in the DB without a consent record. Spec acknowledges as MVP limitation. Address with order idempotency key or two-phase submit in Epic 4+.
- AppProvider was missing from `src/main.jsx` — exported but never registered; every route using `useApp()` crashed at runtime. Fixed in this story as a prerequisite. Pre-existing bug, now resolved.

## Deferred from: code review of 3-3-frontend-inline-consent-step (2026-05-20)

- Consent checkbox (`src/OrderFlow.jsx:163`) has no `aria-required` attribute — required status is communicated only by disabling the Next button; add `aria-required="true"` in a future a11y hardening pass consistent with other required inputs.

## Deferred from: code review of 3-2-backend-consent-record-storage (2026-05-20)

- Auth block duplicated verbatim in `create_consent` vs `get_order` — 12-line identical block; extract to helper when auth logic needs to change again [`app/api/v1/orders.py:128-139`].
- `X-Forwarded-For` spoofable without trusted-proxy configuration — clients can inject arbitrary IPs into the DPDP consent audit trail; fix requires knowing deployment proxy topology [`app/api/v1/orders.py:148`].
- Migration `downgrade()` is data-destructive if NULL `user_id` consent records exist — no data cleanup step before restoring NOT NULL constraint [`alembic/versions/d7e8f9a0b1c2:25-28`].
- `consent_text` has no max-length validation — unbounded Text column; add `max_length` to `ConsentCreate` in a future schema hardening pass [`app/schemas/consent.py:11`].

## Deferred from: code review of 3-1-backend-order-creation-api (2026-05-20)

- Auth user gets 403 on guest orders — confirms order existence to requester; return 404 instead for security-through-obscurity if needed [`app/api/v1/orders.py:70`].
- Dual 404 handlers (type + status-code): `@app.exception_handler(HTTPException)` and `@app.exception_handler(404)` coexist; status-code handler wins for all 404s meaning `http_exception_handler` title logic is bypassed for 404 specifically [`app/core/exceptions.py:28`].
- Two-query pagination (COUNT then SELECT) — `total` can be stale under concurrent inserts; use window function or `FOUND_ROWS()` equivalent if strong consistency needed [`app/api/v1/orders.py:90`].
- No test coverage for `GET /orders/{order_id}` (AC5) or `GET /orders` (AC6) — add in a future test hardening pass [`app/api/v1/orders_test.py`].
- Staff cannot retrieve individual orders via `GET /orders/{order_id}` — currently must use paginated list; add staff bypass in future story if individual-order lookup is needed [`app/api/v1/orders.py:69`].
- species-not-found 422 `title` field duplicates `detail` — HTTPException handler uses `exc.detail` as both title and detail for string details; fix in a future RFC 7807 consistency pass [`app/api/v1/orders.py:35`].

## Deferred from: code review of 2-5-home-hero-india-native-credibility-pass (2026-05-20)

- Hero badge emoji `🇮🇳` (and all emoji spans throughout the codebase) lack `aria-label` / `aria-hidden` — pre-existing a11y pattern; screen readers will announce emoji descriptions verbosely; fix in a future accessibility hardening pass [`src/CustomerPortal.jsx:85`].

## Deferred from: code review of 2-4-single-order-path-remove-duplicate-form-from-speciessection (2026-05-20)

- `X` icon still present in lucide-react import on `CustomerPortal.jsx:3` — was used only by the removed inline form's close button; remove in a future cleanup pass.
- Step 4 "Place Order" button in `OrderFlow.jsx:195` has no `onClick` handler for any species — pre-existing; the wizard payment step is not yet wired; address in Epic 3 (backend order creation API Story 3-1).
- `isCustom: true` property in navigation state (`CustomerPortal.jsx:226`, `OrderFlow.jsx:57`) does not match `custom: true` used by admin-added species — pre-existing; neither flag is read by any wizard step; reconcile when custom species badge logic is needed.
- `location.state` is preserved in browser history entries on `/order-kit` — navigating back via browser can re-inject a stale pre-selected species — pre-existing for all species navigation; clear `window.history.replaceState` or use React Router `replace` option when real order submission is wired in Epic 3.

## Deferred from: code review of 2-3-india-address-forms-orderkit-and-speciessection (2026-05-20)

- No inline validation error when phone/pincode format fails — button silently stays disabled with no user feedback; add field-level error messages or placeholder format hints in a UX hardening pass [`src/OrderFlow.jsx:243`, `src/CustomerPortal.jsx:322`].
- Leading-zero pincodes (`000000`–`099999`) pass `/^\d{6}$/` validation; harden to `/^[1-9]\d{5}$/` since valid Indian pincodes always start with 1–9 [`OrderFlow.jsx:9`, `CustomerPortal.jsx:10`].
- `maxLength={6}` on pincode inputs does not prevent paste of longer strings on some mobile browsers; combine with `onChange` trimming or `pattern` attribute in a future form hardening pass [`src/OrderFlow.jsx:233`, `src/CustomerPortal.jsx:313`].
- CustomerPortal SpeciesSection form: City and State fill a 2-col row, Pincode wraps alone to a new row — cosmetic inconsistency vs. OrderFlow's 3-col grid; fix layout to `sm:grid-cols-3` for the City/State/Pincode row in a future UX pass [`src/CustomerPortal.jsx:300-314`].
- Step 4 order summary inlines Address Line 2 with a comma but no label or line break, making it indistinguishable from city in the comma-separated string; add a separate display row or label for address2 [`src/OrderFlow.jsx:264`].

## Deferred from: code review of 2-2-india-localization-footer-and-contact (2026-05-20)

- Company column items (About Us, Our Science, For Breeders, Careers) have `cursor-pointer` styling but no onClick handlers — pre-existing; wire up when the relevant pages are built in later epics.
- "For Veterinarians" appears in both the Company nav column and the footer legal bar — intentional per spec; revisit if UX feedback indicates it's confusing.
- `<li onClick>` pattern in the Company column lacks `role="button"` and keyboard focus — pre-existing a11y issue across all Company column items; fix in a future accessibility hardening pass.
- Navigate-to-current-route is a no-op in React Router — clicking "For Veterinarians" while already on `/vet-program` does nothing visible; add active-link detection to suppress redundant navigation if needed.

## Deferred from: code review of 2-1-customer-species-grid-filter-research-organisms (2026-05-20)

- "Rat" SPECIES_DATA entry (`src/CustomerPortal.jsx:12`) contains Mus musculus (mouse) variants — name/data mismatch is pre-existing; fix in a future data quality pass.
- Primate/fish boundary classification — primates and zebrafish are research organisms but marked `category: "customer"` per spec; revisit categorization if customer confusion is reported.
- Mole-Rat and Rat share 🐀 icon (`src/CustomerPortal.jsx:28`) — pre-existing cosmetic issue; assign distinct icons in a future species data polish pass.
- Admin UI has no way to set or change `category` field for a species — add a category toggle to the admin species management UI in a future admin portal story.

## Deferred from: code review of 1-6-github-actions-ci-pipeline (2026-05-20)

- GitHub Actions action tags not pinned to commit SHA (`astral-sh/setup-uv@v5`, `actions/checkout@v4`, `actions/setup-node@v4`) — supply-chain risk; pin to full SHA when setting up a security hardening pass or using a tool like StepSecurity.
- Test credentials committed in plaintext (POSTGRES_PASSWORD, JWT_SECRET_KEY, LAB_WEBHOOK_SECRET) — test-only values, but migrate to GitHub Actions secrets as the project matures.
- No `alembic upgrade head` step before pytest — current tests are synchronous and don't touch the live DB; add migration step when integration tests are introduced in Epic 3/4.
- `.env` file (present in `genepaw-api/`) could silently override CI env vars via pydantic-settings `env_file=".env"` — ensure `.env` is in `.gitignore` and never committed.
- `asyncio_mode` not configured in `pyproject.toml` — pytest-asyncio 0.24+ emits deprecation warnings without explicit `asyncio_mode`; add `[tool.pytest.ini_options] asyncio_mode = "auto"` when async tests are added.

## Deferred from: code review of 1-5-staff-login-flow (2026-05-20)

- JWT stored in `localStorage` — XSS accessible (`StaffLogin.jsx:31`); architectural decision mandated by spec; requires backend HttpOnly cookie migration in a future security hardening story.
- Client-side JWT decoded without signature verification — by design; spec states server validates on every API call; acceptable SPA pattern.
- `apiFetch` sends stale/expired token on all requests — pre-existing behavior in `api.js`; add token expiry check in `apiFetch` in a future auth story.
- `atob()` not base64url-safe (missing `-`/`_` substitution) — pre-existing pattern from Story 1.4 AuthGuard; low real-world risk with current backend JWT library.
- `avatar` inconsistency after page refresh — email initial at login vs hardcoded `"S"` after rehydration; requires backend JWT to include email or a new design decision.
- No `maxLength` on email/password inputs in `StaffLogin.jsx` — minor enhancement; add in a future form hardening pass.

## Deferred from: code review of 1-4-react-router-v7-and-frontend-infrastructure (2026-05-19)

- VetPortal active nav link styling — Navbar `currentPage` prop passed as `"vet"` but the component doesn't highlight links by route; low UX impact since vet pages are stub content until Epic 5.
- Vestigial `currentPage` prop passed to Navbar by all portal components — prop is ignored inside Navbar (which uses `useLocation()` internally); harmless but creates dead API surface; clean up when Navbar is next touched.

## Deferred from: code review of 1-3-jwt-authentication-and-rbac (2026-05-19)

- No refresh token revocation or logout — stateless JWT accepted for MVP; add Redis/DB-backed blacklist in a security hardening story.
- Timing side-channel on login — `user is None` skips `verify_password`, leaking email existence via response time; fix with constant-time dummy compare.
- Role not re-queried from DB on refresh — role changes only take effect after refresh token expires; accepted stateless tradeoff.
- No rate limiting on `/login` or `/register` — add via API gateway or middleware in a future security story.
- No `WWW-Authenticate` header on 401 — RFC 7235 compliance; future API standards story.
- RFC 7807 not asserted in auth error tests — covered globally by Story 1.1 handler tests.
- `JWT_ALGORITHM` "none" risk and `JWT_SECRET_KEY` startup validation — both already deferred from Story 1.1 review.

## Deferred from: code review of 1-2-database-schema-and-baseline-species-seed (2026-05-19)

- Species UUIDs non-deterministic across environments — `uuid4()` at migration time means IDs differ per DB; all code should use name-keyed lookups, not hardcoded IDs.
- `ConsentRecord.user_id NOT NULL` conflicts with guest order consent capture — Story 3.2 must decide how consent is stored for guest (no-user) orders.
- `op.get_bind()` deprecated in Alembic 2.x — works today; defer to an Alembic upgrade story.
- No indexes on `orders.user_id`, `orders.status`, `orders.species_id` — acceptable at MVP scale; add in a future performance story.
- `category_id` from JS file discarded — category name is sufficient for current schema; if slug-based APIs are needed later, add a `category_slug` column.
- `GROUP_TO_SPECIES` incomplete — 6 group strings produce NULL `species_id`; expand mapping or accept NULL for non-mapped groups.
- `parse_markers()` returns 0 silently on JS format change — add a minimum-count assertion in the migration if the JS file is ever updated.
- App code imported inside migration `upgrade()` — accepted tradeoff; creates Python env dependency at migration time; document in ops runbook.
