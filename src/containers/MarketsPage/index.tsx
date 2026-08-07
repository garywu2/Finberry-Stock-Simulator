import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/api/client';
import UserContext from '@/context/user';
import { BrandFooter, Caret, Pill, Skeleton, SkeletonText, TopNav } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { signedPct, usd } from '@/lib/format';
import type { MarketMover, StockListItem } from '@/containers/SimulatorPortfolioPage/types';
import type { WatchlistEntry } from '../StockPage/types';

// NOTE: no Markets index was ever designed — the handoff only covers the stock
// detail screen, but TopNav links /Markets. This is a deliberately simple
// directory (search + your watchlist + movers) built from existing primitives;
// flag it for a design pass.
const MarketsPage = () => {
  const { user } = useContext(UserContext) ?? { user: null };
  const email: string | null = user?.email ?? null;

  const [stocks, setStocks] = useState<StockListItem[]>([]);
  const [movers, setMovers] = useState<MarketMover[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [query, setQuery] = useState('');
  // Without these, both lists render their "nothing here" copy on every load,
  // which reads as a real empty result rather than a pending one.
  const [moversLoading, setMoversLoading] = useState(true);
  const [watchLoading, setWatchLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<StockListItem[]>('stock/stocks')
      .then((res) => {
        if (!cancelled) setStocks(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        /* Search degrades to exact tickers. */
      });
    api
      .get<MarketMover[]>('game/marketmovers')
      .then((res) => {
        if (!cancelled) setMovers(Array.isArray(res.data) ? res.data.slice(0, 8) : []);
      })
      .catch(() => {
        /* Movers are decorative here. */
      })
      .finally(() => {
        if (!cancelled) setMoversLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!email) {
      // Logged out: the card shows a prompt to log in, not a pending state.
      setWatchLoading(false);
      return;
    }
    let cancelled = false;
    setWatchLoading(true);
    api
      .get<WatchlistEntry[]>('account/watchlist', { params: { email } })
      .then((res) => {
        if (!cancelled) setWatchlist(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        /* Watchlist is optional. */
      })
      .finally(() => {
        if (!cancelled) setWatchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  const results = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return [];
    return stocks
      .filter((s) => s.symbol.startsWith(q) || s.name?.toUpperCase().includes(q))
      .slice(0, 12);
  }, [query, stocks]);

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <TopNav active="Markets" user={email ?? 'Guest'} guest={!email} />

      <main className="p-6 md:p-[30px]">
        <div className="mb-6">
          <div className="text-[13px] font-semibold uppercase tracking-[.04em] text-ink-3">
            Markets
          </div>
          <h1 className="m-0 mt-1.5 font-display text-[34px] font-bold tracking-[-.025em] text-ink">
            Find a stock
          </h1>
        </div>

        {/* SEARCH */}
        <Card className="mb-6 p-6">
          <label htmlFor="mk-search" className="text-[12.5px] font-semibold text-ink-3">
            Search by ticker or company
          </label>
          <input
            id="mk-search"
            autoComplete="off"
            placeholder="e.g. NVDA or Apple"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2 w-full rounded-field border border-line-2 bg-surface-2 px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-violet"
          />

          {query.trim() && (
            <div className="mt-3">
              {!results.length ? (
                <p className="py-3 text-[13.5px] text-ink-3">No matching symbols.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {results.map((r) => (
                    <li key={r.symbol}>
                      <Link
                        to={`/stock/${r.symbol}`}
                        className="flex items-baseline gap-3 rounded-[10px] px-3 py-2 no-underline hover:bg-surface-2"
                      >
                        <span className="font-mono text-[14.5px] font-semibold text-ink">
                          {r.symbol}
                        </span>
                        <span className="truncate text-[13px] text-ink-3">{r.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          {/* MOVERS */}
          <Card className="overflow-hidden p-0" aria-busy={moversLoading}>
            <h2 className="m-0 px-6 pb-3 pt-5 font-display text-[18px] font-bold text-ink">
              Market movers
            </h2>
            {moversLoading ? (
              <MoverSkeletonRows />
            ) : !movers.length ? (
              <p className="px-6 pb-6 text-[13.5px] text-ink-3">
                Market movers aren’t available right now.
              </p>
            ) : (
              // The feed can repeat a symbol, so rows are keyed by index.
              movers.map((m, i) => {
                const change = Number(m.percent_change) || 0;
                const up = change >= 0;
                return (
                  <Link
                    key={`${m.symbol}-${i}`}
                    to={`/stock/${m.symbol}`}
                    className="flex items-center justify-between gap-4 border-t border-line px-6 py-3 no-underline hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-[14.5px] font-semibold text-ink">
                        {m.symbol}
                      </div>
                      <div className="truncate text-[12.5px] text-ink-3">{m.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[14px] font-semibold text-ink">
                        {usd(Number(m.last ?? m.high) || 0)}
                      </span>
                      <Pill tone={up ? 'up' : 'dn'}>
                        <Caret up={up} size={9} /> {signedPct(change)}
                      </Pill>
                    </div>
                  </Link>
                );
              })
            )}
          </Card>

          {/* WATCHLIST */}
          <Card className="overflow-hidden p-0" aria-busy={watchLoading}>
            <h2 className="m-0 px-6 pb-3 pt-5 font-display text-[18px] font-bold text-ink">
              Your watchlist
            </h2>
            {!email ? (
              <p className="px-6 pb-6 text-[13.5px] text-ink-3">Log in to build a watchlist.</p>
            ) : watchLoading ? (
              <WatchSkeletonRows />
            ) : !watchlist.length ? (
              <p className="px-6 pb-6 text-[13.5px] text-ink-3">
                Nothing watched yet — open any stock and hit ☆ Watch.
              </p>
            ) : (
              watchlist.map((w) => (
                <Link
                  key={w._id}
                  to={`/stock/${w.symbol}`}
                  className={cn(
                    'flex items-center justify-between border-t border-line px-6 py-3 no-underline hover:bg-surface-2'
                  )}
                >
                  <span className="font-mono text-[14.5px] font-semibold text-ink">{w.symbol}</span>
                  <span className="text-[12.5px] text-ink-3">{w.index}</span>
                </Link>
              ))
            )}
          </Card>
        </div>
      </main>

      <BrandFooter />
    </div>
  );
};

/** Eight rows, matching the `slice(0, 8)` the movers feed is capped at. */
function MoverSkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-t border-line px-6 py-3"
        >
          <div className="min-w-0">
            <SkeletonText text="text-[14.5px]" bar="h-3.5 w-14" />
            <SkeletonText text="text-[12.5px]" bar="h-3 w-36" />
          </div>
          <div className="flex items-center gap-4">
            <SkeletonText text="text-[14px]" bar="h-3.5 w-16" />
            <Skeleton className="h-[22px] w-[72px] rounded-pill" />
          </div>
        </div>
      ))}
    </>
  );
}

function WatchSkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between border-t border-line px-6 py-3">
          <SkeletonText text="text-[14.5px]" bar="h-3.5 w-14" />
          <SkeletonText text="text-[12.5px]" bar="h-3 w-20" />
        </div>
      ))}
    </>
  );
}

export default MarketsPage;
