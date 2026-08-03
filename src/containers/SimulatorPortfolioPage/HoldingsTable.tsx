import { Link } from 'react-router-dom';
import { Sparkline } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { signedPct, usd, usdWhole } from '@/lib/format';
import type { HoldingRow } from './types';

const COLS = 'grid-cols-[1.7fr_.9fr_.9fr_88px_1fr_1fr]';

export function HoldingsTable({
  rows,
  loading,
  nameFor,
}: {
  rows: HoldingRow[];
  loading: boolean;
  /** Company name for a ticker, from the stock list; falls back to the exchange. */
  nameFor: (symbol: string) => string | undefined;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between px-6 pb-4 pt-5">
        <h2 className="m-0 font-display text-[19px] font-bold text-ink">Your holdings</h2>
        <Link
          to="/GamePortfolio"
          className="text-[13.5px] font-semibold text-violet no-underline hover:brightness-110"
        >
          View all activity →
        </Link>
      </div>

      <div
        className={cn(
          'grid gap-2 px-6 pb-2.5 text-[11.5px] font-bold uppercase tracking-[.05em] text-ink-3',
          COLS
        )}
      >
        <span>Symbol</span>
        <span className="text-right">Shares</span>
        <span className="text-right">Mkt price</span>
        <span className="text-center">30D</span>
        <span className="text-right">Value</span>
        <span className="text-right">Today</span>
      </div>

      {loading && !rows.length ? (
        <SkeletonRows />
      ) : !rows.length ? (
        <p className="border-t border-line px-6 py-8 text-center text-[13.5px] text-ink-3">
          You don’t hold any positions yet. Use Quick trade to place your first order.
        </p>
      ) : (
        rows.map((h) => <Row key={h._id} h={h} name={nameFor(h.symbol)} />)
      )}
    </Card>
  );
}

function Row({ h, name }: { h: HoldingRow; name?: string }) {
  const dayUp = (h.dayPct ?? 0) >= 0;
  const priceKnown = Number.isFinite(h.price);

  return (
    <div className={cn('grid items-center gap-2 border-t border-line px-6 py-[13px]', COLS)}>
      <div className="flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-surface-3 font-display text-[13px] font-bold text-violet">
          {h.symbol.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[14.5px] font-semibold text-ink">{h.symbol}</div>
          <div className="truncate text-[12.5px] text-ink-3">{name ?? h.index}</div>
        </div>
      </div>

      <span className="text-right font-mono text-[14px] text-ink">{h.quantity}</span>

      <span className="text-right font-mono text-[14px] text-ink">
        {priceKnown ? usd(h.price) : '—'}
      </span>

      <div className="flex justify-center">
        <Sparkline data={h.series} up={h.trendUp} />
      </div>

      <span className="text-right font-mono text-[14px] font-semibold text-ink">
        {priceKnown || h.value ? usdWhole(h.value) : '—'}
      </span>

      <div className="text-right">
        {h.dayPct === null ? (
          <span className="font-mono text-[13.5px] text-ink-3">—</span>
        ) : (
          <span
            title={
              h.returnPct === null ? undefined : `${signedPct(h.returnPct)} since you bought in`
            }
            className={cn('font-mono text-[13.5px] font-semibold', dayUp ? 'text-up' : 'text-down')}
          >
            {signedPct(h.dayPct)}
          </span>
        )}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn('grid items-center gap-2 border-t border-line px-6 py-[13px]', COLS)}
        >
          <div className="flex items-center gap-3">
            <div className="h-[38px] w-[38px] animate-pulse rounded-[10px] bg-surface-3" />
            <div className="h-3 w-20 animate-pulse rounded bg-surface-3" />
          </div>
          {[0, 1, 2, 3, 4].map((c) => (
            <div key={c} className="h-3 animate-pulse rounded bg-surface-3" />
          ))}
        </div>
      ))}
    </>
  );
}

export default HoldingsTable;
