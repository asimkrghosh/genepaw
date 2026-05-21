# Story 1.5: Staff Login Flow

Status: done

## Story

As a staff member,
I want a discreet login path that gives me access to the admin portal,
so that customers never see or accidentally navigate to admin functionality.

## Acceptance Criteria

1. The "Admin" button is removed from the main `Navbar` component.
2. The `Footer` component contains a low-contrast "Staff Login" text link in the same row as the Privacy Policy and Terms of Service links. Contrast is intentionally low so it blends into the footer without drawing customer attention.
3. Clicking "Staff Login" navigates to `/staff-login` — a minimal login form (email + password fields, submit button). No GenePaw branding hero or marketing content — just the form.
4. Successful login with a `staff`-role JWT stores the token in `localStorage` under key `genepaw_token` and redirects to `/admin`.
5. Failed login (wrong credentials or non-staff role) displays an inline error message: "Invalid credentials or insufficient permissions."
6. The `/admin` route is protected: a non-authenticated user or a non-staff-role token is redirected to `/staff-login`. *(Already satisfied by `AuthGuard` in Story 1.4 — verify only, no changes needed.)*
7. The existing admin mock login (`ADMIN_USER` constant and `LoginModal` component) is fully removed — replaced by the real JWT flow from Story 1.3.
8. A "Log out" action in the admin portal clears `genepaw_token` from `localStorage` and redirects to `/`.

## Tasks / Subtasks

- [x] Task 1: Create `src/StaffLogin.jsx` (AC: 3, 4, 5)
  - [x] Email + password form with submit button — no hero/marketing content
  - [x] On submit: POST `{ email, password }` to `/api/v1/auth/login` via `apiFetch`
  - [x] Decode `access_token`: if `payload.role !== 'staff'`, show error
  - [x] On success: `localStorage.setItem('genepaw_token', access_token)`, call `login(user)`, navigate to `/admin`
  - [x] On any failure (non-2xx or wrong role): show "Invalid credentials or insufficient permissions."
  - [x] Disable submit button + show loading state while fetching
  - [x] Include `Navbar` and `Footer` for consistent chrome (no login/admin button shown)
- [x] Task 2: Update `src/App.jsx` (AC: 3)
  - [x] Replace the inline `StaffLoginPlaceholder` component with `React.lazy(() => import('./StaffLogin.jsx'))`
  - [x] Remove `useApp` import (no longer used in App.jsx after placeholder removed)
  - [x] Remove `LoginModal` from shared.jsx import
  - [x] Verify all routes and `AuthGuard` are intact — no logic changes
  - [x] File must remain ≤ 70 lines
- [x] Task 3: Update `src/shared.jsx` (AC: 1, 2, 7, 8)
  - [x] Remove `LoginModal` component entirely
  - [x] Remove `ADMIN_USER` constant
  - [x] Remove unused lucide imports: `ShieldCheck`, `LogIn`, `Eye`, `EyeOff`, `AlertTriangle`
  - [x] Navbar: Remove the "Admin" / "Admin Login" button from both desktop and mobile nav (AC1)
  - [x] Navbar: Remove `onLoginClick` prop from function signature
  - [x] Navbar: Update `isAdmin` check: `user?.role === "staff"` (was `"admin"`)
  - [x] Navbar: Logout handlers — add `navigate('/')` call after `onLogout()` (AC8)
  - [x] Footer: Add low-contrast "Staff Login" link in the copyright row (AC2)
- [x] Task 4: Update `src/AppContext.jsx` (AC: 7, 8)
  - [x] Add `useEffect` import
  - [x] Remove `showLogin` and `setShowLogin` state
  - [x] Remove `showLogin` and `setShowLogin` from context value
  - [x] Add `useEffect` on mount: decode localStorage JWT and call `setUser()` to rehydrate state on page refresh
  - [x] Update `logout()` to call `localStorage.removeItem('genepaw_token')` before `setUser(null)`
- [x] Task 5: Remove `LoginModal` from all portal files (AC: 7)
  - [x] `src/CustomerPortal.jsx`: Remove `LoginModal` from import; remove `showLogin, setShowLogin, login` from `useApp()`; remove `<LoginModal>` render; remove `onLoginClick` prop from `<Navbar>`
  - [x] `src/VetPortal.jsx`: Same cleanup in `PageWrapper`
  - [x] `src/AdminPortal.jsx`: Same cleanup in `AdminPortalPage`
  - [x] `src/OrderFlow.jsx`: Same cleanup (was missed in Task 5 scope, fixed during build verification)
  - [x] `src/Results.jsx`: Same cleanup (was missed in Task 5 scope, fixed during build verification)
- [x] Task 6: Verify build and no regressions (AC: all)
  - [x] `npm run dev` starts without errors
  - [x] `npm run build` exits 0 — StaffLogin chunk: 4.23 kB

## Dev Notes

### Backend Endpoint — POST `/api/v1/auth/login`

Implemented in Story 1.3. Route file: `genepaw-api/app/api/v1/auth.py`.

**Request body** (`application/json`):
```json
{ "email": "staff@genepaw.com", "password": "secret" }
```

**Response 200**:
```json
{ "access_token": "<JWT>", "refresh_token": "<JWT>", "token_type": "bearer" }
```

**Response 401** (RFC 7807):
```json
{ "detail": "Invalid credentials" }
```

`apiFetch` throws on non-2xx. The error object has `err.status` and `err.body.detail`. Map all errors to the generic message — do not expose whether the email or password was wrong.

**Important**: The backend `/login` endpoint does NOT check role — any valid user can get a token. The frontend must check `payload.role === 'staff'` before granting access. Non-staff users will get a valid token but be rejected client-side with the same generic error.

### JWT Payload Structure

```json
{
  "sub": "<uuid string>",
  "role": "staff",
  "type": "access",
  "exp": 1748700000
}
```

Decode client-side (no crypto verify — the server validates on API calls):
```js
const payload = JSON.parse(atob(access_token.split('.')[1]));
```

### `src/api.js` — Ready to Use

`apiFetch` already handles login correctly:
- No `genepaw_token` in localStorage on login page → no `Authorization` header → correct
- `Content-Type: application/json` is set automatically
- Non-2xx throws `Error` with `.status` and `.body`

```js
import { apiFetch } from './api.js';
const data = await apiFetch('/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
// data.access_token is the raw JWT string
```

### Task 1: `src/StaffLogin.jsx` — Full Implementation

```jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { COLORS, Navbar, Footer } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { apiFetch } from "./api.js";

export default function StaffLogin() {
  const { user, logout, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await apiFetch("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const payload = JSON.parse(atob(access_token.split(".")[1]));
      if (payload.role !== "staff") {
        setError("Invalid credentials or insufficient permissions.");
        return;
      }
      localStorage.setItem("genepaw_token", access_token);
      login({ id: payload.sub, email, role: payload.role, avatar: email[0].toUpperCase() });
      navigate("/admin");
    } catch {
      setError("Invalid credentials or insufficient permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar user={user} onLogout={() => { logout(); navigate("/"); }} />
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 pb-4 text-center" style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Staff Portal</h1>
              <p className="text-green-200 text-sm mt-1">Authorized personnel only</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold rounded-xl px-6 py-3 text-white cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
```

### Task 2: `src/App.jsx` Changes

Replace `StaffLoginPlaceholder` (15-line inline component + imports) with a lazy import. Current App.jsx imports `useApp`, `LoginModal`, `COLORS`, `Navbar`, `Footer` — after this task only `COLORS` remains needed for the `Loading` component.

New lazy import line (add alongside other lazy imports):
```js
const StaffLogin = React.lazy(() => import("./StaffLogin.jsx"));
```

Updated route:
```jsx
<Route path="/staff-login" element={<StaffLogin />} />
```

Remove these imports from App.jsx:
- `import { useApp } from "./AppContext.jsx";`
- `LoginModal` from `"./shared.jsx"` import

Updated App.jsx imports (after):
```js
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { COLORS } from "./shared.jsx";
```

Note: `useNavigate` was imported but only used in `StaffLoginPlaceholder` — remove it too.

### Task 3: `src/shared.jsx` Changes

**Lucide imports** (current → new):
```js
// CURRENT:
import { Dna, Menu, X, ShieldCheck, LogIn, LogOut, Eye, EyeOff, AlertTriangle, Mail, Phone, MapPin, Globe } from "lucide-react";

// NEW:
import { Dna, Menu, X, LogOut, Mail, Phone, MapPin, Globe } from "lucide-react";
```

**Remove entirely** (two named exports):
- `export const ADMIN_USER = { ... }` — the full constant declaration
- `export function LoginModal({ ... }) { ... }` — the full component function

**Navbar function signature** (current → new):
```js
// CURRENT:
export function Navbar({ currentPage, user, onLoginClick, onLogout }) {
// NEW:
export function Navbar({ currentPage, user, onLogout }) {
```

**`isAdmin` check** (line ~150):
```js
// CURRENT:
const isAdmin = user?.role === "admin";
// NEW:
const isAdmin = user?.role === "staff";
```

**Desktop nav logout/login block** (remove Admin button, keep Order Kit):
```jsx
// CURRENT (remove the full ternary):
{user ? (
  <>
    <div ...>{user.avatar}</div><Badge ...>Admin</Badge>
  </>
  <Button variant="ghost" size="sm" onClick={onLogout}>...</Button>
) : (
  <>
    <Button variant="ghost" size="sm" onClick={onLoginClick}><ShieldCheck /> Admin</Button>
    <Button size="sm" onClick={() => navigate("/order-kit")}>Order Kit</Button>
  </>
)}

// NEW:
{user ? (
  <>
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary})` }}>
        {user.avatar}
      </div>
      <Badge color={COLORS.primary}>Staff</Badge>
    </div>
    <Button variant="ghost" size="sm" onClick={() => { onLogout(); navigate("/"); }}><LogOut size={16} /> Logout</Button>
  </>
) : (
  <Button size="sm" onClick={() => navigate("/order-kit")}>Order Kit</Button>
)}
```

**Mobile nav logout block** (remove Admin Login button, update logout handler):
```jsx
// CURRENT:
{user ? (
  <Button variant="ghost" className="w-full" onClick={() => { onLogout(); setOpen(false); }}>...</Button>
) : (
  <>
    <Button variant="secondary" className="w-full" onClick={() => { onLoginClick(); setOpen(false); }}>..Admin Login..</Button>
    <Button className="w-full" onClick={() => { navigate("/order-kit"); setOpen(false); }}>Order Kit</Button>
  </>
)}

// NEW:
{user ? (
  <Button variant="ghost" className="w-full" onClick={() => { onLogout(); navigate("/"); setOpen(false); }}><LogOut size={16} /> Logout</Button>
) : (
  <Button className="w-full" onClick={() => { navigate("/order-kit"); setOpen(false); }}>Order Kit</Button>
)}
```

**Footer copyright row** — add Staff Login link:
```jsx
// CURRENT (last div in the border-t section):
<div className="flex gap-6 text-sm text-gray-500">
  <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
  <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
  <span className="hover:text-gray-300 cursor-pointer">Cookie Policy</span>
</div>

// NEW:
<div className="flex gap-6 text-sm text-gray-500">
  <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
  <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
  <span className="hover:text-gray-300 cursor-pointer">Cookie Policy</span>
  <span className="text-gray-600 hover:text-gray-400 cursor-pointer" onClick={() => navigate("/staff-login")}>Staff Login</span>
</div>
```

*`text-gray-600` on `bg-gray-900` background = intentionally low contrast, per UX spec.*

### Task 4: `src/AppContext.jsx` Changes

```js
// ADD useEffect to imports:
import { createContext, useContext, useState, useEffect } from "react";

// REMOVE this state:
const [showLogin, setShowLogin] = useState(false);

// ADD rehydration effect (after existing state declarations):
useEffect(() => {
  const token = localStorage.getItem("genepaw_token");
  if (!token) return;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role === "staff" && payload.exp * 1000 > Date.now()) {
      setUser({ id: payload.sub, role: payload.role, avatar: "S" });
    }
  } catch {}
}, []);

// UPDATE logout:
const logout = () => {
  localStorage.removeItem("genepaw_token");
  setUser(null);
};

// UPDATE context value — REMOVE showLogin, setShowLogin:
<AppContext.Provider value={{ user, pricing, kits, showLogin: undefined, login, logout, updatePrice, uploadReport, updateKit }}>
// Actually: just remove showLogin and setShowLogin from the value object entirely:
<AppContext.Provider value={{ user, pricing, kits, login, logout, updatePrice, uploadReport, updateKit }}>
```

### Task 5: Portal File Changes (Minimal)

Each file: remove `LoginModal` from import, remove `showLogin`/`setShowLogin`/`login` from `useApp()` destructure, remove `<LoginModal ...>` JSX, remove `onLoginClick` from `<Navbar>`.

**`src/CustomerPortal.jsx`** — Change line 5 and default export:
```jsx
// Line 5 CURRENT:
import { COLORS, formatINR, Button, SectionTitle, Badge, Navbar, Footer, LoginModal } from "./shared.jsx";
// Line 5 NEW:
import { COLORS, formatINR, Button, SectionTitle, Badge, Navbar, Footer } from "./shared.jsx";

// Default export CURRENT:
const { orderId } = useParams();
const { user, showLogin, setShowLogin, login, logout } = useApp();
// Default export NEW:
const { orderId } = useParams();
const { user, logout } = useApp();
// Remove: <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={login} />
// Change Navbar: remove onLoginClick prop
// <Navbar currentPage="home" user={user} onLogout={logout} />
```

**`src/VetPortal.jsx`** — Change imports and PageWrapper:
```jsx
// CURRENT:
import { COLORS, Navbar, Footer, LoginModal } from "./shared.jsx";
// NEW:
import { COLORS, Navbar, Footer } from "./shared.jsx";

// PageWrapper CURRENT:
const { user, showLogin, setShowLogin, login, logout } = useApp();
<Navbar currentPage="vet" user={user} onLoginClick={() => setShowLogin(true)} onLogout={logout} />
<LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={login} />
// PageWrapper NEW:
const { user, logout } = useApp();
<Navbar currentPage="vet" user={user} onLogout={logout} />
// Remove LoginModal render
```

**`src/AdminPortal.jsx`** — Change import line 3 and AdminPortalPage:
```jsx
// Import CURRENT:
import { COLORS, SectionTitle, Badge, Navbar, Footer, LoginModal, DEFAULT_PRICING } from "./shared.jsx";
// Import NEW:
import { COLORS, SectionTitle, Badge, Navbar, Footer, DEFAULT_PRICING } from "./shared.jsx";

// AdminPortalPage CURRENT:
const { user, showLogin, setShowLogin, login, logout } = useApp();
<Navbar currentPage="admin" user={user} onLoginClick={() => setShowLogin(true)} onLogout={logout} />
<LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={login} />
// AdminPortalPage NEW:
const { user, logout } = useApp();
<Navbar currentPage="admin" user={user} onLogout={logout} />
// Remove LoginModal render
```

### AuthGuard — No Changes Needed (AC6)

```jsx
// src/App.jsx — already correct, no touch:
function AuthGuard({ children }) {
  const token = localStorage.getItem("genepaw_token");
  if (!token) return <Navigate to="/staff-login" replace />;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "staff") return <Navigate to="/staff-login" replace />;
    if (payload.exp && payload.exp * 1000 < Date.now()) return <Navigate to="/staff-login" replace />;
  } catch {
    return <Navigate to="/staff-login" replace />;
  }
  return children;
}
```

### What ADMIN_USER Was Used For (Safe to Delete)

`ADMIN_USER` was only used inside `LoginModal.handleLogin()` to validate mock credentials. No other file imports it. Verified: grep `ADMIN_USER` across `src/` returns only `shared.jsx` (the definition site).

### `DEFAULT_PRICING` Export — Keep

`DEFAULT_PRICING` is still exported from `shared.jsx` and used by `AdminPortal.jsx` and `AppContext.jsx`. Do not remove it.

### No Test Framework

Repo has no test runner. `npm run build` (Vite) is the validation gate. Build exits 0 = story complete.

### Previous Story Learnings

- Story 1.4 created `StaffLoginPlaceholder` in `App.jsx` as the stub this story replaces entirely
- `apiFetch` in `src/api.js` is ready to use — no changes needed
- `AuthGuard` in `App.jsx` already validates JWT role `=== "staff"` — no changes needed  
- Build exits 0 with the current codebase — any regression is caused by this story's changes

### Project Structure Notes

- `src/StaffLogin.jsx` follows the PascalCase domain module pattern
- It is loaded via `React.lazy()` in `App.jsx` like all other route-level domain modules
- Story 1.5 is the last pure-frontend story in Epic 1 before CI pipeline (1.6)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Admin Entry Point]
- [Source: genepaw-api/app/api/v1/auth.py — login endpoint]
- [Source: genepaw-api/app/schemas/auth.py — LoginRequest, TokenResponse]
- [Source: genepaw-api/app/services/auth.py — JWT payload: sub, role, type, exp]
- [Source: _bmad-output/implementation-artifacts/1-4-react-router-v7-and-frontend-infrastructure.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Build error: `LoginModal` not exported from `src/shared.jsx` — `src/OrderFlow.jsx` and `src/Results.jsx` were not listed in Task 5 scope but also imported `LoginModal`. Discovered via `npm run build` failure. Fixed by adding those two files to the cleanup sweep.

### Completion Notes List

- Created `src/StaffLogin.jsx` — JWT login form with email/password, show/hide password toggle, inline error display, loading state, role check before storing token. Includes full Navbar/Footer chrome.
- Updated `src/App.jsx` — replaced 15-line `StaffLoginPlaceholder` + `LoginModal`/`useApp`/`useNavigate` imports with a single `React.lazy(() => import('./StaffLogin.jsx'))` line. File is 44 lines (under 70 cap).
- Updated `src/shared.jsx` — removed `LoginModal` component, `ADMIN_USER` constant, 5 unused lucide imports (`ShieldCheck`, `LogIn`, `Eye`, `EyeOff`, `AlertTriangle`). Removed `onLoginClick` from `Navbar`. Updated `isAdmin` to check `role === "staff"`. Both logout handlers now call `navigate("/")`. Footer copyright row gains low-contrast Staff Login link.
- Updated `src/AppContext.jsx` — removed `showLogin`/`setShowLogin` state. Added `useEffect` on mount to rehydrate `user` from localStorage JWT on page refresh (checks role=staff and expiry). `logout()` now clears `genepaw_token` from localStorage.
- Cleaned `src/CustomerPortal.jsx`, `src/VetPortal.jsx`, `src/AdminPortal.jsx`, `src/OrderFlow.jsx`, `src/Results.jsx` — removed all `LoginModal` imports, `showLogin`/`setShowLogin`/`login` from `useApp()` destructures, `<LoginModal>` renders, and `onLoginClick` Navbar props.
- `npm run build` exits 0. New chunk: `StaffLogin-DgrG9JGK.js` (4.23 kB / gzip 1.89 kB).
- AC6 (`/admin` auth guard) verified unchanged — `AuthGuard` in `App.jsx` already redirects non-staff to `/staff-login`.

### File List

- `src/StaffLogin.jsx` — NEW (JWT staff login form)
- `src/App.jsx` — MODIFIED (lazy import StaffLogin, removed StaffLoginPlaceholder + unused imports)
- `src/shared.jsx` — MODIFIED (removed LoginModal, ADMIN_USER; updated Navbar, Footer)
- `src/AppContext.jsx` — MODIFIED (removed showLogin state, added rehydration effect, logout clears localStorage)
- `src/CustomerPortal.jsx` — MODIFIED (removed LoginModal usage)
- `src/VetPortal.jsx` — MODIFIED (removed LoginModal usage)
- `src/AdminPortal.jsx` — MODIFIED (removed LoginModal usage)
- `src/OrderFlow.jsx` — MODIFIED (removed LoginModal usage — discovered during build verification)
- `src/Results.jsx` — MODIFIED (removed LoginModal usage — discovered during build verification)

### Review Findings

- [x] [Review][Decision] StaffLogin renders full Navbar+Footer — resolved: Navbar+Footer kept as consistent chrome per Task 1; AC3 "just the form" meant no hero/marketing sections, not no chrome.
- [x] [Review][Patch] `isAdmin` checks `"admin"` not `"staff"` — staff user never gets admin controls in SpeciesSection or PricingSection [`CustomerPortal.jsx:148, 750`]
- [x] [Review][Patch] No redirect for already-authenticated staff visiting `/staff-login` — they see the login form again [`StaffLogin.jsx`]
- [x] [Review][Patch] Expired/corrupted token not cleared from localStorage in AppContext rehydration catch block [`AppContext.jsx:87–96`]
- [x] [Review][Patch] `payload.exp` not guarded in AppContext rehydration — valid non-expiring tokens silently fail rehydration (`undefined * 1000 = NaN`, `NaN > Date.now()` is false) [`AppContext.jsx:92`]
- [x] [Review][Patch] Double `navigate("/")` on logout — StaffLogin wraps navigate inside `onLogout` prop AND Navbar calls it again [`StaffLogin.jsx:43`]
- [x] [Review][Patch] Footer "Staff Login" link uses `<span>` — not keyboard-accessible or announced as a link by screen readers [`shared.jsx:240`]
- [x] [Review][Patch] `email[0].toUpperCase()` throws TypeError if email is empty string (native validation can be bypassed) [`StaffLogin.jsx:32`]
- [x] [Review][Patch] Password toggle button has no `aria-label` — unlabeled for screen readers [`StaffLogin.jsx:84–87`]
- [x] [Review][Defer] JWT stored in `localStorage` — XSS accessible [`StaffLogin.jsx:31`] — deferred, architectural decision mandated by spec; requires backend HttpOnly cookie migration
- [x] [Review][Defer] Client-side JWT decoded without signature verification — deferred, by design; spec states server validates on every API call
- [x] [Review][Defer] `apiFetch` sends stale/expired token on all requests — deferred, pre-existing behavior in `api.js`
- [x] [Review][Defer] `atob()` not base64url-safe (missing `-`/`_` substitution) — deferred, pre-existing pattern from Story 1.4 AuthGuard
- [x] [Review][Defer] `avatar` inconsistency — email initial at login vs hardcoded `"S"` after refresh — deferred, requires backend JWT to include email
- [x] [Review][Defer] No `maxLength` on email/password inputs — deferred, minor enhancement

### Change Log

- 2026-05-19: Story 1.5 implemented — staff login flow complete. Created StaffLogin.jsx, wired React.lazy route, removed LoginModal/ADMIN_USER mock auth system from all portal files, updated AppContext with localStorage rehydration. Build passes (exit 0).
