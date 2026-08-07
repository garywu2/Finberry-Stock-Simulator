import { Avatar, Caret, Pill } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { signedPct } from '@/lib/format';
import { MEDAL } from './league';
import type { LeaderRow } from './types';

/** Shared with BoardSkeleton so the placeholder plinths are the same height. */
export const HEIGHT: Record<number, string> = { 1: 'h-[188px]', 2: 'h-[152px]', 3: 'h-[132px]' };

/** Compact $Xk form used on the plinth. */
const compact = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`);

function Place({ row, place }: { row: LeaderRow; place: number }) {
  const colour = MEDAL[place];
  const up = row.returnPct >= 0;

  return (
    <div className="flex w-[200px] max-w-full flex-col items-center">
      <Avatar name={row.name} size={place === 1 ? 76 : 64} ring={colour} />
      <div className="mt-3.5 text-center font-display text-[17px] font-bold text-ink">
        {row.name}
      </div>
      <div className="mb-2 text-[12.5px] text-ink-3">{row.handle}</div>
      <Pill tone={up ? 'up' : 'dn'}>
        <Caret up={up} size={9} /> {signedPct(row.returnPct, 1)}
      </Pill>
      <div
        className={`mt-4 flex w-full flex-col items-center rounded-t-[14px] border border-b-0 border-line-2 pt-[18px] ${HEIGHT[place]}`}
        style={{ background: `linear-gradient(180deg, ${colour}28, transparent)` }}
      >
        <div
          className="font-display text-[44px] font-extrabold leading-none"
          style={{ color: colour }}
        >
          {place}
        </div>
        <div className="mt-2 font-mono text-[13px] text-ink-2">{compact(row.total)}</div>
      </div>
    </div>
  );
}

export function Podium({ rows }: { rows: LeaderRow[] }) {
  const [first, second, third] = rows;
  if (!first) return null;

  return (
    <Card
      className="mb-6 overflow-hidden px-6 pb-0 pt-8"
      style={{ background: 'linear-gradient(180deg, rgba(139,92,246,.08), transparent)' }}
    >
      {/* Places read 2-1-3 left to right, as designed. */}
      <div className="flex flex-wrap items-end justify-center gap-6">
        {second && <Place row={second} place={2} />}
        <Place row={first} place={1} />
        {third && <Place row={third} place={3} />}
      </div>
    </Card>
  );
}

export default Podium;
