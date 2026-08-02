# Redesign & Remediation Roadmap

_Phased plan for executing the Berry Bright redesign and the backend remediation. Written after the audit; nothing here has been implemented. Companion docs: `design-system.md`, `../audit/frontend-audit.md`, `../audit/backend-audit.md`._

## Confirmed decisions

1. **Styling**: full migration to **Tailwind + shadcn/ui + dither-kit** per the handoff. Pages leave MUI as they're redesigned (MUI and Tailwind coexist during the transition; no new MUI usage).
2. **Backend**: **full remediation** — critical security fixes *and* the structural refactor.

## Guiding principles

- Ship page-by-page. Each page redesign also fixes that page's audit findings, so the two efforts converge instead of competing.
- Berry Bright tokens (`design-system.md`) are authoritative; screenshots are the visual acceptance target.
- Nothing undesigned gets invented — flag compare view, modals, loading/error states, and article detail for a design pass before building.
- Backend security is independent of the visual work and can run in parallel.

---

## Phase 0 — Tooling foundation

Goal: a build that supports Tailwind + shadcn and enforces consistency.

- **CRA → Vite migration.** CRA/react-scripts doesn't play well with shadcn's path-alias + Tailwind workflow, and shadcn's tooling assumes Vite/Next. Migrate: `index.html` to root, `vite.config.ts` with `@` → `src` alias, env prefix `VITE_` (or keep `REACT_APP_` via `envPrefix`), swap `react-scripts` scripts. Alternative if a full migration is too risky up front: `craco` + `craco-alias` — but Vite is the cleaner long-term base.
- Install & init **Tailwind** and **shadcn/ui**; wire the token mapping from `design-system.md`.
- Add **ESLint (real config) + Prettier** and a format/lint script; run once across the repo (formatting is already churning in git history — the last commit is `fix-formatting`).
- Add **`.env.example`** documenting every var (client Firebase keys, `VITE_API_URL`/`REACT_APP_API_URL`, both server dev flags, `REACT_APP_DB`, `REACT_APP_FINBERRY_TWELVEDATA_API_KEY`, `PORT`).
- Remove junk deps: `switch`, `react-responsive`, `web-vitals`.
- Optional but cheap: minimal CI (typecheck + lint + build) and a pre-commit format hook.

Verification: `npm run build` succeeds; app boots unchanged visually; lint/format run clean.

## Phase 1 — Design-system foundations

Goal: the shared chrome and primitives every page depends on.

- Tailwind theme with Berry Bright tokens; load Bricolage Grotesque / Hanken Grotesk / JetBrains Mono (replace the current Fredoka/Varela Round link).
- Build core primitives as shadcn-style components: `Logo`/`BerryMark`, `Avatar` (deterministic gradient monogram), `Pill` (6 tones), `Caret`, `Button` (primary/ghost/buy variants), `Card`, `StatCard`, `TopNav` (Simulator/Markets/Leaderboards/Learn + cash chip + bell + avatar; guest variant), `Footer`, field/input pattern.
- Add **dither-kit** charts (`npx @dither-kit/cli add area-chart bar-chart`); wrap in a `PortfolioChart`/`Sparkline` that takes a real price series.
- **`src/api/client.ts`** — `axios.create({ baseURL })` behind an env var, replacing the 10 copies of the base-URL ternary. Add a request interceptor that attaches the Firebase ID token (pairs with Phase 3).
- **`<ProtectedRoute>`** wrapper; add null-safety so pages don't crash for logged-out users.
- Move the MUI theme out of `App.jsx` into `src/theme.ts` and put `<CssBaseline>` inside `<ThemeProvider>` for the transition period; fix the invalid `color: "secondary"` override.

Verification: primitives render against the screenshots in isolation (a scratch page or Storybook); a chart shows a real series; an unauthenticated visit to a protected route redirects instead of crashing.

## Phase 2 — Page redesigns

Order (simplest/highest-value first): **Landing → Simulator → Leaderboards → My Profile → Learn hub → Stock detail (new) → User Profile (new)**.

Each page: rebuild UI in Tailwind/shadcn against its screenshot, wire real data through `api/client`, and clear that page's audit items in the same PR. Notable per-page work:

- **Landing** (`HomePage`): hero with gradient-text line, floating product preview, movers ticker, features, pricing (dedupe the tiers currently defined 3×), CTA, footer. No auth dependencies — good first migration.
- **Simulator** (`SimulatorPortfolioPage`, 1213 lines): the big one. Portfolio hero + timeframe switcher, stat row, holdings table, quick-trade card, streak/challenge card, watchlist. Decompose the file; **remove the module-level mutable `var`s** (`:49-54`); dedupe the buy/sell handlers (`:332-459`) and the near-identical Buy/Sell TabPanels; fix the `window.location.reload()` loop, duplicate DOM ids, and the enrollment-index bug.
- **Leaderboards**: podium (places 2-1-3), scope switcher (Global/Friends/My league), ranked table with the "You" row state. Seasons/leagues/streaks are new feature surface — confirm data model with backend.
- **My Profile** (`ProfilePage`, 720 lines): hero with level/XP bar, stat strip, portfolio mini-chart, badges grid (earned/locked states), activity timeline. Extract the shared avatar constants (`src/constants/avatars.ts`) and the chat dialog (dedupe with CoachPortal). XP/levels/badges/timeline are new features.
- **Learn hub** (`ArticlesPage`): featured path, continue-learning card (progress states), category chips, article grid. No article-detail was designed — keep the existing `/Article/:id` until a design exists. Remove the dead `getArticleId`.
- **Stock detail (new)**: introduce a `/Markets` section and a `/stock/:symbol` route. Header + brand tile, chart card with OHLC + timeframe, "simple version" explainer, key-statistics, sticky order ticket (Market/Limit, quantity stepper, quick-size, summary), your-position card. Today trading happens only via dialogs inside the Simulator page — this is genuinely new navigation.
- **User Profile (new)**: cover band + hero, follow/message actions, stat strip, public performance chart, top-holdings with allocation bars, achievements grid, activity timeline, "You vs Diego" compare CTA. **Needs a new backend social layer** (followers/following, Follow, public-holdings sharing) — see Phase 3/backend. The **compare view is undesigned** — stop and get a design before building it.

Undesigned states (modals, loading, empty, error) recur across every page — design them once as a set before Phase 2 gets deep, or stub with sensible defaults and flag for review.

Verification per page: side-by-side against `screenshots/0X-*.png`; exercise the real data path (load, and for Simulator/Stock a full buy→refresh→sell flow); confirm no MUI regressions on not-yet-migrated pages.

## Phase 3 — Backend security (parallel to Phase 2)

Goal: close the critical holes from the backend audit.

- **Firebase Admin SDK + `verifyIdToken` middleware** on all mutating endpoints; derive the acting user from the token, not the URL `:email`. This is the linchpin — it makes the Phase 1 token interceptor meaningful.
- **Server-side trade price**: `POST /game/simulator/:id/:email` looks up `/stock/price` internally and ignores client-supplied `price`.
- **Close NoSQL injection**: whitelist/validate query params (reject object values) in `parseRequestParams`, or adopt a validation library (zod/joi).
- **Lock `/admin/*`** behind an admin-role check (not a global env flag); guard `populateModels.js` against non-local DB URLs.
- **Fix falsy-zero validation** (`permissionLevel`/`rarity`/`premiumTier`/`transactionType`/`userStartFund`) — use `== null` / `=== undefined` checks so `0` is accepted independent of the string coincidence.
- Fix the confirmed correctness bugs: badge-creation shadow (`Account.js:944`, breaks the achievement cron), wrong-model rollback (`:1045`), `ownerUser` query (`:1449`), unawaited saves, sell-to-zero holdings, unguarded nulls, `Stock.js` missing error handling, implicit globals.

Verification: curl each mutating endpoint without a token → 401; with a token for user A trying to act on user B → 403; a forged trade price is overridden server-side; `?email[$ne]=null` returns empty/400, not the table.

## Phase 4 — Backend refactor

Goal: maintainability and serverless-correctness.

- Split `Account.js` (2127) and `Game.js` (1710) into controllers + services; one shared helpers module (collapse `parseRequestParams` ×4, `getPricedStockInformation` ×3, etc.).
- **Replace the 21 self-HTTP-calls** (`local_route`) with direct function calls.
- Express **error middleware** + correct status codes (404/500/401/403); stop leaking `e.message`; add `process.on('unhandledRejection')`.
- Normalize to **async/await** (remove `.then()` pyramids and the `new Promise(async…)` antipattern); structured logger with levels (replace 28 `console.log`s); drop the per-price credit logging in hot paths.
- **Cron**: move to Vercel Cron (or a dedicated worker) with an explicit timezone; make the market-mover refresh atomic (fetch before delete); add retry/alerting.
- **Caching**: replace per-instance NodeCache/`global.cachedStockList` with a shared store, or document the serverless trade-off; expire the stock list.
- Fix the `learderboard` typo across routes **with a deprecated alias** so the frontend keeps working until it's updated; consolidate the two dev flags into one; upgrade `@now/node` → `@vercel/node`.

Verification: existing flows still pass end-to-end after the refactor; cron fires on schedule in the deployed environment; a deliberate handler error returns the right status and a safe message.

---

## Cross-cutting risks

- **MUI ↔ Tailwind coexistence** during Phase 2: keep them scoped (don't mix `sx` and Tailwind on the same element); the shared `TopNav`/`Footer` must switch to Tailwind early since every page uses them.
- **New feature data models** (XP/levels, badges, streaks, seasons/leagues, follow graph, lesson progress) are implied by the designs but not speced — each needs a backend schema decision before its page can use real data. Until then, redesign against placeholder data and flag.
- **Auth cutover**: Phase 1's token interceptor and Phase 3's verification must land together, or every API call 401s / stays unprotected. Coordinate the two.
