import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

// A labelled metric tile (buying power, total return, win rate, …). `value` is
// rendered in the mono numeric face; pass a <Pill> or text via `children` for a
// trailing badge or sub-line. Ported from the StatCard used across the mocks.
export function StatCard({
  label,
  value,
  sub,
  className,
  children,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="text-[11.5px] font-bold uppercase tracking-[.06em] text-ink-3">{label}</div>
      <div className="mt-2 font-mono text-[26px] font-bold leading-none text-ink">{value}</div>
      {sub && <div className="mt-1.5 text-[13px] text-ink-2">{sub}</div>}
      {children && <div className="mt-2">{children}</div>}
    </Card>
  );
}

export default StatCard;
