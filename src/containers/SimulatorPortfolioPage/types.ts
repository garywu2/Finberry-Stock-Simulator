// API response shapes for the Simulator page. The server returns bare arrays
// from most GETs (see server/src/routes/Game.js autoManageOutput), so callers
// index into [0] where a single document is expected.

export interface Simulator {
  _id: string;
  title: string;
  description?: string;
  startTime?: string;
  stopTime?: string;
  userStartFund?: number;
  hidden?: boolean;
}

/** Enrollment as returned inside `account/user?moreDetails=true` (select: "simulator balance"). */
export interface EnrollmentSummary {
  _id: string;
  balance: number;
  simulator: Simulator;
}

export interface ServerUser {
  _id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isPremium?: boolean;
  simulatorEnrollments?: EnrollmentSummary[];
}

export interface PastTotal {
  balance: number;
  datetime: string;
}

/** Full enrollment document from `game/simulatorEnrollment` — carries the equity curve. */
export interface EnrollmentDetail {
  _id: string;
  balance: number;
  joinDate?: string;
  lastCalculatedTotal?: number;
  pastCalculatedTotal?: PastTotal[];
}

export interface Holding {
  _id: string;
  symbol: string;
  index: string;
  quantity: number;
  averagePurchasePrice: number;
  /** Present only with populatePriceAndValue. -1 means the price lookup failed. */
  stockPrice?: number;
  totalValue?: number;
}

export interface BalanceBreakdown {
  stockBalance: number;
  cashBalance: number;
  missingPrices?: Record<string, Record<string, string>>;
}

export type TransactionType = 1 | 2; // 1 = Buy, 2 = Sell

export interface TradeTransaction {
  _id: string;
  symbol: string;
  index: string;
  transactionType: TransactionType;
  transactionTime: string;
  quantity: number;
  price: number;
}

export interface TradeResponse {
  msg: string;
  remainingBalance: number;
  desiredHolding: Holding;
  tradeTransaction: TradeTransaction;
}

export interface StockListItem {
  symbol: string;
  name: string;
}

export interface TimeSeriesResponse {
  creditsLeft?: number;
  data?: {
    meta?: { symbol: string; exchange: string };
    /** Newest first. */
    values?: { datetime: string; close: string }[];
    status?: string;
    message?: string;
  };
}

export interface MarketMover {
  symbol: string;
  name: string;
  exchange: string;
  last: number;
  high: number;
  low: number;
  change: number;
  percent_change: number;
}

/** A watchlist row after normalisation. */
export interface WatchRow {
  symbol: string;
  name: string;
  price: number;
  change: number;
  up: boolean;
  series: number[];
}

/** A holdings row with derived display values. */
export interface HoldingRow extends Holding {
  /** stockPrice, or NaN when the lookup failed (-1) or is absent. */
  price: number;
  value: number;
  /** All-time return vs average purchase price, or null when unknowable. */
  returnPct: number | null;
  /** Change vs the previous daily close, or null when there is no series. */
  dayPct: number | null;
  /** Direction of the 30-day series, used to colour the sparkline. */
  trendUp: boolean;
  series: number[];
}

export const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];
