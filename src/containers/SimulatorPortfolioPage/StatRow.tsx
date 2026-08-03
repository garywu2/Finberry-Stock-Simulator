import { Caret, Pill, StatCard } from '@/components/brand';
import { signedPct, signedUsd, usd } from '@/lib/format';

export function StatRow({
  cashBalance,
  stockBalance,
  positions,
  totalReturn,
  totalReturnPct,
  hasStartFund,
}: {
  cashBalance: number;
  stockBalance: number;
  positions: number;
  totalReturn: number;
  totalReturnPct: number;
  /** Without a starting fund there is no baseline, so no return to show. */
  hasStartFund: boolean;
}) {
  const up = totalReturn >= 0;

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

export default StatRow;
