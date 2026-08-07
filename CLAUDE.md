# CLAUDE.md — Finberry Stock Simulator

Guidance for AI agents (and humans) working in this repo. Read this before making changes.

## What this is

Finberry is a beginner-friendly **stock-trading simulator / finance-education** web app: users get paper money, trade real-symbol stocks against live prices, and compete on leaderboards. It is undergoing a visual redesign ("Berry Bright", see `docs/redesign/`) plus a code-quality and security remediation.

**Monorepo layout** (single git repo):
- **Client** — Vite + React 18 + TypeScript at the repo root (`index.html`, `src/`, `public/`). MUI v5 (being replaced) + Tailwind + shadcn/ui + react-router v6 + Firebase Auth + axios. MUI and Tailwind coexist during the migration; new UI is Tailwind/shadcn (see redesign docs).
- **Server** — Express + Mongoose (MongoDB) in `server/`. Plain CommonJS JavaScript. Stock data from Twelve Data. Deployed to Vercel (`finberry-stock-simulator-server.vercel.app`).

The redesign direction, tokens, and screen specs are captured in `docs/redesign/`.

## Running locally

```bash
npm install          # root: installs client deps
cd server && npm install && cd ..

npm start            # runs client (Vite, :3000) + server (nodemon, :5000) via concurrently
npm run dev          # client only (Vite dev server, :3000)
npm run build        # production client build (Vite → build/)
npm run preview      # serve the production build locally
npm run lint         # ESLint
npm run format       # Prettier --write over src/

cd server
npm run dev-server-development   # server only, nodemon
npm run dev-server               # server only, plain node
npm run populate                 # ⚠️ seeds the DB — DROPS the entire database first (see Pitfalls)
```

**Environment**: copy `.env.example` to `.env` (gitignored) and fill in values from the maintainer. Required vars:
- Client (Vite inlines `REACT_APP_*` into the bundle via the `process.env` shim in `vite.config.ts`): six `REACT_APP_FINBERRY_*` Firebase keys (`src/config.tsx`), `REACT_APP_FINBERRY_DEVELOPMENT` (`true` → talk to `localhost:5000`, else the Vercel prod URL).
- Server: `REACT_APP_DB` (Mongo connection string; falls back to `mongodb://localhost/finberry`), `REACT_APP_FINBERRY_TWELVEDATA_API_KEY`, `REACT_APP_DEVELOPMENT` (gates dev-only/admin commands), `PORT`.
- Note the two **separate** dev flags: `REACT_APP_FINBERRY_DEVELOPMENT` (base-URL select) vs `REACT_APP_DEVELOPMENT` (dev-command gate). Setting one is not setting the other.

## Architecture map

**Client** (`src/`):
- `containers/<Name>Page/index.tsx` — 18 route pages. Routes are declared in `App.jsx:81-106`.
- `components/<Name>/index.tsx` — 11 shared components (`Balance`, `Chart`, `Dropdown`, `Footer`, `Header`, `Holdings`, `LinkDropdown`, `Orders`, `Pricing`, `Spinner`, `Title`).
- `context/` (firebase, user), `hooks/use-auth.tsx`, `lib/firebase.tsx`, `config.tsx`, `constants/areas.tsx`, `images/`.
- Routes: `/`, `/Login`, `/Register`, `/PasswordReset`, `/Articles`, `/Article/:id`, `/Profile/:email`, `/SimulatorPortfolio`, `/GamePortfolio`, `/Leaderboards`, `/CoachPortal/:email`, `/CoachCatalogue`, `/CoachRegistration`, `/BuyPremium`, `/FAQ`, `/Contact`, `/About`, `*`.

**Server** (`server/`):
- `index.js` — entry; requires all 16 models, connects Mongo, mounts 5 routers, `app.listen`.
- `src/routes/` — `Account.js` (2127 lines), `Game.js` (1710), `Admin.js`, `Stock.js`, `Educational.js`. Mounted at `/account`, `/game`, `/admin`, `/stock`, `/educational`. **All business logic is inline in route handlers** (no controllers/services yet).
- `src/models/` — 16 Mongoose schemas (User, Badge, UserBadge, Article, Simulator, SimulatorEnrollment, Holding, TradeTransaction, MarketMovers, CoachingProfile/Coach/Client/Session, ChatMessage, Review, PaymentHistory).
- `src/scheduleTasks.js` — node-schedule crons (hourly leaderboard/achievements; daily 22:00 market movers). **These do not fire on Vercel serverless** — see Pitfalls.
- Buy/sell trade endpoint: `POST /game/simulator/:simulatorID/:email`.

For a full assessment of current state, read the audits in `docs/audit/` before large changes.

## Conventions (target state)

The codebase is inconsistent today; **new and modified code should follow these**, and prefer bringing touched code up to standard.

**TypeScript / React (client):**
- Real prop types — **no `any`**. Define interfaces for props and API responses.
- Function components: `const X = () => { ... }; export default X`. Import hooks by name (`useState`, not `React.useState`) — don't mix both in one file.
- **No module-level mutable state.** All render state lives in `useState`/`useReducer`/refs. (Past bugs came from module-scope `var`s shared across component instances.)
- Handlers named semantically: `handleSubmit`, `handleBuy` — not `handleClose2`/`handleClose3`. (Also: the correct spelling is `handleSubmit`, not the legacy `handleSumbit`.)
- All HTTP goes through a **central API client** (`src/api/client.ts`, `axios.create` with an env-driven `baseURL`) — do **not** re-declare the base-URL ternary per file. Attach the Firebase ID token via an interceptor.
- Guard authenticated routes with `<ProtectedRoute>`; null-check `user` before dereferencing `user.email`.
- `===`/`!==` only; no `var`. Formatting is Prettier (`.prettierrc.json`: single quotes, semicolons, 100 cols) — run `npm run format` on touched files.

**Styling / redesign:** (progress + full guidance in `docs/redesign/implementation-roadmap.md`)
- The **Berry Bright** design tokens are the source of truth — documented in `docs/redesign/design-system.md`.
- New UI is **Tailwind + shadcn/ui**. **Do not add new MUI usage** — MUI is removed page-by-page.
- Reusable pieces exist: **brand primitives** in `src/components/brand/` (`Logo`, `Avatar`, `Pill`, `Caret`, `StatCard`, `TopNav`, `BrandFooter`, `Field`, `AreaChart`, `Sparkline`, `Skeleton`/`SkeletonText`/`LoadedAnnouncement`; barrel `index.ts`) and **shadcn UI** in `src/components/ui/` (`Button`, `Card`). Import via the `@/` alias. Add shadcn components with `npx shadcn@latest add <name>`.
- **Charts**: use the brand `AreaChart`/`Sparkline` (SVG, take a real `number[]` series). dither-kit is still blocked (CLI 404s on shadcn's registry) — same data interface when it's swapped in.
- **Loading states**: a region that awaits a network call ships with a **layout-matching** skeleton in the same commit — reuse the real component's own grid/height constants so nothing moves when data lands. **Never render a value that is about to be known as `0`, `—` or an empty state**: give each secondary/backfill fetch its own loading flag rather than letting it silently populate (`watching: false` and `followers: 0` are not neutral defaults, they are wrong answers). Use `SkeletonText` — not a bare `Skeleton` — anywhere the bar stands in for a line of text; a bare bar is short by the difference between the bar height and the text's line box, which compounds down a list. Add `aria-busy` while loading and a `LoadedAnnouncement` on resolution. Don't skeleton data you already have locally.
- Brand tokens are Tailwind utilities (`bg-violet`, `text-ink`, `shadow-card`, `font-display`, `rounded-card`); shadcn semantic colors are CSS-variable-driven (`src/index.css`). Tailwind **Preflight is off** while MUI coexists — don't rely on its global reset.
- **When redesigning a page**: rebuild it with brand components, wire real data through `src/api/client.ts`, and add its route to `REDESIGNED_ROUTES` in `src/App.jsx` so the legacy MUI `Header`/`Footer` are suppressed (the page renders its own `TopNav`/`BrandFooter`). Verify in-browser vs `design_handoff_finberry_redesign/screenshots/` before committing.
- Fonts: **Bricolage Grotesque** (display), **Hanken Grotesk** (body), **JetBrains Mono** (numbers). Not Fredoka.

**Server (Node/Express):**
- **Verify identity server-side** — mutating endpoints must check a Firebase ID token (Admin SDK) and derive the user from it, never trust an `:email` in the URL.
- **Never trust client-supplied prices** — look up the price server-side for trades.
- Validate/whitelist inputs (guard against NoSQL operator injection via query params). Use `== null` checks so legitimate `0` values aren't rejected.
- Correct HTTP status codes (404/500/401/403), not 400 for everything; don't leak `e.message` to clients.
- `async/await` only (no `.then()` pyramids, no `new Promise(async …)`). Add `try/catch` + error middleware.
- **No self-HTTP-calls** — call functions directly; extract shared services instead of routes POSTing to their own base URL.

## Pitfalls (things that will bite you)

- `npm run populate` calls `dropDatabase()` **unconditionally** on whatever `REACT_APP_DB` points to. Never run it against a non-local DB.
- The leaderboard route path is misspelled **`learderboard`** (both server and the frontend copy). If you fix it, keep a deprecated alias so the client keeps working.
- The server currently has **no authentication at all** — do not assume any endpoint is protected. Adding auth is a priority (see `docs/audit/backend-audit.md`).
- Trade prices are client-supplied and unvalidated — leaderboards are forgeable until this is fixed.
- Cron jobs (`scheduleTasks.js`) rely on a long-lived process and **won't run on Vercel serverless**; NodeCache is per-instance so the Twelve Data rate limit gets hit harder than the TTLs imply.
- `GamePortfolioPage` is a live route serving a placeholder ("sus"); `ContactPage`'s submit is commented out; `BuyPremiumPage` links a Stripe **test** URL. Don't treat these as working features.
- Route paths are declared capitalized (`/Login`) but linked lowercase (`/login`) — works only because react-router v6 is case-insensitive.
- No `.env` in the working tree → Firebase auth is **disabled** (handled gracefully, logs a warning) and `src/api/client.ts` falls back to the **production** API. To run against a local server, set `REACT_APP_FINBERRY_DEVELOPMENT=true` in `.env` (see `.env.example`).
- The live `game/marketmovers` feed can repeat a symbol — key list rows by index, not by symbol.
- `TopNav`'s `balance` prop has **no default** and hides the cash chip when omitted. Don't reintroduce a `'$0.00'` fallback — it made Markets and Learn show a permanently wrong balance.

## Where to look

- `docs/audit/frontend-audit.md` — full frontend findings (bugs, duplication, dead code) with file:line refs.
- `docs/audit/backend-audit.md` — full backend findings (security, bugs, serverless issues).
- `docs/redesign/design-system.md` — Berry Bright tokens, primitives, Tailwind mapping, dither-kit notes.
- `docs/redesign/implementation-roadmap.md` — phased plan for executing the redesign + remediation.
