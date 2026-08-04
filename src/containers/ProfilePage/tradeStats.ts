import type { TradeTransaction } from './types';

/**
 * Realized results reconstructed from trade history.
 *
 * Nothing on the server stores realized P/L, so it is recomputed here with
 * average-cost accounting: buys raise the running average cost of a position,
 * sells realize (price - averageCost) x quantity against it.
 *
 * Known limits — surfaced in the UI rather than hidden:
 *  - only trades present in the record are counted, so a position opened before
 *    the earliest stored transaction has no cost basis and is skipped;
 *  - fees and slippage do not exist in this simulator, so they are ignored;
 *  - positions are tracked per enrollment *and* symbol, because the same ticker
 *    in two simulators is two independent positions.
 */
export interface RealizedTrade {
  symbol: string;
  quantity: number;
  proceeds: number;
  costBasis: number;
  profit: number;
  returnPct: number;
  at: string;
}

export interface TradeStats {
  realized: RealizedTrade[];
  /** Share of closing trades that made money, or null when none have closed. */
  winRate: number | null;
  /** Best single realized trade by return %, or null when none have closed. */
  bestTrade: RealizedTrade | null;
  /** Sells that had to be skipped because no cost basis was known. */
  skippedSells: number;
}

interface Position {
  quantity: number;
  averageCost: number;
}

const BUY = 1;

export function computeTradeStats(trades: TradeTransaction[]): TradeStats {
  const ordered = [...trades].sort(
    (a, b) => new Date(a.transactionTime).getTime() - new Date(b.transactionTime).getTime()
  );

  const positions = new Map<string, Position>();
  const realized: RealizedTrade[] = [];
  let skippedSells = 0;

  for (const t of ordered) {
    const quantity = Number(t.quantity);
    const price = Number(t.price);
    if (!Number.isFinite(quantity) || !Number.isFinite(price) || quantity <= 0 || price <= 0) {
      continue;
    }

    // The same ticker in two simulators is two separate positions.
    const key = `${t.simulatorEnrollment ?? 'na'}|${t.symbol}`;
    const held = positions.get(key) ?? { quantity: 0, averageCost: 0 };

    if (Number(t.transactionType) === BUY) {
      const total = held.averageCost * held.quantity + price * quantity;
      const newQuantity = held.quantity + quantity;
      positions.set(key, {
        quantity: newQuantity,
        averageCost: newQuantity > 0 ? total / newQuantity : 0,
      });
      continue;
    }

    // Sell. Without a known cost basis the result is unknowable, not zero.
    if (held.quantity <= 0 || held.averageCost <= 0) {
      skippedSells += 1;
      continue;
    }

    const sold = Math.min(quantity, held.quantity);
    const costBasis = held.averageCost * sold;
    const proceeds = price * sold;
    realized.push({
      symbol: t.symbol,
      quantity: sold,
      proceeds,
      costBasis,
      profit: proceeds - costBasis,
      returnPct: ((price - held.averageCost) / held.averageCost) * 100,
      at: t.transactionTime,
    });

    positions.set(key, {
      quantity: held.quantity - sold,
      // Average cost is unchanged by a sale; reset once flat.
      averageCost: held.quantity - sold > 0 ? held.averageCost : 0,
    });
  }

  const wins = realized.filter((r) => r.profit > 0).length;
  const best = realized.reduce<RealizedTrade | null>(
    (acc, r) => (!acc || r.returnPct > acc.returnPct ? r : acc),
    null
  );

  return {
    realized,
    winRate: realized.length ? (wins / realized.length) * 100 : null,
    bestTrade: best,
    skippedSells,
  };
}
