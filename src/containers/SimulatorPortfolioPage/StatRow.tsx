import { Caret, Pill, Skeleton, SkeletonText, StatCard } from '@/components/brand';
import { signedPct, signedUsd, usd } from '@/lib/format';

export function StatRow({
  cashBalance,
  stockBalance,
  positions,
  totalReturn,
  totalReturnPct,
  hasStartFund,
  loading,
}: {
  cashBalance: number;
  stockBalance: number;
  positions: number;
  totalReturn: number;
  totalReturnPct: number;
  /** Without a starting fund there is no baseline, so no return to show. */
  hasStartFund: boolean;
  /** Balances haven't landed — hold the skeleton rather than flashing $0.00. */
  loading: boolean;
}) {
  const up = totalReturn >= 0;

  if (loading) {
    // Same three cards, same label/value/sub structure, so the row keeps its
    // height and nothing reflows when the real numbers arrive.
    return (
      <div className="grid gap-4 sm:grid-cols-3" aria-busy="true">
        <StatCard
          label="Buying power"
          value={<ValueBar />}
          sub={<SkeletonText text="text-[13px]" bar="h-3 w-24" />}
        />
        <StatCard
          label="Invested"
          value={<ValueBar />}
          sub={<SkeletonText text="text-[13px]" bar="h-3 w-32" />}
        />
        {/* Card three carries a Pill rather than a sub-line. Using a real Pill
            around the bar keeps the height identical by construction. */}
        <StatCard label="Total return" value={<ValueBar />}>
          <Pill tone="mute">
            <Skeleton className="h-2.5 w-[104px]" />
          </Pill>
        </StatCard>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Buying power" value={usd(cashBalance)} sub="Cash available" />
      <StatCard
        label="Invested"
        value={usd(stockBalance)}
        sub={`Across ${positions} position${positions === 1 ? '' : 's'}`}
      />
      <StatCard label="Total return" value={hasStartFund ? signedUsd(totalReturn) : '—'}>
        {hasStartFund ? (
          <Pill tone={up ? 'up' : 'dn'}>
            <Caret up={up} size={9} /> {signedPct(totalReturnPct)} all-time
          </Pill>
        ) : (
          <Pill tone="mute">No baseline</Pill>
        )}
      </StatCard>
    </div>
  );
}

/** Placeholder sized to the 26px mono figure a StatCard renders. */
const ValueBar = () => <Skeleton className="h-[26px] w-[140px] max-w-full rounded-md" />;

export default StatRow;
