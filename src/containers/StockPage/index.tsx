import { useCallback, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/api/client';
import UserContext from '@/context/user';
import {
  AreaChart,
  BrandFooter,
  Caret,
  Pill,
  Skeleton,
  SkeletonText,
  TopNav,
} from '@/components/brand';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signedPct, signedUsd, usd } from '@/lib/format';
import type { TradeResponse, TransactionType } from '@/containers/SimulatorPortfolioPage/types';
import OrderTicket from './OrderTicket';
import { explainerFor } from './explainers';
import { useStock } from './useStock';
import { TIMEFRAMES } from './types';

/** Compact volume: 241.6M / 3.4B. */
function compactVolume(n: number) {
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function serverMessage(e: unknown, fallback: string) {
  const msg = (e as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return typeof msg === 'string' && msg ? msg : fallback;
}

const StockPage = () => {
  const { symbol: raw } = useParams<{ symbol: string }>();
  const symbol = (raw ?? '').toUpperCase();
  const { user } = useContext(UserContext) ?? { user: null };
  const email: string | null = user?.email ?? null;

  const s = useStock(symbol, email);
  const explainer = explainerFor(symbol);

  const handleTrade = useCallback(
    async (input: {
      transactionType: TransactionType;
      quantity: number;
      price: number;
      index: string;
    }): Promise<string> => {
      if (!email || !s.enrollment) throw new Error('Join a simulator before trading.');
      try {
        const res = await api.post<TradeResponse>(
          `game/simulator/${s.enrollment.simulator._id}/${encodeURIComponent(email)}`,
          { ...input, symbol, transactionTime: Date.now() }
        );
        return res.data?.msg || 'Transaction complete!';
      } catch (e) {
        throw new Error(serverMessage(e, 'The order could not be placed.'));
      }
    },
    [email, s.enrollment, symbol]
  );

  const q = s.quote;
  const rangeLabel = s.timeframe === '1Y' ? '52-week range' : `${s.timeframe} range`;

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <TopNav
        active="Markets"
        user={email ?? 'Guest'}
        guest={!email}
        balance={
          s.positionLoading ? (
            <Skeleton className="h-3.5 w-16" />
          ) : s.enrollment ? (
            usd(s.buyingPower)
          ) : undefined
        }
      />

      <main className="p-6 md:p-[30px]">
        {/* BREADCRUMB */}
        <div className="mb-[18px] text-[13px] text-ink-3">
          <Link to="/Markets" className="text-violet no-underline">
            Markets
          </Link>{' '}
          <span className="opacity-50">/</span> {symbol}
        </div>

        {s.error && (
          <p className="mb-4 rounded-field border border-down/30 bg-down-soft px-4 py-3 text-[13.5px] font-medium text-down">
            {s.error}
          </p>
        )}

        {s.loading ? (
          <StockSkeleton explainer={explainer} />
        ) : !q ? (
          <p className="rounded-card border border-line bg-surface px-6 py-16 text-center text-[14px] text-ink-3">
            We couldn’t find market data for “{symbol}”.{' '}
            <Link to="/Markets" className="font-semibold text-violet">
              Back to Markets
            </Link>
          </p>
        ) : (
          <>
            {/* HEADER */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-[18px]">
                <div
                  className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl font-display text-[24px] font-bold text-white"
                  style={{ background: 'linear-gradient(140deg,#9B6BFF,#7C3AED)' }}
                  aria-hidden="true"
                >
                  {symbol.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="m-0 font-display text-[30px] font-bold tracking-[-.025em] text-ink">
                      {q.name || symbol}
                    </h1>
                    <span className="rounded-lg bg-surface-2 px-2.5 py-[3px] font-mono text-[14px] text-ink-3">
                      {q.symbol} · {q.exchange}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-baseline gap-3.5">
                    <span className="font-mono text-[34px] font-bold tracking-[-.02em] text-ink">
                      {usd(q.close)}
                    </span>
                    <span
                      className={cn(
                        'flex items-center gap-1.5 font-mono text-[16px] font-semibold',
                        s.up ? 'text-up' : 'text-down'
                      )}
                    >
                      <Caret up={s.up} /> {signedUsd(q.change)} ({signedPct(q.percentChange)})
                    </span>
                    <span className="text-[13px] text-ink-3">today</span>
                  </div>
                </div>
              </div>

              {email &&
                (s.watchLoading ? (
                  // The star is a real assertion about the user's watchlist, so
                  // hold a button-sized placeholder rather than guessing "☆".
                  <Skeleton className="h-[42px] w-[116px] rounded-btn" />
                ) : (
                  <Button variant="ghost" onClick={s.toggleWatch} aria-pressed={s.watching}>
                    {s.watching ? '★ Watching' : '☆ Watch'}
                  </Button>
                ))}
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
              {/* LEFT */}
              <div className="flex min-w-0 flex-col gap-6">
                {/* CHART */}
                <Card className="overflow-hidden p-6">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-[18px]">
                      {[
                        ['Open', usd(q.open)],
                        ['High', usd(q.high)],
                        ['Low', usd(q.low)],
                        ['Vol', compactVolume(q.volume)],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div className="text-[11.5px] font-semibold uppercase tracking-[.04em] text-ink-3">
                            {k}
                          </div>
                          <div className="mt-0.5 font-mono text-[14px] font-semibold text-ink">
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      className="flex shrink-0 gap-0.5 rounded-field border border-line bg-surface-2 p-[3px]"
                      role="group"
                      aria-label="Chart timeframe"
                    >
                      {TIMEFRAMES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          aria-pressed={t === s.timeframe}
                          onClick={() => s.setTimeframe(t)}
                          className={cn(
                            'cursor-pointer rounded-[9px] border-0 px-[13px] py-1.5 font-mono text-[13px] font-semibold transition-colors',
                            t === s.timeframe
                              ? 'bg-violet text-white'
                              : 'bg-transparent text-ink-3 hover:text-ink'
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="-mx-1.5 mt-3 h-[300px]">
                    {s.chartLoading ? (
                      <div className="h-full animate-pulse rounded-field bg-surface-2" />
                    ) : s.series.length >= 2 ? (
                      <AreaChart data={s.series} up={s.up} h={300} />
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-field border border-dashed border-line-2 text-[13.5px] text-ink-3">
                        No price history available for this range.
                      </div>
                    )}
                  </div>
                </Card>

                <ExplainerCard explainer={explainer} />

                {/* KEY STATISTICS */}
                <Card className="px-6 pb-2 pt-5">
                  <h2 className="m-0 mb-2 font-display text-[18px] font-bold text-ink">
                    Key statistics
                  </h2>
                  <div className="grid gap-x-10 sm:grid-cols-2">
                    <div>
                      <Stat
                        k="52-week range"
                        v={
                          q.fiftyTwoWeek
                            ? `${usd(q.fiftyTwoWeek.low)} – ${usd(q.fiftyTwoWeek.high)}`
                            : '—'
                        }
                      />
                      <Stat k="Previous close" v={usd(q.previousClose)} />
                      <Stat k="Day range" v={`${usd(q.low)} – ${usd(q.high)}`} />
                    </div>
                    <div>
                      <Stat k="Average volume" v={compactVolume(q.averageVolume)} />
                      <Stat k="Volume today" v={compactVolume(q.volume)} />
                      <Stat
                        k={rangeLabel}
                        v={
                          s.periodRange
                            ? `${usd(s.periodRange.low)} – ${usd(s.periodRange.high)}`
                            : '—'
                        }
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col gap-6">
                <OrderTicket
                  symbol={symbol}
                  price={s.price}
                  exchange={q.exchange}
                  buyingPower={s.buyingPower}
                  heldQuantity={s.holding?.quantity ?? 0}
                  disabled={!email || !s.enrollment}
                  disabledReason={
                    !email ? 'Log in to place a paper trade.' : 'Join a simulator to start trading.'
                  }
                  loading={s.positionLoading}
                  onTrade={handleTrade}
                />

                {email && s.positionLoading && <PositionSkeleton />}

                {!s.positionLoading && s.holding && (
                  <Card className="p-[22px]">
                    <h2 className="m-0 mb-3.5 font-display text-[17px] font-bold text-ink">
                      Your position
                    </h2>
                    <div className="mb-3 flex justify-between">
                      <div>
                        <div className="text-[12.5px] text-ink-3">Shares</div>
                        <div className="mt-0.5 font-mono text-[18px] font-bold text-ink">
                          {s.holding.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12.5px] text-ink-3">Market value</div>
                        <div className="mt-0.5 font-mono text-[18px] font-bold text-ink">
                          {s.positionValue == null ? '—' : usd(s.positionValue)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-line pt-3">
                      <span className="text-[13.5px] text-ink-2">Total return</span>
                      {s.positionReturn ? (
                        <Pill tone={s.positionReturn.amount >= 0 ? 'up' : 'dn'}>
                          <Caret up={s.positionReturn.amount >= 0} size={9} />{' '}
                          {signedUsd(s.positionReturn.amount)} ({signedPct(s.positionReturn.pct)})
                        </Pill>
                      ) : (
                        <span className="font-mono text-[13.5px] text-ink-3">—</span>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <BrandFooter />
    </div>
  );
};

/**
 * "The simple version" — hand-authored copy for a subset of symbols. It is a
 * local lookup keyed on the URL, so it is known before any request finishes and
 * renders for real during loading rather than as a placeholder.
 */
function ExplainerCard({ explainer }: { explainer: ReturnType<typeof explainerFor> }) {
  if (!explainer) return null;
  return (
    <Card className="p-6">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="text-[18px]" aria-hidden="true">
          🍓
        </span>
        <h2 className="m-0 font-display text-[18px] font-bold text-ink">The simple version</h2>
      </div>
      <p className="m-0 mb-3.5 text-[15px] leading-[1.6] text-ink-2">
        {explainer.emphasis ? (
          <>
            {explainer.body.split(explainer.emphasis)[0]}
            <b className="text-ink">{explainer.emphasis}</b>
            {explainer.body.split(explainer.emphasis)[1]}
          </>
        ) : (
          explainer.body
        )}
      </p>
      <div className="flex flex-wrap gap-2.5">
        {explainer.tags.map((t) => (
          <span
            key={t}
            className="rounded-pill border border-line bg-surface-2 px-3 py-1.5 text-[13px] text-ink-2"
          >
            {t}
          </span>
        ))}
      </div>
    </Card>
  );
}

/**
 * Stand-in for the quote header and the cards below it, laid out on the same
 * grid so the real page drops into the space this was holding.
 */
function StockSkeleton({ explainer }: { explainer: ReturnType<typeof explainerFor> }) {
  return (
    <div aria-busy="true">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-[18px]">
          <Skeleton className="h-[60px] w-[60px] shrink-0 rounded-2xl" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-[30px] w-56 max-w-full rounded-md" />
              <Skeleton className="h-[26px] w-32 rounded-lg" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3.5">
              <Skeleton className="h-[34px] w-40 rounded-md" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
        <Skeleton className="h-[42px] w-[116px] rounded-btn" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* CHART CARD — OHLCV strip, timeframe switcher, 300px well */}
          <Card className="overflow-hidden p-6">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-[18px]">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i}>
                    <SkeletonText text="text-[11.5px]" bar="h-3 w-9" />
                    <SkeletonText text="text-[14px]" bar="h-3.5 w-14" className="mt-0.5" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-[34px] w-[232px] shrink-0 rounded-field" />
            </div>
            <div className="-mx-1.5 mt-3 h-[300px]">
              <Skeleton className="h-full rounded-field" />
            </div>
          </Card>

          <ExplainerCard explainer={explainer} />

          {/* KEY STATISTICS */}
          <Card className="px-6 pb-2 pt-5">
            <SkeletonText text="text-[18px]" bar="h-4 w-32" className="mb-2" />
            <div className="grid gap-x-10 sm:grid-cols-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-line py-3"
                >
                  <SkeletonText text="text-[13.5px]" bar="h-3.5 w-28" />
                  <SkeletonText text="text-[14px]" bar="h-3.5 w-16" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ORDER TICKET — same stack of controls, same margins. */}
        <Card className="p-6">
          <Skeleton className="mb-5 h-[44.5px] rounded-field" />
          <SkeletonText text="text-[12.5px]" bar="h-3 w-20" />
          <Skeleton className="mb-[18px] mt-2 h-[38px] rounded-[10px]" />
          <SkeletonText text="text-[12.5px]" bar="h-3 w-14" />
          <Skeleton className="mb-2 mt-2 h-[53px] rounded-field" />
          <Skeleton className="mb-5 h-[26.5px] rounded-lg" />
          <Skeleton className="mb-[18px] h-[141px] rounded-[14px]" />
          <Skeleton className="h-12 rounded-btn" />
          <SkeletonText text="text-[12.5px]" bar="h-3 w-40" className="mt-3" />
        </Card>
      </div>
    </div>
  );
}

/** Sidebar "Your position" card, held while the holding lookup resolves. */
function PositionSkeleton() {
  return (
    <Card className="p-[22px]" aria-busy="true">
      <Skeleton className="mb-3.5 h-[17px] w-28" />
      <div className="mb-3 flex justify-between">
        <div>
          <SkeletonText text="text-[12.5px]" bar="h-3 w-12" />
          <SkeletonText text="text-[18px]" bar="h-[18px] w-10" className="mt-0.5" />
        </div>
        <div className="flex flex-col items-end">
          <SkeletonText text="text-[12.5px]" bar="h-3 w-20" />
          <SkeletonText text="text-[18px]" bar="h-[18px] w-20" className="mt-0.5" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line pt-3">
        <SkeletonText text="text-[13.5px]" bar="h-3.5 w-20" />
        <Skeleton className="h-[22px] w-32 rounded-pill" />
      </div>
    </Card>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-3">
      <span className="text-[13.5px] text-ink-2">{k}</span>
      <span className="font-mono text-[14px] font-semibold text-ink">{v}</span>
    </div>
  );
}

export default StockPage;
