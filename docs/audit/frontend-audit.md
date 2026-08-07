# Frontend Audit — Finberry Stock Simulator

_Audit date: 2026-08-02. Scope: `src/` (React client). No code was changed to produce this document._

## Stack

| Concern | Choice |
|---|---|
| Framework | React 18 (`react`/`react-dom` ^18.2.0), `ReactDOM.createRoot` |
| Build | Create React App (`react-scripts` 5.0.1), not ejected |
| Language | TypeScript ^4.8.2 (`strict: true`), but `App.jsx`/`setupTests.jsx` are plain JSX and `any` is used 100+ times |
| UI | MUI v5 (`@mui/material`, `@mui/icons-material`, `@mui/lab`) + Emotion |
| State | None. Two bare `createContext` (`context/firebase.tsx`, `context/user.tsx`) + local `useState`. `index.tsx:8` comment: "Have to add redux" |
| Routing | `react-router-dom` ^6.3.0 |
| HTTP | `axios` ^1.2.1 (no wrapper/interceptors) |
| Auth | `firebase` ^9.15.0 (Auth only, client-side) |
| Charts | `recharts` ^2.4.3 |
| Loading | `react-promise-tracker` ^2.1.1 |
| Tests | `@testing-library/*` installed, **zero tests exist** |

No ESLint config file, no Prettier, no `.editorconfig`, no CI. No `.css` files anywhere — styling is entirely MUI `sx` + inline `style={{}}`.

**Unused dependencies to remove**: `switch` (`^0.0.0`, placeholder package, no usages), `react-responsive` (unused — MUI `useMediaQuery` used instead), `web-vitals` (no `reportWebVitals` exists), `@testing-library/*` (no tests).

## Structure

```
src/
├── App.jsx              router + MUI theme (inline) + providers
├── index.tsx            ReactDOM root, FirebaseContext, CssBaseline
├── config.tsx           firebaseConfig from env
├── components/          11 shared components (<Name>/index.tsx)
├── containers/          18 page components (<Name>Page/index.tsx)
├── constants/areas.tsx  promise-tracker area names
├── context/             firebase.tsx, user.tsx
├── hooks/use-auth.tsx   useAuthListener
├── lib/firebase.tsx     initializeApp + getAuth
└── images/              avatars/ (31 png), badges/, logos/, photos/
```

Routes (`App.jsx:81-106`): `/`, `/Login`, `/Register`, `/PasswordReset`, `/Article/:id`, `/Articles`, `/Profile/:email`, `/SimulatorPortfolio`, `/GamePortfolio`, `/Leaderboards`, `/CoachPortal/:email`, `/CoachCatalogue`, `/CoachRegistration`, `/BuyPremium`, `/FAQ`, `/Contact`, `/About`, `*`.

Components: `Balance`, `Chart`, `Dropdown`, `Footer`, `Header`, `Holdings`, `LinkDropdown`, `Orders`, `Pricing`, `Spinner`, `Title`. The `components/` vs `containers/` split is the old CRA convention but not followed semantically — `containers/` is really `pages/`, and `Holdings`/`Orders`/`Chart` are Simulator-specific rather than generic.

## Critical issues (fix first)

### 1. Auth is unenforced end-to-end
The client signs in with Firebase but **never sends a token to the backend**. No `getIdToken()`, no `Authorization` header anywhere. Every API call identifies the user by putting `email` in the URL/body (`?email=` / `data: { email }`). The server therefore trusts a client-supplied identity. Any client can read or mutate any user's data by changing the email string — e.g. `PUT account/user/email/<victim>` with `{ bio }` (`ProfilePage:186-193`) or place trades via `POST game/simulator/<simId>/<victim-email>` (`SimulatorPortfolioPage:315-322`).

There is **no `<ProtectedRoute>`** — protection is ad-hoc per page. `/SimulatorPortfolio`, `/Leaderboards`, `/CoachPortal/:email`, `/CoachRegistration`, `/Profile/:email` have no guard, and several dereference `user.email` for a logged-out visitor and throw: `SimulatorPortfolioPage:117` (`String(user.email)` in `useEffect`), `CoachRegistrationPage:17`, `CoachPortalPage:205`.

**Fix**: axios request interceptor attaching `getIdToken()`; server-side verification (see backend audit); a `<ProtectedRoute>` wrapper.

### 2. Module-level mutable state used as render state
- `SimulatorPortfolioPage:49-54` — `simulatorExists`, `simIndex`, `rows`, `chartData`, `holdingsRows`, `simulators` are module-level `var`s mutated by `updateRows()` / `updateHoldingsRows()` / `handleSimulatorChange()`. React never sees the change; the UI only updates when an unrelated `setState` re-renders. They persist across unmount/remount and are **shared between component instances** — navigating away and back shows the previous user's rows. This is the root cause of the "simulator bug fix" commits (`5273c71`, `f2ad21a`).
- `ProfilePage:81` / `CoachPortalPage:76` — `var currImg: any` at module scope, set inside a `.then()`. Same class of bug: the avatar is a shared global that never triggers a re-render.

**Fix**: move all of this into `useState`/`useReducer` or refs.

### 3. Three files are ~46% of the frontend
| Lines | File |
|---|---|
| 1213 | `containers/SimulatorPortfolioPage/index.tsx` |
| 891 | `containers/CoachPortalPage/index.tsx` |
| 720 | `containers/ProfilePage/index.tsx` |

Total `src/` ≈ 6,300 lines. These should be decomposed during their redesigns.

## Duplication

- **Base-URL ternary** copied verbatim into 10 files: `HomePage:27-30`, `SimulatorPortfolioPage:44-47`, `CoachPortalPage:72-75`, `ProfilePage:77-80`, `LeaderboardsPage:17-20`, `RegisterPage:10`, `CoachRegistrationPage:10`, `ArticlePage:20`, `ArticlesPage:26-29`, `CoachCataloguePage:27-30`. The prod URL `https://finberry-stock-simulator-server.vercel.app/` is baked into the bundle — no way to point a build at staging. **Fix**: `src/api/client.ts` with `axios.create({ baseURL })` behind `REACT_APP_API_URL`.
- **Page-shell `sx` block** (~12 lines: `backgroundColor: primary.main`, `minHeight: 100vh`, `borderRadius: 3rem`, `boxShadow`, `paddingTop: 5rem`) copy-pasted into 11 page files. **Fix**: `<PageShell>` component.
- **31-avatar `require()` block + `avatars` array** byte-for-byte duplicated between `ProfilePage:43-132` and `CoachPortalPage:40-133` (~180 lines). Uses CommonJS `require()` in a TS module and stores the source path string in the DB, then O(n) scans to map it back. **Fix**: shared `src/constants/avatars.ts` with an id→import map.
- **Chat Dialog JSX** (~100 lines) duplicated between `ProfilePage:578-700` and `CoachPortalPage:747-868` (differ only in `!=` vs `==` alignment check). The chat polling `useEffect` + `handleChatMsgSubmit` are duplicated the same way.
- **Buy/Sell refresh cascade** (`account/user` → `game/tradeTransaction` → `game/holding` → `balancecalculation`) copy-pasted between `handleBuyInputSubmit` (`SimulatorPortfolioPage:332-383`) and `handleSellInputSubmit` (`408-459`) — ~50 identical lines differing only in `transactionType` and quantity var. The two Buy/Sell `TabPanel`s (811-1004, 1005-1186) are near-identical ~190-line blocks; the two Trade Summary `Dialog`s (641-716, 717-795) a third copy.
- **Pricing tiers** defined three times: `Pricing/index.tsx:14-53`, `BuyPremiumPage:22-53`, and in prose in `FaqPage:25`.
- **Footer** (`Footer:17-28`) — `linksAuth`/`links` identical but for one entry; two `<Toolbar>` branches otherwise identical.
- **Header** (`Header:25-53`) — four overlapping link arrays; `links` (25-31) never used.

## Confirmed bugs

1. `LoginPage:164` — `<Navigate to={'/profile/' + user.Email}>` — capital `E`; Firebase has `email`. Produces `/profile/undefined`.
2. Chat polling `useEffect` with `[chatItems]` dependency (`ProfilePage:260-275`, `CoachPortalPage:305-320`) — setting `chatItems` re-runs the effect, tearing down/recreating the 10s interval; and `setChatItems(response?.data?.reverse())` mutates the axios array in place, so message order flips each poll.
3. `<ListItem>` inside `.map()` with no `key` (`ProfilePage:592`, `CoachPortalPage:760`).
4. `SimulatorPortfolioPage:108-134` — `useEffect(..., [])` dereferences `user.email` with no null check → crash for logged-out users.
5. `SimulatorPortfolioPage:186-195` — simulator-lookup loop resets `simulatorExists = false` on every non-match; a non-matching final iteration leaves stale `simIndex = 0` pointing at the wrong enrollment.
6. `SimulatorPortfolioPage:465-481` — `handleEnrollSubmit` calls `window.location.reload()` inside a loop (full page reload in an SPA).
7. Duplicate DOM ids: `id='buy-input'` twice (`SimulatorPortfolioPage:838, 852`), `id='sell-input'` twice (1032, 1046); `id="outlined-multiline-static"` at `ProfilePage:453`, `CoachPortalPage:548, 597`.
8. `App.jsx:54` — `MuiButton.styleOverrides.root.color = "secondary"` — invalid CSS color (raw `color` property set to a string that isn't a color); silently does nothing.
9. `Holdings:92` — `((row.price - row.avgPrice) / row.avgPrice) * 100` with no guard against `avgPrice === 0` → `Infinity%`/`NaN%`.
10. `Dropdown:48` / `Header:235` — `.catch((e) => setError(e.response.data.msg))` on Firebase `signOut()`; Firebase errors have no `.response`, so the catch handler itself throws.
11. Invalid HTML nesting — `<TextField>`/`<Grid>`/`<List>` inside `<DialogContentText>` (renders a `<p>`): `ProfilePage:451-462, 587-687`, `CoachPortalPage:546-557, 595-605, 755-855`.
12. `Chart` hardcodes title `"Today"` (`Chart:12`) but renders a 1-year weekly series (`SimulatorPortfolioPage:280-283` requests `interval: '1week'`).
13. `Balance` hardcodes "on {today}" using deprecated `substr` (`Balance:10-11,26`); crashes on `amount.toLocaleString` if `amount` undefined.
14. `ArticlesPage:42-48` — `getArticleId` is dead: `async`, `await`s a `.then()` whose value is discarded (always resolves `undefined`), never called.

## Dead code / placeholders shipping to prod

- `GamePortfolioPage/index.tsx` — 13-line placeholder rendering `<h1>Game Portfolio Page placeholder</h1><p>sus</p>`, wired to a live route (`App.jsx:93`).
- `ContactPage` — Submit `onClick` commented out (`ContactPage:106`); fields uncontrolled; three inputs share `name='email'` (64, 73, 86).
- `BuyPremiumPage:166` — hardcoded **Stripe test-mode** link `https://buy.stripe.com/test_...` in the live "Get started" button.
- `ProfilePage:552` / `CoachPortalPage:601` — `defaultValue="I love DogeCoin"` bio placeholder on production form.
- `RegisterPage:57-58` — hardcoded `preferredName: 'test'`, `permissionLevel: '0'` on every signup.
- 12 `console.log`s incl. `lib/firebase.tsx:5` (dumps full Firebase config every page load), `Dropdown:43`, `Header:230`, `RegisterPage:61`, `LoginPage:39`, `HomePage:53`, `CoachPortalPage:204-206`, `SimulatorPortfolioPage:129`, `CoachRegistrationPage:40,56`.
- Unused imports throughout (CRA warns, doesn't fail): `axios` in `LoginPage`/`ContactPage`, `Navigate`/`ButtonGroup` in `Header`, etc.
- `index.tsx:8` — `//Have to add redux here for state`.

## Conventions / consistency

- 100% function components, but two declaration styles ~50/50: `const X = () => {}; export default X` vs `export default function X(props: any)`.
- Two hook-import styles in the same file: `useState(...)` and `React.useState(...)` interchangeably (`SimulatorPortfolioPage`, `ProfilePage`, `CoachPortalPage`).
- Prop typing very weak — only ~4 files define real interfaces; `Footer`/`Header` `Props { isAuthenticated: boolean }` but `App.jsx:80,108` passes the Firebase `user` object (the type is a lie).
- Handler naming: `handleClose`/`handleClose2/3/4`, `open`/`open2/3/4` (`CoachPortalPage:85-98`, `ProfilePage:87-90`). Recurring typo `handleSumbit` in `Header:227`, `LoginPage:28`, `RegisterPage:35`, `CoachRegistrationPage:32`.
- Mixed quotes/semicolons across and within files (most recent commit is literally `fix-formatting`). No lint/format gate.
- Route casing `/Login` (declared) vs `/login` (linked) — works only because RR v6 is case-insensitive.
- Loose `==` at `CoachPortalPage:137,350,371,373`, `ProfilePage:140`; `var` loop counters with async callbacks (closure hazard).
- `<CssBaseline />` rendered outside `<ThemeProvider>` (`index.tsx:14`) — applies default baseline, not the custom theme.
- Firebase user redundantly mirrored into `localStorage` (`use-auth.tsx`) with a non-null assertion on a possibly-null `getItem` — Firebase already persists sessions in IndexedDB.
- No `.env.example`; a fresh clone can't be configured without asking.

## Testing

Zero tests. `setupTests.jsx` exists (imports jest-dom) but nothing consumes it; no `*.test.*`/`__tests__`; `npm test` exits "No tests found"; no E2E, coverage, CI, or pre-commit hooks.

## Prioritized fix list

1. Auth: `getIdToken()` interceptor + `<ProtectedRoute>` (pairs with backend token verification).
2. Kill module-level mutable `var`s (`SimulatorPortfolioPage:49-54`, `ProfilePage:81`, `CoachPortalPage:76`).
3. Extract `src/api/client.ts`; move prod URL to `REACT_APP_API_URL`.
4. Decompose the 1213/891/720-line pages; dedupe avatars (~180 lines), chat dialog (~100 ×2), buy/sell handlers (~50 ×2).
5. Add Prettier + ESLint config + CI (formatting is actively churning in git history).
6. Move theme to `src/theme.ts`; put `<CssBaseline/>` inside `<ThemeProvider>`; fix `color: "secondary"`.
7. Remove `console.log(firebaseConfig)`, other logs, `"sus"` route, Stripe test link, `"I love DogeCoin"` defaults.
