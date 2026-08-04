import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usd } from '@/lib/format';
import type { TransactionType } from '@/containers/SimulatorPortfolioPage/types';

type Side = 'buy' | 'sell';

export function OrderTicket({
  symbol,
  price,
  exchange,
  buyingPower,
  heldQuantity,
  disabled,
  disabledReason,
  onTrade,
}: {
  symbol: string;
  price: number | null;
  exchange: string | null;
  buyingPower: number;
  heldQuantity: number;
  disabled: boolean;
  disabledReason?: string;
  onTrade: (input: {
    transactionType: TransactionType;
    quantity: number;
    price: number;
    index: string;
  }) => Promise<string>;
}) {
  const [side, setSide] = useState<Side>('buy');
  const [shares, setShares] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  /** Largest whole quantity the side allows. */
  const maxShares = useMemo(() => {
    if (side === 'sell') return heldQuantity;
    if (!price || price <= 0) return 0;
    return Math.floor(buyingPower / price);
  }, [side, heldQuantity, buyingPower, price]);

  const estimated = price ? shares * price : 0;
  const affordable = shares > 0 && shares <= maxShares;
  const canReview = !disabled && !!price && !!exchange && affordable;

  const setFraction = (fraction: number) =>
    setShares(Math.max(1, Math.floor(maxShares * fraction)) || 1);

  const submit = async () => {
    if (!price || !exchange) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const msg = await onTrade({
        transactionType: side === 'buy' ? 1 : 2,
        quantity: shares,
        price,
        index: exchange,
      });
      setMessage({ tone: 'ok', text: msg });
      setConfirming(false);
      setShares(1);
    } catch (e) {
      setMessage({ tone: 'err', text: (e as Error).message });
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  const hint = disabled
    ? disabledReason
    : !price
      ? 'No live price available for this symbol.'
      : shares > maxShares
        ? side === 'buy'
          ? `Not enough buying power — you can afford ${maxShares}.`
          : `You only hold ${heldQuantity} share${heldQuantity === 1 ? '' : 's'}.`
        : null;

  return (
    <Card className="p-6 lg:sticky lg:top-6">
      {/* Buy / Sell */}
      <div className="mb-5 flex gap-1 rounded-field bg-surface-2 p-1" role="group">
        {(['buy', 'sell'] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={side === s}
            onClick={() => {
              setSide(s);
              setShares(1);
              setConfirming(false);
              setMessage(null);
            }}
            className={cn(
              'flex-1 cursor-pointer rounded-[9px] border-0 py-2.5 text-center text-[14.5px] capitalize transition-colors',
              side === s
                ? s === 'buy'
                  ? 'bg-up-btn font-bold text-[#063521]'
                  : 'bg-down font-bold text-white'
                : 'bg-transparent font-semibold text-ink-2 hover:text-ink'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {confirming ? (
        <div>
          <p className="mb-3 text-[13.5px] text-ink-2">
            Confirm your {side} order — this places a paper trade at the current market price.
          </p>
          <dl className="mb-4 rounded-field bg-surface-2 p-4">
            <Row k="Symbol" v={symbol} />
            <Row k="Shares" v={String(shares)} />
            <Row k="Market price" v={usd(price ?? 0)} />
            <Row k={side === 'buy' ? 'Total cost' : 'Total proceeds'} v={usd(estimated)} strong />
          </dl>
          <div className="flex gap-2.5">
            <Button
              variant="ghost"
              size="block"
              disabled={submitting}
              onClick={() => setConfirming(false)}
            >
              Back
            </Button>
            <Button
              variant={side === 'buy' ? 'buy' : 'sell'}
              size="block"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? 'Placing…' : `Confirm ${side}`}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Order type — the trade endpoint is market-only */}
          <div className="text-[12.5px] font-semibold text-ink-3">Order type</div>
          <div className="mb-[18px] mt-2 flex gap-2">
            <span className="flex-1 rounded-[10px] border border-violet bg-violet py-[9px] text-center text-[13.5px] font-bold text-white">
              Market
            </span>
            <span
              title="Limit orders aren’t supported yet"
              className="flex-1 cursor-not-allowed rounded-[10px] border border-line bg-surface-2 py-[9px] text-center text-[13.5px] font-semibold text-ink-3 opacity-50"
            >
              Limit
            </span>
          </div>

          {/* Shares stepper */}
          <label htmlFor="ot-shares" className="text-[12.5px] font-semibold text-ink-3">
            Shares
          </label>
          <div className="mb-2 mt-2 flex items-center justify-between rounded-field border border-line-2 bg-surface-2 px-4 py-3">
            <button
              type="button"
              aria-label="Decrease shares"
              disabled={shares <= 1}
              onClick={() => setShares((n) => Math.max(1, n - 1))}
              className="cursor-pointer border-0 bg-transparent text-[20px] font-semibold text-ink-3 disabled:opacity-40"
            >
              –
            </button>
            <input
              id="ot-shares"
              type="number"
              min={1}
              step={1}
              value={shares}
              onChange={(e) => setShares(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              className="w-full border-0 bg-transparent p-0 text-center font-mono text-[22px] font-bold text-ink outline-none"
            />
            <button
              type="button"
              aria-label="Increase shares"
              onClick={() => setShares((n) => n + 1)}
              className="cursor-pointer border-0 bg-transparent text-[20px] font-semibold text-violet"
            >
              +
            </button>
          </div>

          <div className="mb-5 flex gap-1.5">
            {(
              [
                ['25%', 0.25],
                ['50%', 0.5],
                ['Max', 1],
              ] as const
            ).map(([label, f]) => (
              <button
                key={label}
                type="button"
                disabled={maxShares < 1}
                onClick={() => setFraction(f)}
                className="flex-1 cursor-pointer rounded-lg border-0 bg-surface-2 py-1.5 text-center text-[12.5px] font-semibold text-ink-2 hover:text-ink disabled:opacity-40"
              >
                {label}
              </button>
            ))}
          </div>

          <dl className="mb-[18px] rounded-[14px] bg-surface-2 p-4">
            <Row k="Market price" v={price ? usd(price) : '—'} />
            <Row k="Estimated shares" v={String(shares)} />
            <Row
              k={side === 'buy' ? 'Estimated cost' : 'Estimated proceeds'}
              v={usd(estimated)}
              strong
              divider
            />
          </dl>

          {hint && <p className="mb-3 text-[12.5px] font-medium text-down">{hint}</p>}

          <Button
            variant={side === 'buy' ? 'buy' : 'sell'}
            size="block"
            disabled={!canReview}
            onClick={() => setConfirming(true)}
            className="py-3.5 text-[15.5px]"
          >
            Review {side} order
          </Button>

          <div className="mt-3 text-center text-[12.5px] text-ink-3">
            Buying power <span className="font-mono text-ink-2">{usd(buyingPower)}</span> · paper
            money
          </div>
        </>
      )}

      {message && (
        <p
          role="status"
          className={cn(
            'mt-3 text-center text-[12.5px] font-medium',
            message.tone === 'ok' ? 'text-up' : 'text-down'
          )}
        >
          {message.text}
        </p>
      )}
    </Card>
  );
}

function Row({
  k,
  v,
  strong,
  divider,
}: {
  k: string;
  v: string;
  strong?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      className={cn('flex justify-between py-[5px]', divider && 'mt-1.5 border-t border-line pt-3')}
    >
      <dt className="text-[13.5px] text-ink-2">{k}</dt>
      <dd
        className={cn(
          'm-0 font-mono',
          strong ? 'text-[16px] font-bold text-ink' : 'text-[14px] font-semibold text-ink'
        )}
      >
        {v}
      </dd>
    </div>
  );
}

export default OrderTicket;
