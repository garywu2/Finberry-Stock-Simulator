# Berry Bright — Design System Reference

_Extracted from the redesign handoff. Token source of truth is `fb-shared.jsx`; the reference screenshots (`01..07-*.png`) are the primary visual reference. The mockups are plain-React inline-style prototypes — **recreate them in Tailwind + shadcn/ui**, do not copy the JSX._

This is a friendly **light mode** ("Berry Bright") — treat light mode as canonical.

## Direction

Beginner-friendly stock-trading simulator / finance education. Friendly light mode, **not** a dark trading terminal. Desktop web, fixed 1440px in the mocks (no responsive rules were designed — we add them). 7 screens: Simulator, Stock detail, Leaderboards, My Profile, User Profile (new), Learn hub, Landing.

## Colors (`fb-shared.jsx:9-16`)

| Token (CSS var) | Hex / value | Role |
|---|---|---|
| `--fb-bg` | `#F5F1FB` | page background |
| `--fb-bg-2` | `#EEE8F7` | secondary band (landing ticker strip) |
| `--fb-surface` | `#FFFFFF` | cards |
| `--fb-surface-2` | `#F3EFFB` | subtle fills, pill-group / input backgrounds |
| `--fb-surface-3` | `#E9E1F5` | track backgrounds (progress troughs, symbol tiles) |
| `--fb-line` | `#ECE5F5` | hairline borders |
| `--fb-line-2` | `#DCD3EC` | stronger borders |
| `--fb-text` | `#1E1630` | primary text |
| `--fb-text-2` | `#5F5577` | secondary text |
| `--fb-text-3` | `#938AA8` | tertiary / muted text |
| `--fb-violet` | `#7C3AED` | primary brand accent |
| `--fb-violet-soft` | `rgba(124,58,237,.10)` | violet pill / active-nav fill |
| `--fb-green` | `#0A9A52` | positive / up text |
| `--fb-green-btn` | `#16C078` | Buy button fill (text on it: `#063521`) |
| `--fb-green-soft` | `rgba(10,154,82,.12)` | up-pill fill |
| `--fb-red` | `#DA2F4D` | negative / down |
| `--fb-red-soft` | `rgba(218,47,77,.10)` | down-pill fill |
| `--fb-gold` | `#B57E0B` | rank / achievement accent |
| `--fb-pink` | `#D62D8E` | accent, used sparingly |

**Extended / non-token values used in the mocks** (worth adding as tokens):

- Bright accent green `#2BE08C` — gradients, checkmarks, berry leaf.
- Brand mark gradient `#A989FF → #7C3AED`; leaf stroke `#2BE08C`.
- Primary button gradient `linear-gradient(135deg, #9B6BFF, #7C3AED)`.
- Buy-button text `#063521`.
- Level/XP progress fill `linear-gradient(90deg, var(--fb-violet), var(--fb-green))`.
- Hero gradient-text `linear-gradient(100deg, #A989FF, #2BE08C)` (WebkitBackgroundClip).
- User-profile cover band `linear-gradient(115deg, #7C3AED, #16C078 130%)` + radial white highlight @25%.
- Medal colors: gold `#E8A21B`, silver `#9AA1B5`, bronze `#C77A3C`.
- Chart grid lines `rgba(30,16,48,.07)`, dashed `2 5`; area fill gradient from color @0.28 → 0.
- 10 avatar gradient presets (`AV_GRADS`, deterministic by name): `#A989FF/#6D28D9`, `#2BE08C/#0E8F57`, `#FF7AB8/#C026A3`, `#FFC65C/#E08A1E`, `#62B6FF/#2563EB`, `#FF8A5C/#D9480F`, `#7AE0D0/#0E8F8F`, `#C58BFF/#7C3AED`, `#FF5D8F/#B01254`, `#9BE05C/#4F9E0E`.

## Typography (`fb-shared.jsx:17-27`)

- **Display / headings**: `Bricolage Grotesque` (`.fb-dis` adds `letter-spacing: -.025em`). Google Fonts axes `opsz 12..96, wght 400..800`.
- **Body / UI**: `Hanken Grotesk` (base `15px`, `line-height: 1.5`, `font-feature-settings: "ss01"`). Weights `400;500;600;700;800`.
- **Numbers / tickers**: `JetBrains Mono` (`.fb-mono` adds `font-feature-settings: "tnum"; letter-spacing: -.02em`). Weights `400;500;600;700`.

Observed scale (px / weight): 60/800 hero H1 · 46/700 portfolio hero number (mono) · 44/800 CTA H2 & podium numeral · 40/800 section H2 · 34/700 page H1 & stock price · 32/700 profile name · 30/700 stock title · 26/700 featured/stat · 24/700 profile stats (mono) · 21–22/700 card titles · 18–19/700 section headings · 16/600 day-change · 15 body · 14.5 nav/buttons · 14 table cells · 13/13.5 secondary · 11.5–12/700 uppercase headers & eyebrows (`letter-spacing: .04–.08em`). Weights in use: 500/600/700/800.

## Spacing, radii, shadows

No named spacing scale — literal px, but consistent: app page padding `30`, landing sections `60` horizontal; column gaps `22`/`24`; card padding `22–32`; table rows `13–14px 24px`; TopNav `64px` tall, `0 30px`, gap `32`. Grid templates `1fr 380px` (Stock/Profile/User Profile/Articles) and `1fr 360px` (Simulator).

Radii: cards **18**; inputs / pill-groups / order-summary **12–14**; segmented items / nav links **9–10**; symbol tiles **10** (small **8**), stock logo tile **16**; buttons **11**; pills / chips **999**; progress bars **4–6**; avatars **50%**.

Shadows: card `0 1px 2px rgba(30,16,48,.04), 0 10px 26px -18px rgba(30,16,48,.16)` (`fb-shared.jsx:30`); primary button `0 4px 18px -6px rgba(124,58,237,.7)`; buy button `0 8px 20px -8px rgba(22,192,120,.6)`; landing floating preview `0 30px 70px -28px rgba(76,29,149,.35)` + `rotate(1.2deg)`; pricing "Plus" tier `0 24px 60px -28px rgba(139,92,246,.6)`.

## Component primitives (`fb-shared.jsx`)

| Primitive | Notes |
|---|---|
| `BerryMark` / `Logo` | Inline-SVG grape cluster + leaf; wordmark "finberry" in display font, weight 700, `-.04em` |
| `Avatar({name,size,ring})` | Deterministic gradient-monogram orb, up-to-2 initials; optional ring `0 0 0 2px bg, 0 0 0 Npx ring` |
| `Pill({tone})` | 6 tones — `up`, `dn`, `violet`, `gold`, `pink`, `mute`; mono 12.5/600, `padding 3px 9px`, radius 999, tone-soft bg |
| `Caret({up})` | Triangle glyph using `currentColor` |
| `Sparkline` | 30-pt polyline, stroke 1.6, round caps, green/red by direction |
| `AreaChart` | 90-pt line stroke 2.4 + gradient area fill + 4 dashed gridlines; `preserveAspectRatio="none"` |
| `TopNav({active,user,balance,guest})` | 64px sticky, `rgba(255,255,255,.82)` + `backdrop-filter: blur(12px)`, bottom hairline. Links **Simulator / Markets / Leaderboards / Learn**; active = violet text 700 on `--fb-violet-soft` radius 10. Right: cash chip (uppercase 11px label + mono balance) + bell + 36px avatar w/ violet ring. `guest` variant: no links, "Log in" + "Get started" |
| `btnPrimary` | Violet gradient, white, radius 11, `9px 18px`, 14.5/600, violet glow |
| `btnGhost` | `--fb-surface-2` fill, `--fb-line-2` border, primary text; same metrics |
| `.fb-card` | white, 1px `--fb-line`, radius 18, card shadow |

**No footer or input primitive exists** — both are inline patterns. Footer (`fb-landing.jsx:158-164`): top hairline, `36px 60px`, Logo left, 6 links center @13.5px `--fb-text-3`, copyright right ("© 2026 Finberry · Simulated trading. Not financial advice."). Input pattern: `--fb-surface-2` bg, `--fb-line-2` 1px border, radius 12, `11–13px 14–16px`, label above @12.5/600 `--fb-text-3`.

## Charts — dither-kit (README mandate)

Replace the hand-rolled `AreaChart`/`Sparkline` with **dither-kit** (`https://www.tripwire.sh/dither-kit`), a shadcn-style dithered chart library. Install per-component: `npx @dither-kit/cli add area-chart | bar-chart | avatar | button`; imports from `@/components/dither-kit`. **Requires Tailwind + a shadcn project.**

- Big `<AreaChart>` → dither-kit `<AreaChart>` + `<Area dataKey="value" variant="gradient" />`, color green/red by direction, `<XAxis>`/`<YAxis>` only where the mock shows axis labels, `<Tooltip>` on, `bloom="aura"` on the primary portfolio chart.
- `<Sparkline>` → dither-kit `<Sparkline data color interactive={false} bloom="low" />`.
- Replace the `genSeries()` random walk with **real historical price series** from the API.
- Optional: dither-kit `DitherAvatar` / `DitherButton` could replace the mock's gradient-monogram avatar and pill buttons (not required).

## Suggested Tailwind config mapping

Map tokens into `tailwind.config` `theme.extend` (and shadcn CSS variables) so utilities read semantically:

```js
// theme.extend
colors: {
  bg: '#F5F1FB', 'bg-2': '#EEE8F7',
  surface: { DEFAULT: '#FFFFFF', 2: '#F3EFFB', 3: '#E9E1F5' },
  line: { DEFAULT: '#ECE5F5', 2: '#DCD3EC' },
  ink: { DEFAULT: '#1E1630', 2: '#5F5577', 3: '#938AA8' },
  violet: { DEFAULT: '#7C3AED', soft: 'rgba(124,58,237,.10)' },
  up: { DEFAULT: '#0A9A52', btn: '#16C078', soft: 'rgba(10,154,82,.12)' },
  down: { DEFAULT: '#DA2F4D', soft: 'rgba(218,47,77,.10)' },
  gold: '#B57E0B', pink: '#D62D8E', accent: '#2BE08C',
},
fontFamily: {
  display: ['"Bricolage Grotesque"', 'sans-serif'],
  sans: ['"Hanken Grotesk"', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
},
borderRadius: { card: '18px', field: '12px', btn: '11px', pill: '999px' },
boxShadow: {
  card: '0 1px 2px rgba(30,16,48,.04), 0 10px 26px -18px rgba(30,16,48,.16)',
  btn: '0 4px 18px -6px rgba(124,58,237,.7)',
  buy: '0 8px 20px -8px rgba(22,192,120,.6)',
},
```

Prefer semantic shadcn CSS variables (`--background`, `--primary`, `--muted`) bound to these values so shadcn components inherit the palette automatically.

## Screen inventory

| Screen | File | Maps to | Status |
|---|---|---|---|
| Landing | `fb-landing.jsx` | `HomePage` | redesign (pricing overlaps `Pricing`/`BuyPremium`; footer overlaps `Footer`) |
| Simulator | `fb-simulator.jsx` | `SimulatorPortfolioPage` | redesign |
| Stock detail | `fb-stock.jsx` | none | **new** — implies a "Markets" section/route |
| Leaderboards | `fb-leaderboards.jsx` | `LeaderboardsPage` | redesign (podium/leagues/seasons/streaks are new) |
| My Profile | `fb-profile.jsx` | `ProfilePage` (owner) | redesign (XP/levels, badges, activity timeline new) |
| User Profile | `fb-userprofile.jsx` | `ProfilePage` (non-owner) | **new** — needs social layer (follow/followers, public sharing) |
| Learn hub | `fb-articles.jsx` | `ArticlesPage` | redesign (paths, lesson progress, XP new). No article-detail was designed |

**Undesigned — ask before building**: compare-portfolios view; all modals / loading / error states; `/Article/:id` detail; Login/Register/PasswordReset; coaching pages; GamePortfolio; FAQ/Contact/About. Coaching is a large part of the current product but appears in the redesign only as a "5% coaching discount" pricing line.
