---
project_name: 'GenePaw'
user_name: 'Pc'
date: '2026-05-14'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 60
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **React** 18.3.1 — UI framework; JSX only (no TypeScript)
- **Vite** 5.3.1 — build tool; dev server runs on port 3000 with auto-open
- **Tailwind CSS** 3.4.4 — utility-first styling with custom `genepaw` color tokens
- **Recharts** 2.12.7 — charting (PieChart, BarChart, RadarChart, ResponsiveContainer)
- **jsPDF** 4.2.1 + **jspdf-autotable** 5.0.7 — PDF report generation
- **lucide-react** 0.383.0 — icon library (tree-shakeable named imports only)
- **PostCSS** 8.4.38 + **Autoprefixer** 10.4.19 — CSS processing pipeline

**Custom Tailwind Tokens (use these, not raw hex):**
- `genepaw-primary` = `#1B6B4A`
- `genepaw-primary-light` = `#2D9D6F`
- `genepaw-primary-dark` = `#0F4A32`
- `genepaw-accent` = `#F59E0B`

## Critical Implementation Rules

### Language-Specific Rules

- **No TypeScript** — project uses plain JSX; do not add `.ts`/`.tsx` files or type annotations
- **ES Modules** — use `import`/`export`; never `require()` or `module.exports`
- **Named imports only** for lucide-react and recharts (tree-shaking); never import the full library
- **Component declaration style** — use `function` keyword for components, not arrow functions (`const Foo = () =>`)
- **Hook imports** — import only the hooks you use from react (`useState`, `useEffect`, `useRef`); do not import React as default
- **Currency formatting** — always use `formatINR()` helper for all price display; currency is INR (`en-IN` locale, `INR` currency code)
- **No PropTypes** — project has no PropTypes or TypeScript; omit both
- **Constants** — use `const` + SCREAMING_SNAKE_CASE for static data arrays/objects (e.g. `SPECIES_DATA`, `COLORS`, `FAQS`)
- **No async/await yet** — all data is mock/static; when adding API calls, use async/await (not `.then()` chains)

### Framework-Specific Rules

**Routing / Navigation:**
- No React Router — page routing uses `currentPage` state (`useState`) passed via props
- Add new pages by: (1) adding an entry to `allLinks` in `Navbar`, (2) adding a `if (currentPage === "your-page")` render branch in the main `App` return
- Admin-only pages use `adminOnly: true` flag in `allLinks`; public-hidden admin pages use `hideForAdmin: true`

**Component Structure:**
- All components currently live in `src/App.jsx` (monolithic); new components go in the same file unless explicitly told to split
- Components receive `currentPage` + `setCurrentPage` as props for internal navigation
- Reusable primitives already exist: `Button`, `SectionTitle`, `Badge` — use them before creating new ones

**Styling — Hybrid Pattern:**
- Use Tailwind classes for layout, spacing, typography, and responsive design
- Use `style={{ background: ... }}` inline only for gradient backgrounds using `COLORS` constants
- Brand colors: always reference `COLORS.primary`, `COLORS.accent`, etc. — never hardcode hex values directly
- Gradient pattern: `style={{ background: \`linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})\` }}`

**State Management:**
- Local `useState` only — no Redux, Zustand, or Context API
- Admin auth state lives in top-level `App` component and is passed down as `user` prop
- No global state — keep state as close to where it's used as possible

**Charts (Recharts):**
- Always wrap charts in `<ResponsiveContainer width="100%" height={N}>`
- Use `BREED_COLORS` array for multi-series color cycling

**PDF Export (jsPDF):**
- Use `jsPDF` + `autoTable` together; existing export pattern is the reference
- PDF exports are triggered from results pages only

### Testing Rules

- **No test framework configured** — do not add tests unless explicitly requested
- When tests are added, use **Vitest** (already compatible with Vite setup — do not introduce Jest)
- Use **React Testing Library** alongside Vitest for component tests
- Test files go alongside source files: `src/ComponentName.test.jsx`
- Do not add a separate `__tests__` folder — keep tests co-located
- Mock data for tests must match the shape of the existing constants (`SPECIES_DATA`, `SAMPLE_RESULTS`, etc.)
- No coverage thresholds defined yet — do not add `--coverage` requirements without user instruction

### Code Quality & Style Rules

**Linting / Formatting:**
- No ESLint or Prettier configured — do not add linting config files unless asked
- Follow existing code style: 2-space indentation, double quotes for JSX attributes
- Semicolons: omit (the existing code uses them inconsistently — match the surrounding code)

**File & Folder Structure:**
- `src/App.jsx` — all components and logic (monolithic; do not split unless instructed)
- `src/index.css` — global base styles (Tailwind directives)
- `src/main.jsx` — entry point only; do not modify
- `public/` — static assets (favicon, static HTML)
- `dist/` — build output; never edit manually

**Naming Conventions:**
- Components: `PascalCase` function names (`function MyComponent`)
- Constants/data: `SCREAMING_SNAKE_CASE` (`SPECIES_DATA`, `COLORS`, `DEFAULT_PRICING`)
- State variables: `camelCase` with descriptive names (`currentPage`, `showPassword`)
- Event handlers: `handle` prefix (`handleLogin`, `handleSubmit`)
- CSS classes: Tailwind utilities only — no custom CSS class names in JSX

**Section Separators:**
- Use `// ─── Section Name ───` comment style to separate major sections in `App.jsx`
  (e.g. `// ─── Mock Data ───`, `// ─── Reusable Components ───`)

### Development Workflow Rules

**Build & Dev:**
- Dev server: `npm run dev` — starts Vite on port 3000 with auto-open
- Production build: `npm run build` — outputs to `dist/`
- Preview build: `npm run preview` — serves `dist/` locally
- Never run `npm run build` as part of feature work — dev server is sufficient for development

**No Git conventions defined** — project has `.gitignore` but no branch naming, commit message, or PR rules established yet

**Deployment:**
- No deployment pipeline configured — `dist/` is the build artifact for manual deployment
- Do not add CI/CD config (GitHub Actions, Vercel, etc.) without explicit instruction

### Critical Don't-Miss Rules

**Anti-Patterns to Avoid:**
- **Never hardcode hex colors** — always use `COLORS.xxx` constants; brand colors must stay consistent
- **Never add a router library** — page navigation is intentionally handled via `currentPage` state
- **Never split App.jsx** into separate files unless the user explicitly requests refactoring
- **Never use `default export`** for components — all components use named `function` declarations
- **Never modify `src/main.jsx`** — it is entry-point only
- **Never write to `dist/`** — it is build output only

**Security Gotchas:**
- Admin credentials (`admin@genepaw.com` / `admin123`) are **mock/demo only** — never treat them as real auth; when implementing real auth, replace the entire `LoginModal` + `ADMIN_USER` pattern with proper backend auth
- No real authentication exists — admin gating is purely client-side; do not add sensitive operations behind this mock gate

**Data Patterns:**
- `SPECIES_DATA`, `SAMPLE_RESULTS`, `TRACKING_STEPS`, `DEFAULT_PRICING`, `FAQS` are all **mock data** — when connecting to a real backend, these constants become the data shape contract for API responses
- `marker_categories_362.js` in root — large genomics data file; import explicitly if needed, do not inline its data into `App.jsx`
- `Cross_Species_Gene_Annotation_Database.xlsx` in root — reference database; not currently used by the app

**Performance:**
- `App.jsx` is already 375KB — avoid adding large inline data arrays; extract to separate data files instead
- Chart components are expensive — do not render multiple `ResponsiveContainer` charts on the same page without lazy loading or tab-gating
- lucide-react icons must be named imports only — a barrel import would bundle the entire icon library

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge during implementation

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review periodically for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-05-14
