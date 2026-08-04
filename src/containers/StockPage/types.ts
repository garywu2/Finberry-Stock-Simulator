export interface Quote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  open: number;
  high: number;
  low: number;
  close: number;
  previousClose: number;
  change: number;
  percentChange: number;
  volume: number;
  averageVolume: number;
  fiftyTwoWeek: { low: number; high: number } | null;
  isMarketOpen?: boolean;
}

export interface Candle {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistEntry {
  _id: string;
  user: string;
  symbol: string;
  index: string;
  addedAt: string;
}

export const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

/** Twelve Data interval + output size per timeframe. */
export const TIMEFRAME_QUERY: Record<Timeframe, { interval: string; outputsize: number }> = {
  '1D': { interval: '5min', outputsize: 78 },
  '1W': { interval: '30min', outputsize: 65 },
  '1M': { interval: '1day', outputsize: 22 },
  '3M': { interval: '1day', outputsize: 64 },
  '1Y': { interval: '1day', outputsize: 252 },
  ALL: { interval: '1week', outputsize: 520 },
};
