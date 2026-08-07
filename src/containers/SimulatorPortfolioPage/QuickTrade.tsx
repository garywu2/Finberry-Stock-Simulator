import { useEffect, useMemo, useRef, useState } from 'react';
import api from '@/api/client';
import { SkeletonText } from '@/components/brand';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usd } from '@/lib/format';
import type { HoldingRow, StockListItem, TradeResponse, TransactionType } from './types';

type Side = 'buy' | 'sell';

export function QuickTrade({
  stocks,
  holdings,
  cashBalance,
  disabled,
  loading = false,
  onTrade,
}: {
  stocks: StockListItem[];
  holdings: HoldingRow[];
  cashBalance: number;
  disabled: boolean;
  /** Balances haven't landed, so buying power isn't known yet. */
  loading?: boolean;
  /** Resolves with the server response, or rejects with a message to display. */
  onTrade: (input: {
    symbol: string;
    index: string;
    transactionType: TransactionType;
    quantity: number;
    price: number;
  }) => Promise<TradeResponse>;
}) {
  const [side, setSide] = useState<Side>('buy');
  const [query, setQuery] = useState('');
  const [symbol, setSymbol] = useState<StockListItem | null>(null);
  const [shares, setShares] = useState('10');
  const [price, setPrice] = useState<number | null>(null);
  const [exchange, setExchange] = useState<string | null>(null);
  const [priceError, setPriceError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const priceRequest = useRef(0);

  // Selling is only meaningful for positions you hold, so the sell side offers
  // holdings rather than the full listing.
  const options = useMemo<StockListItem[]>(() => {
    if (side === 'sell') {
      return holdings.map((h) => ({ symbol: h.symbol, name: h.index }));
    }
    const q = query.trim().toUpperCase();
    if (!q) return [];
    return stocks
      .filter((s) => s.symbol.startsWith(q) || s.name?.toUpperCase().includes(q))
      .slice(0, 8);
  }, [side, query, stocks, holdings]);

  const heldQuantity = useMemo(
    () => holdings.find((h) => h.symbol === symbol?.symbol)?.quantity ?? 0,
    [holdings, symbol]
  );

  // Live price plus the exchange for the chosen symbol. `stock/price` returns
  // no exchange, so the trade's `index` comes from the time_series meta (the
  // same source the legacy page used); for a sell we already know it from the
  // holding. -1 is the server's price-failure sentinel.
  useEffect(() => {
    if (!symbol) {
      setPrice(null);
      setExchange(null);
      setPriceError('');
      return;
    }
    const id = ++priceRequest.current;
    const held = holdingIndex(holdings, symbol.symbol);
    setPrice(null);
    setExchange(held ?? null);
    setPriceError('');

    api
      .get<{ price: number }>('stock/price', { params: { symbol: symbol.symbol } })
      .then((res) => {
        if (id !== priceRequest.current) return;
        const p = Number(res.data?.price);
        if (!Number.isFinite(p) || p <= 0) {
          setPriceError('No live price available for this symbol.');
          return;
        }
        setPrice(p);
      })
      .catch(() => {
        if (id !== priceRequest.current) return;
        setPriceError('Could not fetch a price for this symbol.');
      });

    if (!held) {
      api
        .get<{ data?: { meta?: { exchange?: string } } }>('stock/time_series', {
          params: { symbol: symbol.symbol, interval: '1day', outputsize: 2 },
        })
        .then((res) => {
          if (id !== priceRequest.current) return;
          setExchange(res.data?.data?.meta?.exchange ?? null);
        })
        .catch(() => {
          /* Handled by the exchange guard below. */
        });
    }
  }, [symbol, holdings]);

  const quantity = Number(shares);
  const quantityValid = Number.isInteger(quantity) && quantity > 0;
  const estimatedCost = quantityValid && price ? quantity * price : 0;
  const affordable = side === 'buy' ? estimatedCost <= cashBalance : quantity <= heldQuantity;
  const canReview = !disabled && !!symbol && !!price && !!exchange && quantityValid && affordable;

  const reset = (keepSymbol = true) => {
    setConfirming(false);
    setShares('10');
    if (!keepSymbol) {
      setSymbol(null);
      setQuery('');
    }
  };

  const submit = async () => {
    if (!symbol || !price || !exchange || !quantityValid) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await onTrade({
        symbol: symbol.symbol,
        index: exchange,
        transactionType: side === 'buy' ? 1 : 2,
        quantity,
        price,
      });
      setMessage({ tone: 'ok', text: res.msg || 'Transaction complete!' });
      reset();
    } catch (e) {
      setMessage({ tone: 'err', text: (e as Error).message });
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  const validationHint = !symbol
    ? null
    : priceError
      ? priceError
      : !quantityValid
        ? 'Enter a whole number of shares.'
        : !affordable
          ? side === 'buy'
            ? `Not enough buying power — you have ${usd(cashBalance)}.`
            : `You only hold ${heldQuantity} share${heldQuantity === 1 ? '' : 's'}.`
          : price && !exchange
            ? 'Could not determine the exchange for this symbol.'
            : null;

  return (
    <Card className="p-[22px]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0 font-display text-[18px] font-bold text-ink">Quick trade</h2>
        <span className="font-mono text-[12px] text-ink-3">Paper money</span>
      </div>

      {/* Buy / Sell */}
      <div className="mb-4 flex gap-1 rounded-field bg-surface-2 p-1" role="group">
        {(['buy', 'sell'] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={side === s}
            onClick={() => {
              setSide(s);
              setSymbol(null);
              setQuery('');
              setConfirming(false);
              setMessage(null);
            }}
            className={cn(
              'flex-1 cursor-pointer rounded-[9px] border-0 py-[9px] text-center text-[14px] capitalize transition-colors',
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
        <ConfirmPanel
          side={side}
          symbol={symbol!.symbol}
          quantity={quantity}
          price={price!}
          estimatedCost={estimatedCost}
          cashBalance={cashBalance}
          submitting={submitting}
          onBack={() => setConfirming(false)}
          onConfirm={submit}
        />
      ) : (
        <>
          {/* Symbol */}
          <label htmlFor="qt-symbol" className="text-[12.5px] font-semibold text-ink-3">
            Symbol
          </label>
          <div className="relative">
            <div className="mb-3.5 mt-1.5 flex items-center justify-between gap-2 rounded-field border border-line-2 bg-surface-2 px-3.5 py-[11px] focus-within:border-violet">
              <input
                id="qt-symbol"
                autoComplete="off"
                disabled={disabled}
                placeholder={side === 'sell' ? 'Pick a holding' : 'Search ticker'}
                value={symbol ? symbol.symbol : query}
                onChange={(e) => {
                  setSymbol(null);
                  setQuery(e.target.value);
                  setMessage(null);
                }}
                onFocus={() => symbol && (setSymbol(null), setQuery(''))}
                className="w-full min-w-0 border-0 bg-transparent p-0 font-mono text-[15px] font-semibold text-ink outline-none placeholder:font-sans placeholder:font-normal placeholder:text-ink-3"
              />
              {price != null && (
                <span className="shrink-0 font-mono text-[14px] text-up">{usd(price)}</span>
              )}
            </div>

            {!symbol && options.length > 0 && (
              <ul className="absolute z-10 -mt-2 max-h-56 w-full overflow-auto rounded-field border border-line-2 bg-surface p-1 shadow-card">
                {options.map((o) => (
                  <li key={o.symbol}>
                    <button
                      type="button"
                      onClick={() => {
                        setSymbol(o);
                        setQuery('');
                      }}
                      className="flex w-full cursor-pointer items-baseline gap-2 rounded-[9px] border-0 bg-transparent px-3 py-2 text-left hover:bg-surface-2"
                    >
                      <span className="font-mono text-[14px] font-semibold text-ink">
                        {o.symbol}
                      </span>
                      <span className="truncate text-[12.5px] text-ink-3">{o.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Shares + order type */}
          <div className="mb-3.5 flex gap-3">
            <div className="flex-1">
              <label htmlFor="qt-shares" className="text-[12.5px] font-semibold text-ink-3">
                Shares
              </label>
              <input
                id="qt-shares"
                type="number"
                min={1}
                step={1}
                disabled={disabled}
                value={shares}
                onChange={(e) => {
                  setShares(e.target.value);
                  setMessage(null);
                }}
                className="mt-1.5 w-full rounded-field border border-line-2 bg-surface-2 px-3.5 py-[11px] font-mono text-[15px] font-semibold text-ink outline-none focus:border-violet"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="qt-order-type" className="text-[12.5px] font-semibold text-ink-3">
                Order type
              </label>
              {/* Only market orders are supported by the trade endpoint today. */}
              <select
                id="qt-order-type"
                disabled
                className="mt-1.5 w-full cursor-not-allowed appearance-none rounded-field border border-line-2 bg-surface-2 px-3.5 py-[11px] text-[14px] font-semibold text-ink outline-none"
              >
                <option>Market</option>
              </select>
            </div>
          </div>

          <dl className="mb-4 border-t border-line pt-3.5">
            <SummaryRow
              k={side === 'buy' ? 'Estimated cost' : 'Estimated proceeds'}
              v={usd(estimatedCost)}
            />
            <SummaryRow k="Buying power" v={usd(cashBalance)} loading={loading} />
          </dl>

          {validationHint && (
            <p className="mb-3 text-[12.5px] font-medium text-down">{validationHint}</p>
          )}

          <Button
            variant={side === 'buy' ? 'buy' : 'sell'}
            size="block"
            disabled={!canReview}
            onClick={() => setConfirming(true)}
            className="py-[13px] text-[15px]"
          >
            Review {side} order
          </Button>
        </>
      )}

      {message && (
        <p
          role="status"
          className={cn(
            'mt-3 text-[12.5px] font-medium',
            message.tone === 'ok' ? 'text-up' : 'text-down'
          )}
        >
          {message.text}
        </p>
      )}
    </Card>
  );
}

function ConfirmPanel({
  side,
  symbol,
  quantity,
  price,
  estimatedCost,
  cashBalance,
  submitting,
  onBack,
  onConfirm,
}: {
  side: Side;
  symbol: string;
  quantity: number;
  price: number;
  estimatedCost: number;
  cashBalance: number;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const after = side === 'buy' ? cashBalance - estimatedCost : cashBalance + estimatedCost;

  return (
    <div>
      <p className="mb-3 text-[13.5px] text-ink-2">
        Confirm your {side} order — this places a paper trade at the current market price.
      </p>
      <dl className="mb-4 rounded-field border border-line-2 bg-surface-2 px-3.5 py-2.5">
        <SummaryRow k="Symbol" v={symbol} />
        <SummaryRow k="Shares" v={String(quantity)} />
        <SummaryRow k="Market price" v={usd(price)} />
        <SummaryRow k={side === 'buy' ? 'Total cost' : 'Total proceeds'} v={usd(estimatedCost)} />
        <SummaryRow k="Buying power after" v={usd(after)} />
      </dl>
      <div className="flex gap-2.5">
        <Button variant="ghost" size="block" disabled={submitting} onClick={onBack}>
          Back
        </Button>
        <Button
          variant={side === 'buy' ? 'buy' : 'sell'}
          size="block"
          disabled={submitting}
          onClick={onConfirm}
        >
          {submitting ? 'Placing…' : `Confirm ${side}`}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ k, v, loading }: { k: string; v: string; loading?: boolean }) {
  return (
    <div className="flex justify-between py-[5px]">
      <dt className="text-[13.5px] text-ink-2">{k}</dt>
      <dd className="m-0 font-mono text-[13.5px] font-semibold text-ink">
        {loading ? <SkeletonText text="text-[13.5px]" bar="h-3 w-16" /> : v}
      </dd>
    </div>
  );
}

function holdingIndex(holdings: HoldingRow[], symbol: string) {
  return holdings.find((h) => h.symbol === symbol)?.index;
}

export default QuickTrade;
