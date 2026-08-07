import { Skeleton } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { signedPct } from '@/lib/format';

function Stat({
  label,
  value,
  tone,
  hint,
  loading,
}: {
  label: string;
  value: string;
  tone?: 'up' | 'down' | 'gold';
  hint?: string;
  /** This particular figure isn't known yet — an em dash would read as "none". */
  loading?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 px-1" title={loading ? undefined : hint} aria-busy={loading}>
      <div className="text-[12px] font-semibold uppercase tracking-[.05em] text-ink-3">{label}</div>
      {loading ? (
        <Skeleton className="mt-1.5 h-[24px] w-20 rounded-md" />
      ) : (
        <div
          className={cn(
            'mt-1.5 font-mono text-[24px] font-bold',
            tone === 'up' && 'text-up',
            tone === 'down' && 'text-down',
            tone === 'gold' && 'text-gold',
            !tone && 'text-ink'
          )}
        >
          {value}
        </div>
      )}
    </div>
  );
}

export function StatStrip({
  allTimeReturn,
  winRate,
  bestTrade,
  rank,
  field,
  approximate,
  loading,
}: {
  allTimeReturn: number | null;
  winRate: number | null;
  bestTrade: number | null;
  rank: number | null;
  field: number | null;
  /** True when realized stats were reconstructed from partial trade history. */
  approximate: boolean;
  /**
   * Trade history hasn't landed. Only the three figures derived from it are
   * pending — the global rank comes from the leaderboard fetch and is already
   * known, so it is never skeletoned.
   */
  loading: boolean;
}) {
  const note = approximate
    ? 'Reconstructed from your recorded trade history; trades made before records began are excluded.'
    : 'Reconstructed from your trade history.';

  return (
    <Card className="flex divide-x divide-line p-6">
      <Stat
        label="All-time return"
        value={allTimeReturn === null ? '—' : signedPct(allTimeReturn)}
        tone={allTimeReturn === null ? undefined : allTimeReturn >= 0 ? 'up' : 'down'}
      />
      <Stat
        label="Win rate"
        value={winRate === null ? '—' : `${Math.round(winRate)}%`}
        hint={winRate === null ? 'No closed trades yet.' : note}
        loading={loading}
      />
      <Stat
        label="Best trade"
        value={bestTrade === null ? '—' : signedPct(bestTrade, 1)}
        tone={bestTrade === null ? undefined : bestTrade >= 0 ? 'up' : 'down'}
        hint={bestTrade === null ? 'No closed trades yet.' : note}
        loading={loading}
      />
      <Stat
        label="Global rank"
        value={rank === null ? '—' : `#${rank}`}
        tone={rank === null ? undefined : 'gold'}
        hint={rank !== null && field ? `Out of ${field} ranked investors.` : undefined}
      />
    </Card>
  );
}

export default StatStrip;
