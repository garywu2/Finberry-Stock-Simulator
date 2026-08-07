import { Link } from 'react-router-dom';
import { Avatar, Pill, Sparkline } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { signedPct, usd } from '@/lib/format';
import { LEAGUE_TONE } from './league';
import type { LeaderRow } from './types';

/** Shared with BoardSkeleton so the placeholder grid matches the real one exactly. */
export const COLS = 'grid-cols-[60px_1.8fr_1fr_110px_1fr_1fr]';

export function RankTable({
  rows,
  visible,
  onShowAll,
}: {
  rows: LeaderRow[];
  visible: number;
  onShowAll: () => void;
}) {
  const shown = rows.slice(0, visible);
  const more = rows.length - shown.length;

  return (
    <Card className="overflow-hidden p-0">
      <div
        className={cn(
          'grid gap-2 border-b border-line px-6 py-4 text-[11.5px] font-bold uppercase tracking-[.05em] text-ink-3',
          COLS
        )}
      >
        <span>Rank</span>
        <span>Investor</span>
        <span>League</span>
        <span className="text-center">Trend</span>
        <span className="text-right">Portfolio</span>
        <span className="text-right">Return</span>
      </div>

      {!shown.length ? (
        <p className="px-6 py-10 text-center text-[13.5px] text-ink-3">
          No one has been ranked on this board yet.
        </p>
      ) : (
        shown.map((r) => <Row key={r.id} r={r} />)
      )}

      {more > 0 && (
        <button
          type="button"
          onClick={onShowAll}
          className="w-full cursor-pointer border-0 bg-transparent p-4 text-center text-[13.5px] font-semibold text-violet hover:brightness-110"
        >
          Showing top {shown.length} of {rows.length} investors · View full ranking →
        </button>
      )}
      {more <= 0 && shown.length > 0 && (
        <p className="p-4 text-center text-[13.5px] text-ink-3">
          Showing all {rows.length} ranked investor{rows.length === 1 ? '' : 's'}
        </p>
      )}
    </Card>
  );
}

function Row({ r }: { r: LeaderRow }) {
  const up = r.returnPct >= 0;

  return (
    <div
      className={cn(
        'grid items-center gap-2 border-b border-line px-6 py-3.5',
        COLS,
        r.isMe && 'shadow-[inset_3px_0_0_#7C3AED]'
      )}
      style={
        r.isMe
          ? { background: 'linear-gradient(90deg, rgba(139,92,246,.16), rgba(139,92,246,.04))' }
          : undefined
      }
    >
      <span
        className={cn(
          'font-display text-[18px] font-bold',
          r.rank <= 3 ? 'text-gold' : 'text-ink-2'
        )}
      >
        {r.rank}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={r.name} size={40} ring={r.isMe ? '#7C3AED' : undefined} />
        <div className="min-w-0">
          <Link
            to={`/investor/${encodeURIComponent(r.email)}`}
            className="block truncate text-[14.5px] font-semibold text-ink no-underline hover:text-violet"
          >
            {r.name}
            {r.isMe && <span className="ml-1 text-[11px] font-bold text-violet">· YOU</span>}
          </Link>
          <div className="truncate font-mono text-[12.5px] text-ink-3">{r.handle}</div>
        </div>
      </div>

      <span>
        <Pill tone={LEAGUE_TONE[r.league]}>{r.league}</Pill>
      </span>

      <div className="flex justify-center">
        {r.series.length >= 2 ? (
          <Sparkline data={r.series} up={up} w={64} h={24} />
        ) : (
          <span className="text-[12px] text-ink-3">—</span>
        )}
      </div>

      <span className="text-right font-mono text-[14px] font-semibold text-ink">
        {usd(r.total, 0)}
      </span>

      <span
        className={cn('text-right font-mono text-[14px] font-bold', up ? 'text-up' : 'text-down')}
      >
        {signedPct(r.returnPct)}
      </span>
    </div>
  );
}

export default RankTable;
