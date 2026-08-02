# Backend Audit — Finberry Stock Simulator

_Audit date: 2026-08-02. Scope: `server/`. No code was changed to produce this document._

## Stack & structure

Node.js + Express 4.18 + Mongoose 6.8 (MongoDB), plain CommonJS JavaScript. No TypeScript, no build step, no tests (`npm test` → `echo "Error: no test specified" && exit 1`). Stock data from **Twelve Data** only. Deployed to **Vercel serverless** (`server/vercel.json`, deprecated `@now/node` builder).

```
server/
├── index.js              entry (68 ln): require all 16 models, dotenv, mongoose.connect, mount routers, app.listen
├── src/interfaces.js     dead constants (never imported)
├── src/scheduleTasks.js  node-schedule cron jobs
├── src/populateModels.js DB seed (drops the whole DB!)
├── src/models/*.js       16 mongoose schemas
├── src/routes/*.js        5 express routers
└── vercel.json
```

No controller/service layer — all logic is inline in route handlers. No middleware dir, no validation, no auth, no error-handling middleware.

**File sizes** (server total ≈ 5,781 lines):

| File | Lines |
|---|---|
| `routes/Account.js` | **2127** |
| `routes/Game.js` | **1710** |
| `routes/Admin.js` | 432 |
| `routes/Stock.js` | 272 |
| `routes/Educational.js` | 178 |
| 16 models combined | 897 |

`Account.js` + `Game.js` = 66% of the codebase, each with ~10 near-identical CRUD blocks and zero abstraction.

## Models (16)

`User` (Firebase-mirrored account; `permissionLevel` 0-3, `premiumTier`, `privacySettings` sub-doc), `Badge` (definition; `rarity` 0-6), `UserBadge` (award instance), `Article`, `Simulator` (competition), `SimulatorEnrollment` (user↔sim join with `balance`, `lastCalculatedTotal/Date/Ranking`, `pastCalculatedTotal[]`, holdings, tradeHistory), `Holding`, `TradeTransaction` (`transactionType` 1=buy/2=sell), `MarketMovers`, `CoachingProfile` (`status` 0-5, reviews, clients), `CoachingCoach` (client-side view), `CoachingClient` (coach-side view), `CoachingSession` (`status` 0-6, chatMessages), `ChatMessage`, `Review`, `PaymentHistory`.

Inconsistency: most files use `mongoose.SchemaTypes.ObjectID` (capital D); `User.js:137` and `CoachingProfile.js:36` use `mongoose.Schema.Types.ObjectId`. Both work.

## Route groups

Mounted at `/account`, `/educational`, `/game`, `/admin`, `/stock` (`index.js:59-63`).

- **`/account`** (`Account.js`): user CRUD + availability check; premium upgrade (`POST /account/user/:userID`); badges/userbadges CRUD; `POST /account/achievement`; coaching profiles/reviews CRUD; session state machine (`POST /account/coachingSession/:id`); CoachingClient/Coach/ChatMessage/PaymentHistory CRUD.
- **`/game`** (`Game.js`): simulator CRUD + enroll; enrollment CRUD; **buy/sell `POST /game/simulator/:simulatorID/:email`**; holdings/transactions CRUD; market movers; `balancecalculation/*` incl. the misspelled `.../learderboard`; `POST /game/achievement[/:simulatorID]` (top-3 + last-place badges).
- **`/stock`** (`Stock.js`): `/price` (5-min cache), `/time_series` (1-hr cache), `/stocks` (NASDAQ+NYSE in `global.cachedStockList`), `/exist/:symbol`, `PUT /price_dictionary`.
- **`/admin`** (`Admin.js`): `DELETE /admin/schemas` (drops 16 collections, dev-gated), `POST /admin/marketmover`, `POST /admin/leaderboard[/:simulatorID]`, `POST /admin/mock/*`.
- **`/educational`** (`Educational.js`): article CRUD.

## Critical security holes

All endpoints are **unauthenticated** and CORS is fully open (`index.js:48` `app.use(cors())` → `Access-Control-Allow-Origin: *`, all methods/headers). No JWT, no session, no Firebase Admin SDK, no `Authorization` parsing anywhere.

1. **No auth / privilege escalation.** `PUT /account/user/email/:email` with `{ permissionLevel: 3, premiumTier: 2 }` succeeds unauthenticated — the block list at `Account.js:471, 504` excludes only `_id, email, username` and array refs; `permissionLevel`, `premiumTier`, `premiumExpiryDate`, `accountStatus`, `permittedToCoach` are all writable. `POST /account/user/:userID` (`:586`) grants premium with a self-declared payment record (no payment processor exists in the codebase). Anyone can also trade on any portfolio, `DELETE` any account, create/edit simulators, self-approve a coaching profile (`status: 1`), or edit/delete anyone's review.

2. **Trade-price exploit** (highest-impact logic flaw). `Game.js:527-686` accepts `price` from the request body and never validates it against the stock API: `req.body.price = Number(req.body.price)` → `totalCost = price * quantity`. A client can post `{ transactionType: 1, price: 0.01, quantity: 1000000 }` then sell at `price: 999999`. The entire leaderboard is forgeable. The server has `/stock/price` available and simply never calls it here.

3. **NoSQL operator injection.** `parseRequestParams` (`Account.js:29`, `Game.js:29`, `Educational.js:22`, `Stock.js:19`) copies raw `req.query` values straight into `Model.find()`. Express's extended query parser turns `?email[$ne]=null` into `{ email: { $ne: "null" } }`, so `GET /account/user?email[$ne]=null&moreDetails=true` dumps the user table.

4. **Unauthenticated admin / DB-wipe.** `POST /admin/leaderboard` and `POST /admin/marketmover` are open (burn Twelve Data quota; wipe the MarketMovers collection). `DELETE /admin/schemas` drops all 16 collections behind only `if (process.env.REACT_APP_DEVELOPMENT == "true")` — a server-wide global switch, not per-user. If that env var is ever true in prod, an unauthenticated request wipes the database.

5. **`npm run populate` drops the production DB.** `populateModels.js:10` calls `mongoose.connection.db.dropDatabase()` **unconditionally** against `process.env.REACT_APP_DB`.

**Secrets**: none hardcoded — all from `process.env` (`REACT_APP_FINBERRY_TWELVEDATA_API_KEY` in `Stock.js`/`Admin.js`, `REACT_APP_DB` in `index.js:34`/`populateModels.js:6`). `.env` is gitignored and never committed. Concern: the Twelve Data key is prefixed `REACT_APP_` (the CRA convention that inlines vars into the client bundle) — it's only read server-side today, but the naming makes accidental exposure one import away. Also `src/lib/firebase.tsx:5` `console.log(firebaseConfig)` dumps config to the browser console (Firebase web keys are public by design, but remove it).

**Input validation**: no library (joi/zod/express-validator). Hand-rolled truthiness produces falsy-zero bugs (below). No rate limiting, no `helmet`, no body-size limit, no request logging.

## Confirmed bugs

1. **Badge creation always crashes on first award.** `Account.js:934-952` — inside the `else` branch, `const badge = new Badge(newBadge)` (`:944`) shadows the outer `let badge` (`:918`, still `null`); `:952` then does `badgeType: badge._id` on the outer `null` → `TypeError`. Every *new* achievement type fails; only re-awards work. Silently breaks the hourly badge cron.
2. **Wrong model + id in a rollback.** `Account.js:1045` — `await User.remove({ _id: coachingProfile._id })` should be `CoachingProfile.deleteOne(...)`. Tries to delete a *User* whose `_id` equals a *CoachingProfile* id; the orphaned profile is never cleaned up. (`.remove()` also gone in Mongoose 7.)
3. **Query on a nonexistent field.** `Account.js:1449` — `CoachingCoach.findOne({ user: userID, coach: coachID })` but the schema field is `ownerUser` (`CoachingCoach.js:6`). Mongoose 6 `strictQuery: true` strips `user`, so it matches the first CoachingCoach for that coach regardless of client — one client's session can attach to another client's relationship record.
4. **Falsy-zero validation rejects legal values.** `Account.js:314` `!newUser.permissionLevel` rejects `permissionLevel: 0` (every normal user — works only because `RegisterPage:58` sends the string `'0'`); `Account.js:903` `!req.body.rarity` rejects `rarity: 0`; `Account.js:590` `!newAttrs.premiumTier` blocks downgrading to free; `Game.js:540` `!req.body.transactionType`; `Game.js:200` `!newSimulator.userStartFund` rejects a 0-fund simulator.
5. **`Stock.js` has zero error handling.** `:43-88` and `:95-117` — no `try/catch`, no `.catch()` on any axios promise. A Twelve Data timeout/rate-limit/non-2xx rejects unhandled; on Node 15+ an unhandled rejection can terminate the process.
6. **Implicit globals.** `Stock.js:152, 164` — `for (stock of nasdaqStocks)` (no `let`/`const`) creates `global.stock`; throws under strict mode / ESM.
7. `Game.js:1378` — `Math.abs(totalBalance - lastCalculatedTotal)` yields `NaN` on first calc (undefined `lastCalculatedTotal`); masked by a length short-circuit but fragile.
8. `Game.js:1397-1403, 1462-1468` — unawaited `.save()` in a loop; the response returns before ranking writes flush.
9. `Game.js:661` — selling a full position leaves a `quantity: 0` Holding row (junk accumulates; `GET /game/holding` still returns them).
10. `Game.js:1700` — unguarded `lastEnrollments.user._id`; TypeError when a simulator has no ranked enrollments (in the cron-triggered achievement route).
11. `forEach(async …)` with `await` inside (`Account.js:89-96, 112-114, 565-567`, `Game.js:1142`) — `forEach` ignores returned promises, so cascading deletes return early.
12. `Admin.js:43-55` — `dropCollection` not awaited inside `try/catch`; rejections escape and every collection is reported "Success".

## Architecture smells

- **The server HTTP-calls itself.** Routes issue axios requests to `process.env.local_route` (their own base URL) instead of calling functions — 21 occurrences across `Game.js`, `Admin.js`, `Stock.js`, `scheduleTasks.js`. One price lookup is `GET /stock/price` → `GET /stock/exist/:symbol` → `GET /stock/stocks`. A leaderboard run chains cron → `POST /admin/leaderboard` → `GET /game/balancecalculation/stocksused` → per-symbol `/stock/exist` + `/stock/price` → `POST /game/.../learderboard`. Multiplies latency, forces every internal call through CORS/JSON, and on Vercel spawns a fresh serverless invocation per hop.
- **Helper duplication**: `parseRequestParams` ×4; `requestingTrueFalseParam` ×3; `requestingSpecificParam` ×2; `autoManageOutput` ×3; `getPricedStockInformation` ×3 **with three different implementations** (`Stock.js:221`, `Admin.js:148`, `Game.js:1111`); multer boilerplate in all 5 routers (never attached to a route).
- **Duplicate route pairs**: `PUT /account/user/:userID` (`:452`) vs `PUT /account/user/email/:email` (`:485`) — identical but for lookup; same for the two DELETEs. The `learderboard` POST pair (`:1353`/`:1416`) and GET pair (`:1477`/`:1507`) are ~55 lines duplicated each. `POST /game/achievement/:simulatorID` (`:1578`) repeats an 18-line badge-award block three times (a lookup table would collapse it).
- **Error handling**: everything is `catch (e) { res.status(400).json({ msg: e.message }) }` — 400 for every failure (no 404/500, no 401/403), leaking Mongoose internals to the client. No Express error middleware, no `process.on('unhandledRejection')`. Empty catch at `Account.js:115-116`; bare `catch {` at `Admin.js:49`, `Game.js:1290`.
- **Callback vs async/await** mixed even within a file: `.then()` pyramids (`Stock.js:49-84`, `Admin.js:74-125`), `new Promise(async (resolve) => {...})` antipattern (`Admin.js:148`, `Stock.js:221`) that swallows rejections, and mongoose callback form `mongoose.connect(DB, cb)` (`index.js:35`) whose callback ignores its `err` and prints "Database Connected" on failure.
- **Dead code**: `interfaces.js` (never imported); `upload` (multer) in all 5 routers; `module.exports = router` twice in `Educational.js` (6, 179); all routers `module.exports = router` at the *top* before routes register (works only because the object is mutated in place); commented-out `/badge/top` route (`Admin.js:304-328`); `index.js:46` imports a non-existent `./stock`; `scheduleTasks.js` creates and exports a router mounted nowhere; unused `mongoose` import in `Stock.js`/`scheduleTasks.js`.
- **Typos baked into the public API**: `learderboard` (route path ×4, mirrored in the frontend), `coastingProfileID` (`Account.js:1382`), "Atempt"/"atempt" ×12, "Entrolling", "sucessfully", "Developement" (`index.js:31`).
- **Two dev flags for the same idea**: `REACT_APP_FINBERRY_DEVELOPMENT` (base-URL select, `index.js:26`) vs `REACT_APP_DEVELOPMENT` (dev-command gate, `index.js:30`). Easy to set one and not the other.
- 28 unstructured `console.log`s (no logger/levels); several log remaining API credits on **every** price fetch (`Stock.js:68, 109`, `Admin.js:184`).

## Serverless incompatibility

The code is written as a long-lived server but deployed to Vercel functions:
- `app.listen()` (`index.js:66`) runs on every cold start.
- `node-schedule` jobs (`scheduleTasks.js`) need a persistent process — **they will not fire on Vercel serverless**. Cron work is effectively dead in prod unless Vercel Cron / an external pinger is configured (none in the repo).
- `NodeCache` (`Stock.js:39, 91`, `Admin.js:144`) and `global.cachedStockList` (`Stock.js:121`) are per-instance memory — across invocations the cache mostly misses, hammering the Twelve Data rate limit. `global.cachedStockList` also never expires (new listings/delistings need a redeploy).

## Cron jobs

Both in `scheduleTasks.js`, registered via `require("./src/scheduleTasks")` (`index.js:56`), working by HTTP-POSTing to the server's own routes:

- **Hourly `0 */1 * * *`** — `POST /admin/leaderboard` (price all in-use symbols, write `lastCalculatedTotal/Date/Ranking`, append to `pastCalculatedTotal` when delta > 50), then `POST /game/achievement` (award rank-1/2/3 + "Dead Last" badges per visible simulator).
- **Daily 22:00 `0 22 * * *`** — `POST /admin/marketmover` → fetch `market_movers/stocks`, `DELETE /game/marketmovers` (wipe), re-insert per row.

Issues: no timezone specified (runs in host local time = UTC on Vercel; "10 pm" is undefined vs market close); failures swallowed into `console.log("… update failed.")` with no retry/alert; endpoints unauthenticated (quota abuse / collection wipe); `updateMarketMovers` fires inner POSTs without awaiting (`Admin.js:92-115`); market movers deleted before the new fetch is confirmed (a Twelve Data failure leaves the collection empty until next day); both jobs depend on `POST /account/achievement`, broken by bug 1 for any not-yet-existing badge.

## Deployment / config

- Port `process.env.PORT || 5000` (`index.js:66`); CRA dev on 3000.
- `server/vercel.json` — Vercel v2, deprecated `@now/node`, catch-all → `index.js`. No Procfile/Dockerfile; the React app's deploy target isn't captured in the repo.
- Env vars required: `REACT_APP_DB`, `REACT_APP_FINBERRY_TWELVEDATA_API_KEY`, `REACT_APP_FINBERRY_DEVELOPMENT`, `REACT_APP_DEVELOPMENT`, `PORT`, plus six `REACT_APP_FINBERRY_*` Firebase vars (client). **No `.env.example`.**

## Prioritized fix list

**Security (do first):**
1. Firebase Admin SDK + `verifyIdToken` middleware on all mutating endpoints; derive the acting user from the token, not the URL email.
2. Server-side price on trades — look up `/stock/price` internally; ignore client `price`.
3. Sanitize/whitelist query params (reject object values) to close NoSQL injection; or use a validation library.
4. Lock `/admin/*` behind admin-role auth, not a global env flag; guard `populateModels.js` against non-local DBs.
5. Fix falsy-zero validation (use `=== undefined`/`== null` checks).

**Correctness:**
6. Fix the badge-creation shadow bug, wrong-model rollback, `ownerUser` query, unawaited saves, sell-to-zero holdings, unguarded nulls.
7. Add `try/catch` + error middleware; correct status codes (404/500/401/403); stop leaking `e.message`.

**Structure (refactor):**
8. Split `Account.js`/`Game.js` into controllers + services; one shared helpers module; replace self-HTTP-calls with direct function calls.
9. Move cron to Vercel Cron (or a worker) with explicit timezone; make market-mover refresh atomic; add retry/alerting.
10. Replace per-instance caches with a shared store (or accept and document the trade-off); expire the stock list.
11. Normalize to async/await; structured logger; fix `learderboard` (keep a deprecated alias so the frontend keeps working during transition).
