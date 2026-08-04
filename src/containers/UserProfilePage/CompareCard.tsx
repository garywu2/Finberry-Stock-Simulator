import { useMemo, useState } from 'react';
import { Avatar } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signedPct, usd } from '@/lib/format';
import type { CompareSide } from './types';

// DESIGN NOTE — this view was not in the handoff; the mock only had a CTA.
//
// The design goal was to answer "how do I stack up?" without turning into a
// scoreboard that just tells a beginner they are losing. So:
//   * Metrics are paired on one row with a shared bar, so the gap is legible
//     at a glance rather than requiring mental arithmetic.
//   * The bar is scaled to the larger of the two values, and each side keeps
//     its own colour — no red "loser" styling.
//   * Overlap is given equal weight to the comparison. What you already have
//     in common is the useful, non-competitive part, and it's the bit a
//     learner can act on.
// It deliberately reuses the existing card/pill/avatar language rather than
// inventing new components, so it still reads as part of the profile.

interface Metric {
  label: string;
  /** Higher is better — drives which side is highlighted. */
  a: number | null;
  b: number | null;
  format: (n: number) => string;
}

export function CompareCard({
  you,
  them,
  themName,
}: {
  you: CompareSide;
  them: CompareSide;
  themName: string;
}) {
  const [open, setOpen] = useState(false);

  const metrics: Metric[] = useMemo(
    () => [
      {
        label: 'All-time return',
        a: you.returnPct,
        b: them.returnPct,
        format: (n) => signedPct(n),
      },
      { label: 'Portfolio value', a: you.value, b: them.value, format: (n) => usd(n, 0) },
      {
        label: 'Global rank',
        // Lower rank is better, so compare on the negated value.
        a: you.rank == null ? null : -you.rank,
        b: them.rank == null ? null : -them.rank,
        format: (n) => `#${Math.abs(n)}`,
      },
      { label: 'Win rate', a: you.winRate, b: them.winRate, format: (n) => `${Math.round(n)}%` },
      {
        label: 'Positions held',
        a: you.positions,
        b: them.positions,
        format: (n) => String(n),
      },
    ],
    [you, them]
  );

  const overlap = useMemo(() => {
    const mine = new Set(you.symbols.map((s) => s.toUpperCase()));
    return them.symbols.filter((s) => mine.has(s.toUpperCase()));
  }, [you.symbols, them.symbols]);

  const onlyThem = useMemo(() => {
    const mine = new Set(you.symbols.map((s) => s.toUpperCase()));
    return them.symbols.filter((s) => !mine.has(s.toUpperCase()));
  }, [you.symbols, them.symbols]);

  const gap =
    you.returnPct != null && them.returnPct != null ? them.returnPct - you.returnPct : null;

  return (
    <Card
      className="border-line-2 p-[22px]"
      style={{
        background: 'linear-gradient(150deg, rgba(124,58,237,.10), rgba(22,192,120,.06))',
      }}
    >
      <div className="mb-1 text-[15px] font-bold text-ink">You vs {themName}</div>

      <p className="mb-3.5 text-[13.5px] leading-[1.45] text-ink-2">
        {gap == null ? (
          <>See how your portfolio stacks up against {themName}’s.</>
        ) : gap >= 0 ? (
          <>
            {themName} is ahead by <b className="text-ink">{signedPct(Math.abs(gap))}</b> on
            all-time return.
          </>
        ) : (
          <>
            You’re ahead by <b className="text-up">{signedPct(Math.abs(gap))}</b> on all-time
            return.
          </>
        )}
      </p>

      {!open ? (
        <Button size="block" className="py-[11px] text-[14px]" onClick={() => setOpen(true)}>
          Compare portfolios
        </Button>
      ) : (
        <div>
          {/* Who's who */}
          <div className="mb-4 flex items-center justify-between gap-3 text-[12.5px] font-semibold">
            <span className="flex items-center gap-2 text-violet">
              <Avatar name={you.label} size={22} /> You
            </span>
            <span className="flex items-center gap-2 text-up">
              {themName} <Avatar name={themName} size={22} />
            </span>
          </div>

          <dl className="m-0">
            {metrics.map((m) => (
              <MetricRow key={m.label} metric={m} />
            ))}
          </dl>

          {/* Overlap — the non-competitive, actionable half */}
          <div className="mt-4 border-t border-line pt-3.5">
            <div className="mb-2 text-[12.5px] font-semibold text-ink">
              {overlap.length ? `You both hold ${overlap.length}` : 'No holdings in common'}
            </div>
            {overlap.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {overlap.map((s) => (
                  <span
                    key={s}
                    className="rounded-pill border border-line bg-surface px-2.5 py-1 font-mono text-[12px] font-semibold text-ink"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {onlyThem.length > 0 && (
              <>
                <div className="mb-2 text-[12.5px] font-semibold text-ink">
                  Only {themName} holds
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {onlyThem.map((s) => (
                    <span
                      key={s}
                      className="rounded-pill border border-dashed border-line-2 px-2.5 py-1 font-mono text-[12px] text-ink-2"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-violet"
          >
            Hide comparison
          </button>
        </div>
      )}
    </Card>
  );
}

function MetricRow({ metric }: { metric: Metric }) {
  const { label, a, b, format } = metric;
  const known = a != null && b != null;

  // Bars are scaled to the larger magnitude so the gap is readable. Negative
  // values still get a visible sliver rather than disappearing.
  const max = known ? Math.max(Math.abs(a), Math.abs(b), 1) : 1;
  const pct = (n: number) => Math.max(4, (Math.abs(n) / max) * 100);
  const youLead = known && a > b;
  const themLead = known && b > a;

  return (
    <div className="py-2">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span
          className={cn(
            'font-mono text-[13.5px] font-semibold',
            youLead ? 'text-violet' : 'text-ink-2'
          )}
        >
          {a == null ? '—' : format(a)}
        </span>
        <span className="text-[11.5px] font-semibold uppercase tracking-[.04em] text-ink-3">
          {label}
        </span>
        <span
          className={cn(
            'font-mono text-[13.5px] font-semibold',
            themLead ? 'text-up' : 'text-ink-2'
          )}
        >
          {b == null ? '—' : format(b)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {/* Left bar grows right-to-left so both meet in the middle. */}
        <div className="flex h-[6px] flex-1 justify-end overflow-hidden rounded-l bg-surface-3">
          {a != null && (
            <div className="h-full rounded-l bg-violet" style={{ width: `${pct(a)}%` }} />
          )}
        </div>
        <div className="flex h-[6px] flex-1 overflow-hidden rounded-r bg-surface-3">
          {b != null && <div className="h-full rounded-r bg-up" style={{ width: `${pct(b)}%` }} />}
        </div>
      </div>
    </div>
  );
}

export default CompareCard;
