import { AreaChart, Caret } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { signedPct, signedUsd, usd } from '@/lib/format';
import { TIMEFRAMES, type Timeframe } from './types';

export function PortfolioHero({
  totalValue,
  delta,
  series,
  hasSeries,
  timeframe,
  onTimeframeChange,
}: {
  totalValue: number;
  delta: { change: number; pct: number; label: string };
  series: number[];
  hasSeries: boolean;
  timeframe: Timeframe;
  onTimeframeChange: (t: Timeframe) => void;
}) {
  const up = delta.change >= 0;

  return (
    <Card className="overflow-hidden p-[26px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[13.5px] font-semibold text-ink-2">Total portfolio value</div>
          <div className="mt-1 font-mono text-[46px] font-bold leading-none tracking-[-.03em] text-ink">
            {usd(totalValue)}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={cn(
                'flex items-center gap-1.5 font-mono text-[16px] font-semibold',
                up ? 'text-up' : 'text-down'
              )}
            >
              <Caret up={up} /> {signedUsd(delta.change)} ({signedPct(delta.pct)})
            </span>
            <span className="text-[14px] text-ink-3">{delta.label}</span>
          </div>
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
              disabled={!hasSeries}
              aria-pressed={t === timeframe}
              onClick={() => onTimeframeChange(t)}
              className={cn(
                'cursor-pointer rounded-[9px] border-0 px-[13px] py-1.5 font-mono text-[13px] font-semibold transition-colors',
                t === timeframe ? 'bg-violet text-white' : 'bg-transparent text-ink-3 hover:text-ink',
                !hasSeries && 'cursor-not-allowed opacity-40 hover:text-ink-3'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-1.5 mt-[18px] h-[250px]">
        {hasSeries ? (
          <AreaChart data={series} up={up} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-field border border-dashed border-line-2 px-6 text-center text-[13.5px] text-ink-3">
            No performance history yet — your portfolio value is recorded hourly once you start
            trading.
          </div>
        )}
      </div>
    </Card>
  );
}

export default PortfolioHero;
