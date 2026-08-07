import { LoadedAnnouncement, Skeleton, SkeletonText, Sparkline } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { signedPct, usd } from '@/lib/format';
import type { WatchRow } from './types';

/** The feed is capped at four symbols, so the skeleton shows four rows. */
const ROWS = [0, 1, 2, 3];

export function Watchlist({ rows, loading }: { rows: WatchRow[]; loading: boolean }) {
  const busy = loading && !rows.length;

  return (
    <Card className="px-0 pb-2 pt-5" aria-busy={busy}>
      <h2 className="mx-[22px] mb-3 mt-0 font-display text-[18px] font-bold text-ink">Watchlist</h2>

      {busy ? (
        ROWS.map((i) => (
          <div key={i} className="flex items-center justify-between px-[22px] py-2.5">
            <div className="min-w-0">
              <SkeletonText text="text-[14px]" bar="h-3.5 w-12" />
              <SkeletonText text="text-[12px]" bar="h-2.5 w-20" />
            </div>
            <Skeleton className="h-2.5 w-[60px]" />
            <div className="flex min-w-[88px] flex-col items-end">
              <SkeletonText text="text-[14px]" bar="h-3.5 w-16" />
              <SkeletonText text="text-[12.5px]" bar="h-3 w-11" />
            </div>
          </div>
        ))
      ) : !rows.length ? (
        <p className="px-[22px] pb-2 text-[13px] text-ink-3">
          Market movers aren’t available right now.
        </p>
      ) : (
        <>
          {/* The marketmovers feed can repeat a symbol, so rows are keyed by index. */}
          {rows.map((w, i) => (
            <div
              key={`${w.symbol}-${i}`}
              className="flex items-center justify-between px-[22px] py-2.5"
            >
              <div className="min-w-0">
                <div className="font-mono text-[14px] font-semibold text-ink">{w.symbol}</div>
                <div className="truncate text-[12px] text-ink-3">{w.name}</div>
              </div>

              <Sparkline data={w.series} up={w.up} w={60} h={24} loading={loading} />

              <div className="min-w-[88px] text-right">
                <div className="font-mono text-[14px] font-semibold text-ink">{usd(w.price)}</div>
                <div
                  className={cn(
                    'font-mono text-[12.5px] font-semibold',
                    w.up ? 'text-up' : 'text-down'
                  )}
                >
                  {signedPct(w.change, 1)}
                </div>
              </div>
            </div>
          ))}
          {!loading && <LoadedAnnouncement message={`Watchlist loaded, ${rows.length} symbols`} />}
        </>
      )}
    </Card>
  );
}

export default Watchlist;
