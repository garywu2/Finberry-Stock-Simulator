import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/api/client';
import type { EnrollmentSummary, Holding } from '@/containers/SimulatorPortfolioPage/types';
import type { Candle, Quote, Timeframe, WatchlistEntry } from './types';
import { TIMEFRAME_QUERY } from './types';

function serverMessage(e: unknown, fallback: string) {
  const msg = (e as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return typeof msg === 'string' && msg ? msg : fallback;
}

interface TimeSeriesResponse {
  data?: {
    meta?: { symbol: string; exchange: string };
    values?: {
      datetime: string;
      open: string;
      high: string;
      low: string;
      close: string;
      volume: string;
    }[];
  };
}

export function useStock(symbol: string, email: string | null) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  const [holding, setHolding] = useState<Holding | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentSummary | null>(null);
  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  // `watching: false` and a null holding are indistinguishable from real
  // answers, so both backfills need a flag of their own — otherwise the star
  // and the order ticket render one state and then flip to another.
  const [positionLoading, setPositionLoading] = useState(true);
  const [watchLoading, setWatchLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Quote -----------------------------------------------------------------
  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get<Quote>('stock/quote', { params: { symbol } })
      .then((res) => {
        if (!cancelled) setQuote(res.data ?? null);
      })
      .catch((e) => {
        if (!cancelled) {
          setQuote(null);
          setError(serverMessage(e, `No market data available for ${symbol}.`));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  // --- Chart, per timeframe --------------------------------------------------
  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setChartLoading(true);
    const { interval, outputsize } = TIMEFRAME_QUERY[timeframe];
    api
      .get<TimeSeriesResponse>('stock/time_series', {
        params: { symbol, interval, outputsize },
      })
      .then((res) => {
        if (cancelled) return;
        const values = res.data?.data?.values;
        if (!Array.isArray(values)) {
          setCandles([]);
          return;
        }
        // Twelve Data returns newest first.
        setCandles(
          values
            .map((v) => ({
              datetime: v.datetime,
              open: Number(v.open),
              high: Number(v.high),
              low: Number(v.low),
              close: Number(v.close),
              volume: Number(v.volume),
            }))
            .filter((c) => Number.isFinite(c.close))
            .reverse()
        );
      })
      .catch(() => {
        if (!cancelled) setCandles([]);
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe]);

  // --- Your position + buying power -----------------------------------------
  useEffect(() => {
    if (!email || !symbol) {
      // Logged out: there is no position to wait for.
      setPositionLoading(false);
      return;
    }
    let cancelled = false;
    setPositionLoading(true);
    (async () => {
      try {
        const userRes = await api.get<{ simulatorEnrollments?: EnrollmentSummary[] }[]>(
          'account/user',
          { params: { email, moreDetails: true } }
        );
        if (cancelled) return;
        const enrolments = (Array.isArray(userRes.data) ? userRes.data[0] : null)
          ?.simulatorEnrollments;
        const primary = enrolments?.[0] ?? null;
        setEnrollment(primary);
        if (!primary) return;

        const holdRes = await api.get<Holding[]>('game/holding', {
          params: {
            email,
            simulatorID: primary.simulator._id,
            populatePriceAndValue: true,
            greaterThanZero: true,
          },
        });
        if (cancelled) return;
        const rows = Array.isArray(holdRes.data) ? holdRes.data : [];
        setHolding(rows.find((h) => h.symbol.toUpperCase() === symbol.toUpperCase()) ?? null);
      } catch {
        // The page is still useful without a position; leave it empty.
      } finally {
        if (!cancelled) setPositionLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [email, symbol]);

  // --- Watchlist -------------------------------------------------------------
  useEffect(() => {
    if (!email || !symbol) {
      // Logged out: the Watch button isn't rendered at all.
      setWatchLoading(false);
      return;
    }
    let cancelled = false;
    setWatchLoading(true);
    api
      .get<WatchlistEntry[]>('account/watchlist', { params: { email } })
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setWatching(rows.some((w) => w.symbol.toUpperCase() === symbol.toUpperCase()));
      })
      .catch(() => {
        /* Watch state is cosmetic if it fails to load. */
      })
      .finally(() => {
        if (!cancelled) setWatchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [email, symbol]);

  const toggleWatch = useCallback(async () => {
    if (!email || !symbol) return;
    const next = !watching;
    setWatching(next); // optimistic
    try {
      if (next) {
        await api.post('account/watchlist', {
          email,
          symbol,
          index: quote?.exchange ?? 'N/A',
        });
      } else {
        await api.delete(`account/watchlist/${encodeURIComponent(symbol)}`, {
          params: { email },
        });
      }
    } catch (e) {
      setWatching(!next); // roll back
      setError(serverMessage(e, 'Could not update your watchlist.'));
    }
  }, [email, symbol, watching, quote]);

  // --- Derived ---------------------------------------------------------------
  const series = useMemo(() => candles.map((c) => c.close), [candles]);

  /** Range across the loaded candles — labelled by timeframe, never as 52-week. */
  const periodRange = useMemo(() => {
    if (!candles.length) return null;
    const lows = candles.map((c) => c.low).filter(Number.isFinite);
    const highs = candles.map((c) => c.high).filter(Number.isFinite);
    if (!lows.length || !highs.length) return null;
    return { low: Math.min(...lows), high: Math.max(...highs) };
  }, [candles]);

  const price = quote?.close ?? null;
  const up = (quote?.change ?? 0) >= 0;

  const positionValue = holding && price ? holding.quantity * price : (holding?.totalValue ?? null);

  const positionReturn = useMemo(() => {
    if (!holding || !price || !(holding.averagePurchasePrice > 0)) return null;
    const cost = holding.averagePurchasePrice * holding.quantity;
    const value = price * holding.quantity;
    return { amount: value - cost, pct: ((value - cost) / cost) * 100 };
  }, [holding, price]);

  return {
    quote,
    price,
    up,
    candles,
    series,
    periodRange,
    timeframe,
    setTimeframe,
    holding,
    positionValue,
    positionReturn,
    enrollment,
    buyingPower: enrollment?.balance ?? 0,
    watching,
    toggleWatch,
    loading,
    chartLoading,
    positionLoading,
    watchLoading,
    error,
    setError,
  };
}
