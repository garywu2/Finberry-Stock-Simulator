import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '@/api/client';
import type {
  BalanceBreakdown,
  EnrollmentDetail,
  EnrollmentSummary,
  Holding,
  HoldingRow,
  MarketMover,
  PastTotal,
  ServerUser,
  Timeframe,
  TimeSeriesResponse,
  WatchRow,
} from './types';

/** Days covered by each timeframe; ALL is unbounded. */
const TIMEFRAME_DAYS: Record<Timeframe, number> = {
  '1D': 1,
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '1Y': 365,
  ALL: Number.POSITIVE_INFINITY,
};

export const TIMEFRAME_LABEL: Record<Timeframe, string> = {
  '1D': 'today',
  '1W': 'this week',
  '1M': 'this month',
  '3M': 'past 3 months',
  '1Y': 'past year',
  ALL: 'all time',
};

/**
 * Run `fn` over `items` with bounded concurrency. Twelve Data is rate limited
 * and NodeCache is per-instance on serverless, so we deliberately avoid firing
 * one request per symbol simultaneously.
 */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

/**
 * 30 daily closes for a symbol, oldest first. Returns [] on any failure — a
 * missing sparkline is not worth failing the page over, and Sparkline renders
 * nothing for series shorter than 2 points.
 */
async function fetchSeries(symbol: string): Promise<number[]> {
  try {
    const res = await api.get<TimeSeriesResponse>('stock/time_series', {
      params: { symbol, interval: '1day', outputsize: 30 },
    });
    const values = res.data?.data?.values;
    if (!Array.isArray(values)) return [];
    return values
      .map((v) => Number(v.close))
      .filter((n) => Number.isFinite(n))
      .reverse();
  } catch {
    return [];
  }
}

function serverMessage(e: unknown, fallback: string) {
  const msg = (e as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return typeof msg === 'string' && msg ? msg : fallback;
}

/** Points within the timeframe window, oldest first. */
export function sliceByTimeframe(points: PastTotal[], tf: Timeframe): PastTotal[] {
  const sorted = [...points]
    .filter((p) => p && Number.isFinite(Number(p.balance)) && p.datetime)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  const days = TIMEFRAME_DAYS[tf];
  if (!Number.isFinite(days)) return sorted;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return sorted.filter((p) => new Date(p.datetime).getTime() >= cutoff);
}

export function useSimulatorPortfolio(email: string | null | undefined) {
  const [serverUser, setServerUser] = useState<ServerUser | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [equityPoints, setEquityPoints] = useState<PastTotal[]>([]);
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [balances, setBalances] = useState<BalanceBreakdown | null>(null);
  const [watchlist, setWatchlist] = useState<WatchRow[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Bumped after enrolling so the user document is re-read in place — the old
  // page called window.location.reload() here.
  const [userReloads, setUserReloads] = useState(0);
  const reloadUser = useCallback(() => setUserReloads((n) => n + 1), []);

  // Guards against applying responses after unmount / a later selection.
  const requestId = useRef(0);

  const enrollments = useMemo<EnrollmentSummary[]>(
    () => serverUser?.simulatorEnrollments ?? [],
    [serverUser]
  );

  const enrollment = useMemo(
    () => enrollments.find((e) => e._id === enrollmentId) ?? null,
    [enrollments, enrollmentId]
  );

  // --- 1. User + enrollments -------------------------------------------------
  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<ServerUser[]>('account/user', { params: { email, moreDetails: true } })
      .then((res) => {
        if (cancelled) return;
        const doc = Array.isArray(res.data) ? res.data[0] : null;
        setServerUser(doc ?? null);
        // Select by _id, never by title — the old page matched on title and
        // silently fell back to enrollment 0, trading against the wrong sim.
        const list = doc?.simulatorEnrollments ?? [];
        setEnrollmentId((prev) => prev ?? list[0]?._id ?? null);
        if (!list.length) setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(serverMessage(e, 'Could not load your account.'));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [email, userReloads]);

  // --- 2. Everything scoped to the selected enrollment -----------------------
  const loadEnrollmentData = useCallback(async () => {
    if (!email || !enrollment) return;
    const simulatorID = enrollment.simulator._id;
    const id = ++requestId.current;
    const stale = () => id !== requestId.current;

    setLoading(true);
    setError('');

    const [detailRes, holdingRes, balanceRes] = await Promise.allSettled([
      api.get<EnrollmentDetail[]>('game/simulatorEnrollment', {
        params: { _id: enrollment._id },
      }),
      api.get<Holding[]>('game/holding', {
        params: {
          email,
          simulatorID,
          populatePriceAndValue: true,
          greaterThanZero: true,
        },
      }),
      api.get<BalanceBreakdown>(
        `game/balancecalculation/balance/simulatoremail/${simulatorID}/${encodeURIComponent(email)}`
      ),
    ]);

    if (stale()) return;

    if (detailRes.status === 'fulfilled') {
      const detail = Array.isArray(detailRes.value.data)
        ? detailRes.value.data[0]
        : (detailRes.value.data as EnrollmentDetail | undefined);
      setEquityPoints(detail?.pastCalculatedTotal ?? []);
    } else {
      setEquityPoints([]);
    }

    if (balanceRes.status === 'fulfilled') {
      setBalances(balanceRes.value.data ?? null);
    } else {
      setBalances(null);
      setError(serverMessage(balanceRes.reason, 'Could not load your balances.'));
    }

    const rawHoldings: Holding[] =
      holdingRes.status === 'fulfilled' && Array.isArray(holdingRes.value.data)
        ? holdingRes.value.data
        : [];

    // Render the table immediately, then backfill sparklines.
    const baseRows: HoldingRow[] = rawHoldings.map((h) => toRow(h, []));
    setHoldings(baseRows);
    setLoading(false);

    const series = await mapLimit(rawHoldings, 3, (h) => fetchSeries(h.symbol));
    if (stale()) return;
    setHoldings(rawHoldings.map((h, i) => toRow(h, series[i] ?? [])));
  }, [email, enrollment]);

  useEffect(() => {
    void loadEnrollmentData();
  }, [loadEnrollmentData]);

  // --- 3. Watchlist ----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    api
      .get<MarketMover[]>('game/marketmovers')
      .then(async (res) => {
        const rows = Array.isArray(res.data) ? res.data.slice(0, 4) : [];
        if (!rows.length || cancelled) return;
        const base: WatchRow[] = rows.map((m) => {
          const change = Number(m.percent_change) || 0;
          return {
            symbol: m.symbol,
            name: m.name ?? m.symbol,
            price: Number(m.last ?? m.high) || 0,
            change,
            up: change >= 0,
            series: [],
          };
        });
        setWatchlist(base);
        const series = await mapLimit(base, 2, (w) => fetchSeries(w.symbol));
        if (cancelled) return;
        setWatchlist(base.map((w, i) => ({ ...w, series: series[i] ?? [] })));
      })
      .catch(() => {
        // The watchlist is decorative; leave it empty if the feed is down.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Derived values --------------------------------------------------------
  const cashBalance = balances?.cashBalance ?? enrollment?.balance ?? 0;
  const stockBalance = balances?.stockBalance ?? 0;
  const totalValue = cashBalance + stockBalance;
  const startFund = enrollment?.simulator?.userStartFund ?? 0;

  const windowPoints = useMemo(
    () => sliceByTimeframe(equityPoints, timeframe),
    [equityPoints, timeframe]
  );

  /**
   * The equity curve. pastCalculatedTotal is written by the hourly cron, which
   * does not fire on Vercel serverless — so it is routinely empty. When we have
   * fewer than two points there is no curve to draw and the timeframe switcher
   * is meaningless; the caller disables it.
   */
  const series = useMemo(() => {
    const vals = windowPoints.map((p) => Number(p.balance)).filter(Number.isFinite);
    // Append the live total so the curve ends at the number shown in the hero.
    if (vals.length && totalValue > 0) vals.push(totalValue);
    return vals;
  }, [windowPoints, totalValue]);

  const hasSeries = series.length >= 2;

  /** Change over the selected window, or all-time vs the starting fund. */
  const delta = useMemo(() => {
    if (hasSeries) {
      const first = series[0];
      const change = totalValue - first;
      return {
        change,
        pct: first > 0 ? (change / first) * 100 : 0,
        label: TIMEFRAME_LABEL[timeframe],
      };
    }
    const change = startFund > 0 ? totalValue - startFund : 0;
    return {
      change,
      pct: startFund > 0 ? (change / startFund) * 100 : 0,
      label: 'all time',
    };
  }, [hasSeries, series, totalValue, startFund, timeframe]);

  const totalReturn = startFund > 0 ? totalValue - startFund : 0;
  const totalReturnPct = startFund > 0 ? (totalReturn / startFund) * 100 : 0;

  /** Symbols the server could not price — the old page dropped these silently. */
  const missingPriceSymbols = useMemo(() => {
    const map = balances?.missingPrices;
    if (!map) return [];
    return Object.values(map).flatMap((bySymbol) => Object.keys(bySymbol ?? {}));
  }, [balances]);

  return {
    serverUser,
    enrollments,
    enrollment,
    enrollmentId,
    selectEnrollment: setEnrollmentId,
    holdings,
    watchlist,
    timeframe,
    setTimeframe,
    series,
    hasSeries,
    delta,
    cashBalance,
    stockBalance,
    totalValue,
    totalReturn,
    totalReturnPct,
    missingPriceSymbols,
    loading,
    error,
    setError,
    refresh: loadEnrollmentData,
    reloadUser,
  };
}

function toRow(h: Holding, series: number[]): HoldingRow {
  // stockPrice is -1 when the server's price lookup failed, and absent when
  // populatePriceAndValue was not requested. Both mean "unknown", not "free".
  const price = typeof h.stockPrice === 'number' && h.stockPrice > 0 ? h.stockPrice : NaN;
  const value = Number.isFinite(price) ? price * h.quantity : (h.totalValue ?? 0);
  const avg = h.averagePurchasePrice;

  // Today's move is the live price against the previous daily close. The last
  // point of a daily series is today's (still moving) close, so the baseline is
  // the one before it.
  const prevClose = series.length >= 2 ? series[series.length - 2] : NaN;
  const dayPct =
    Number.isFinite(price) && Number.isFinite(prevClose) && prevClose > 0
      ? ((price - prevClose) / prevClose) * 100
      : null;

  return {
    ...h,
    price,
    value,
    // Guard the divide-by-zero that produced Infinity%/NaN% in the old table.
    returnPct: Number.isFinite(price) && avg > 0 ? ((price - avg) / avg) * 100 : null,
    dayPct,
    trendUp: series.length >= 2 ? series[series.length - 1] >= series[0] : true,
    series,
  };
}
