import { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '@/api/client';
import UserContext from '@/context/user';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AreaChart, BrandFooter, Caret, Pill, Sparkline, TopNav } from '@/components/brand';

// Berry Bright marketing landing. Ported from design_handoff fb-landing.jsx.
// Logged-in users are redirected to their profile (unchanged behaviour).

// Seeded random walk for the decorative preview/sparklines (marketing mock, not
// real portfolio data).
function demoSeries(seed: number, n = 60, trend = 0.4): number[] {
  let x = seed % 233280;
  const rnd = () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
  const out: number[] = [];
  let v = 100;
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.5 + trend * 0.04) * 4;
    out.push(v);
  }
  return out;
}

type Mover = { symbol: string; price: number; change: number; up: boolean; seed: number };

// Placeholder movers shown until (or unless) the server returns real data.
const PLACEHOLDER_MOVERS: Mover[] = [
  { symbol: 'NVDA', price: 141.8, change: 3.41, up: true, seed: 41 },
  { symbol: 'AAPL', price: 213.55, change: 1.62, up: true, seed: 12 },
  { symbol: 'TSLA', price: 224.6, change: -2.18, up: false, seed: 7 },
  { symbol: 'SHOP', price: 78.9, change: 0.74, up: true, seed: 23 },
  { symbol: 'AMD', price: 162.7, change: -1.4, up: false, seed: 55 },
  { symbol: 'MSFT', price: 441.2, change: 0.83, up: true, seed: 18 },
  { symbol: 'DIS', price: 96.2, change: -0.92, up: false, seed: 90 },
  { symbol: 'ABNB', price: 138.9, change: 2.1, up: true, seed: 71 },
];

const PREVIEW_ROWS = [
  { symbol: 'NVDA', price: 141.8, change: 3.41, up: true, seed: 41 },
  { symbol: 'AAPL', price: 213.55, change: 1.62, up: true, seed: 12 },
  { symbol: 'TSLA', price: 224.6, change: -2.18, up: false, seed: 7 },
];

const HERO_STATS: [string, string][] = [
  ['250k+', 'learners'],
  ['$0', 'real money at risk'],
  ['4.8★', 'app rating'],
];

const FEATURES = [
  {
    icon: '📈',
    grad: 'linear-gradient(140deg,#8B5CF6,#4C1D95)',
    title: 'Trade with paper money',
    body: 'Buy and sell real stocks at live prices using $100k in practice cash. Make mistakes here, not with your savings.',
  },
  {
    icon: '🎓',
    grad: 'linear-gradient(140deg,#2BE08C,#0E6B45)',
    title: 'Learn as you go',
    body: 'Bite-sized lessons explain every term in plain language — earn XP and badges as concepts click into place.',
  },
  {
    icon: '🏆',
    grad: 'linear-gradient(140deg,#FFC65C,#B45309)',
    title: 'Compete & climb',
    body: 'Join seasonal leagues, track your rank against friends, and turn investing into a game you actually want to win.',
  },
];

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    sub: 'Learn the ropes',
    feats: ['Simulated trading', 'Market data', 'Basic badges & streaks', 'Community leaderboards'],
    cta: 'Start free',
    to: '/Register',
    primary: false,
  },
  {
    name: 'Plus',
    price: '$4.99',
    sub: 'Most popular',
    feats: [
      'Everything in Free',
      'Exclusive games & badges',
      'Advanced analytics',
      'Ad-free experience',
    ],
    cta: 'Go Plus',
    to: '/BuyPremium',
    primary: true,
  },
  {
    name: 'Teams',
    price: '$50',
    sub: 'For classrooms & clubs',
    feats: [
      'Everything in Plus',
      'Up to 40 seats',
      'Cohort leaderboards',
      'Educator dashboard',
      'Priority support',
    ],
    cta: 'Contact us',
    to: '/Contact',
    primary: false,
  },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="8" cy="8" r="8" fill="rgba(43,224,140,.18)" />
      <path
        d="M4.5 8l2.2 2.2L11.5 5.5"
        stroke="#2BE08C"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const HomePage = () => {
  const { user } = useContext(UserContext) ?? { user: null };
  const [movers, setMovers] = useState<Mover[]>(PLACEHOLDER_MOVERS);

  useEffect(() => {
    if (user) return;
    api
      .get('game/marketmovers')
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        if (!rows.length) return;
        setMovers(
          rows.slice(0, 8).map((s: any, i: number) => {
            const change = Number(s.percent_change) || 0;
            return {
              symbol: s.symbol,
              price: Number(s.last ?? s.high) || 0,
              change,
              up: change >= 0,
              seed: i * 11 + 7,
            };
          })
        );
      })
      .catch(() => {
        // Keep the placeholder movers when the server is unreachable.
      });
  }, [user]);

  if (user) {
    return <Navigate to={'/Profile/' + user.email} />;
  }

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <TopNav guest />

      {/* HERO */}
      <section className="relative grid items-center gap-14 overflow-hidden px-6 py-16 md:px-[60px] md:py-[76px] lg:grid-cols-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-32 h-[520px] w-[520px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,.25), transparent 65%)' }}
        />
        <div className="relative">
          <Pill tone="violet" className="mb-5">
            🍇 Risk-free investing practice
          </Pill>
          <h1 className="font-display text-[44px] font-extrabold leading-[1.02] tracking-[-.03em] md:text-[60px]">
            Make investing
            <br />
            <span className="bg-[linear-gradient(100deg,#A989FF,#2BE08C)] bg-clip-text text-transparent">
              actually make sense.
            </span>
          </h1>
          <p className="my-[26px] max-w-[460px] text-[18px] leading-[1.55] text-ink-2">
            Finberry gives you $100,000 in paper money to learn how markets really work — with
            bite-sized lessons, real data, and zero risk to your wallet.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/Register"
              className={cn(buttonVariants(), 'px-[26px] py-[14px] text-[16px] no-underline')}
            >
              Get started — it&rsquo;s free
            </Link>
            <span className="text-[14px] text-ink-3">No card required</span>
          </div>
          <div className="mt-10 flex gap-8">
            {HERO_STATS.map(([value, label]) => (
              <div key={label}>
                <div className="font-display text-[26px] font-extrabold">{value}</div>
                <div className="text-[13px] text-ink-3">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating product preview */}
        <div className="relative">
          <Card
            className="p-[22px]"
            style={{
              boxShadow:
                '0 30px 70px -28px rgba(76,29,149,.35), 0 0 0 1px var(--tw-shadow-color, #DCD3EC)',
              transform: 'rotate(1.2deg)',
            }}
          >
            <div className="mb-3.5 flex items-center justify-between">
              <div>
                <div className="text-[12.5px] text-ink-2">Your practice portfolio</div>
                <div className="mt-0.5 font-mono text-[30px] font-bold">$112,480.55</div>
              </div>
              <Pill tone="up">
                <Caret up size={9} /> +24.97%
              </Pill>
            </div>
            <div className="-mx-1.5 h-[150px]">
              <AreaChart data={demoSeries(31, 90, 0.62)} up grid={false} w={560} h={150} />
            </div>
            <div className="mt-3.5 flex flex-col gap-0.5">
              {PREVIEW_ROWS.map((r) => (
                <div
                  key={r.symbol}
                  className="flex items-center justify-between rounded-[10px] bg-surface-2 px-2.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-surface-3 font-display text-[11px] font-bold text-violet">
                      {r.symbol.slice(0, 2)}
                    </div>
                    <div className="font-mono text-[13px] font-semibold">{r.symbol}</div>
                  </div>
                  <Sparkline
                    data={demoSeries(r.seed, 30, r.up ? 0.6 : -0.6)}
                    up={r.up}
                    w={54}
                    h={20}
                  />
                  <div className="text-right">
                    <div className="font-mono text-[13px] font-semibold">${r.price}</div>
                    <div
                      className={cn(
                        'font-mono text-[11.5px] font-semibold',
                        r.up ? 'text-up' : 'text-down'
                      )}
                    >
                      {r.up ? '+' : ''}
                      {r.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* MOVERS TICKER */}
      <div className="border-y border-line bg-bg-2 py-4">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-2 px-6 md:flex-nowrap md:overflow-x-auto md:px-[60px]">
          <span className="shrink-0 text-[11.5px] font-bold uppercase tracking-[.08em] text-ink-3">
            Market movers
          </span>
          {movers.map((m, i) => (
            <div key={`${m.symbol}-${i}`} className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-[14px] font-semibold">{m.symbol}</span>
              <span className="font-mono text-[13.5px] text-ink-2">${m.price}</span>
              <span
                className={cn(
                  'font-mono text-[12.5px] font-semibold',
                  m.up ? 'text-up' : 'text-down'
                )}
              >
                {m.up ? '+' : ''}
                {m.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="px-6 py-[72px] md:px-[60px]">
        <div className="mb-12 text-center">
          <Pill tone="violet" className="mb-3.5">
            How it works
          </Pill>
          <h2 className="font-display text-[32px] font-extrabold tracking-[-.02em] md:text-[40px]">
            Everything you need to start, in one place
          </h2>
        </div>
        <div className="grid gap-[22px] md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-7">
              <div
                className="mb-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-[14px] text-[24px]"
                style={{ background: f.grad }}
              >
                {f.icon}
              </div>
              <h3 className="mb-2 font-display text-[21px] font-bold">{f.title}</h3>
              <p className="text-[14.5px] leading-[1.55] text-ink-2">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 pb-20 pt-10 md:px-[60px]">
        <div className="mb-11 text-center">
          <h2 className="mb-2.5 font-display text-[32px] font-extrabold tracking-[-.02em] md:text-[40px]">
            Start free. Upgrade if you love it.
          </h2>
          <p className="text-[17px] text-ink-2">
            The core simulator is free forever. Plans just add the fun extras.
          </p>
        </div>
        <div className="grid items-start gap-[22px] md:grid-cols-3">
          {TIERS.map((t) => (
            <Card
              key={t.name}
              className={cn('relative p-[30px]', t.primary && 'border-violet')}
              style={
                t.primary
                  ? {
                      background: 'linear-gradient(180deg, rgba(139,92,246,.12), #FFFFFF)',
                      boxShadow: '0 24px 60px -28px rgba(139,92,246,.6)',
                    }
                  : undefined
              }
            >
              {t.primary && (
                <div className="absolute -top-3 left-[30px]">
                  <Pill tone="violet" className="bg-violet text-white">
                    ★ Most popular
                  </Pill>
                </div>
              )}
              <div className="font-display text-[22px] font-bold">{t.name}</div>
              <div className="mt-0.5 text-[13.5px] text-ink-3">{t.sub}</div>
              <div className="my-[18px] flex items-baseline gap-1.5">
                <span className="font-mono text-[40px] font-extrabold">{t.price}</span>
                <span className="text-[15px] text-ink-3">/mo</span>
              </div>
              <Link
                to={t.to}
                className={cn(
                  buttonVariants({ variant: t.primary ? 'primary' : 'ghost', size: 'block' }),
                  'no-underline'
                )}
              >
                {t.cta}
              </Link>
              <div className="mt-[22px] flex flex-col gap-3">
                {t.feats.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[14px] text-ink-2">
                    <CheckIcon />
                    {f}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-[72px] md:px-[60px]">
        <Card
          className="relative overflow-hidden border-line-2 px-6 py-14 text-center md:px-12"
          style={{
            background:
              'radial-gradient(120% 180% at 50% 0%, rgba(139,92,246,.3), transparent 60%), linear-gradient(180deg, rgba(43,224,140,.06), transparent)',
          }}
        >
          <h2 className="mb-3.5 font-display text-[34px] font-extrabold tracking-[-.02em] md:text-[44px]">
            Your first trade is on us.
          </h2>
          <p className="mx-auto mb-7 max-w-[520px] text-[18px] text-ink-2">
            Join 250,000 people learning to invest the sweet way — sign up in 30 seconds.
          </p>
          <Link
            to="/Register"
            className={cn(buttonVariants(), 'px-8 py-[15px] text-[16.5px] no-underline')}
          >
            Create your free account
          </Link>
        </Card>
      </section>

      <BrandFooter />
    </div>
  );
};

export default HomePage;
