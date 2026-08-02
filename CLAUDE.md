# CLAUDE.md — Finberry Stock Simulator

Guidance for AI agents (and humans) working in this repo. Read this before making changes.

## What this is

Finberry is a beginner-friendly **stock-trading simulator / finance-education** web app: users get paper money, trade real-symbol stocks against live prices, and compete on leaderboards. It is undergoing a visual redesign ("Berry Bright", see `docs/redesign/`) plus a code-quality and security remediation.

**Monorepo layout** (single git repo):
- **Client** — Create React App at the repo root (`src/`, `public/`). React 18 + TypeScript + MUI v5 + react-router v6 + Firebase Auth + axios. Migrating to Tailwind + shadcn/ui (see redesign docs).
- **Server** — Express + Mongoose (MongoDB) in `server/`. Plain CommonJS JavaScript. Stock data from Twelve Data. Deployed to Vercel (`finberry-stock-simulator-server.vercel.app`).

The redesign direction, tokens, and screen specs are captured in `docs/redesign/`.

## Running locally

```bash
npm install          # root: installs client deps
cd server && npm install && cd ..

npm start            # runs client (CRA, :3000) + server (nodemon, :5000) via concurrently
npm run startClient  # client only
npm run build        # production client build

cd server
npm run dev-server-development   # server only, nodemon
npm run dev-server               # server only, plain node
npm run populate                 # ⚠️ seeds the DB — DROPS the entire database first (see Pitfalls)
```

**Environment**: `.env` is gitignored and **there is no `.env.example` yet** — you must obtain values from the maintainer. Required vars:
- Client (CRA inlines `REACT_APP_*` into the bundle): six `REACT_APP_FINBERRY_*` Firebase keys (`src/config.tsx`), `REACT_APP_FINBERRY_DEVELOPMENT` (`true` → talk to `localhost:5000`, else the Vercel prod URL).
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
- `===`/`!==` only; no `var`; single-quote + Prettier formatting (once configured).

**Styling / redesign:**
- The **Berry Bright** design tokens are the source of truth — documented in `docs/redesign/design-system.md`.
- New UI is **Tailwind + shadcn/ui**; charts use **dither-kit** (real price data, not the mock's random walk). **Do not add new MUI usage** — MUI is being removed page-by-page.
- Fonts: **Bricolage Grotesque** (display), **Hanken Grotesk** (body), **JetBrains Mono** (numbers). Not Fredoka.
- Use the reference screenshots as the visual acceptance target (see `docs/redesign/design-system.md`).

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

## Where to look

- `docs/audit/frontend-audit.md` — full frontend findings (bugs, duplication, dead code) with file:line refs.
- `docs/audit/backend-audit.md` — full backend findings (security, bugs, serverless issues).
- `docs/redesign/design-system.md` — Berry Bright tokens, primitives, Tailwind mapping, dither-kit notes.
- `docs/redesign/implementation-roadmap.md` — phased plan for executing the redesign + remediation.
