import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '@/api/client';
import UserContext from '@/context/user';
import { BrandFooter, TopNav } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { displayName, greeting, usd } from '@/lib/format';
import HoldingsTable from './HoldingsTable';
import PortfolioHero from './PortfolioHero';
import QuickTrade from './QuickTrade';
import StatRow from './StatRow';
import StreakCard from './StreakCard';
import Watchlist from './Watchlist';
import { useSimulatorPortfolio } from './useSimulatorPortfolio';
import type { Simulator, StockListItem, TradeResponse, TransactionType } from './types';

function serverMessage(e: unknown, fallback: string) {
  const msg = (e as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return typeof msg === 'string' && msg ? msg : fallback;
}

const SimulatorPortfolioPage = () => {
  const { user } = useContext(UserContext) ?? { user: null };
  const email: string | null = user?.email ?? null;

  const portfolio = useSimulatorPortfolio(email);
  const {
    serverUser,
    enrollments,
    enrollment,
    enrollmentId,
    selectEnrollment,
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
    refresh,
    reloadUser,
  } = portfolio;

  const [stocks, setStocks] = useState<StockListItem[]>([]);
  const symbolInput = useRef<HTMLInputElement | null>(null);

  // The full listing is thousands of rows; fetched once and used both for
  // symbol search and to label holdings with a company name.
  useEffect(() => {
    let cancelled = false;
    api
      .get<StockListItem[]>('stock/stocks')
      .then((res) => {
        if (cancelled) return;
        setStocks(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        // Search degrades to "type an exact ticker"; not worth blocking on.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const namesBySymbol = useMemo(() => {
    const m = new Map<string, string>();
    stocks.forEach((s) => m.set(s.symbol, s.name));
    return m;
  }, [stocks]);

  const nameFor = useCallback((symbol: string) => namesBySymbol.get(symbol), [namesBySymbol]);

  const handleTrade = useCallback(
    async (input: {
      symbol: string;
      index: string;
      transactionType: TransactionType;
      quantity: number;
      price: number;
    }): Promise<TradeResponse> => {
      if (!email || !enrollment) throw new Error('No simulator selected.');
      try {
        const res = await api.post<TradeResponse>(
          `game/simulator/${enrollment.simulator._id}/${encodeURIComponent(email)}`,
          { ...input, transactionTime: Date.now() }
        );
        // The old page fired four nested refetches here and swallowed errors.
        await refresh();
        return res.data;
      } catch (e) {
        throw new Error(serverMessage(e, 'The order could not be placed.'));
      }
    },
    [email, enrollment, refresh]
  );

  const focusTrade = () => {
    symbolInput.current = (document.getElementById('qt-symbol') as HTMLInputElement | null) ?? null;
    symbolInput.current?.focus();
    symbolInput.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const name = displayName(serverUser, email);

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <TopNav active="Simulator" user={name} balance={usd(cashBalance)} />

      <main className="p-6 md:p-[30px]">
        {/* HEADER */}
        <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-[.04em] text-ink-3">
              Practice portfolio
              {enrollment ? ` · ${enrollment.simulator.title}` : ''}
            </div>
            <h1 className="m-0 mt-1.5 font-display text-[34px] font-bold tracking-[-.025em] text-ink">
              {greeting()}, {name}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {enrollments.length > 1 && (
              <select
                aria-label="Select simulator"
                value={enrollmentId ?? ''}
                onChange={(e) => selectEnrollment(e.target.value)}
                className="rounded-btn border border-line-2 bg-surface-2 px-3.5 py-[9px] text-[14.5px] font-semibold text-ink outline-none focus:border-violet"
              >
                {enrollments.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.simulator.title}
                  </option>
                ))}
              </select>
            )}
            <Button onClick={focusTrade} disabled={!enrollment}>
              + New trade
            </Button>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-field border border-down/30 bg-down-soft px-4 py-3 text-[13.5px] font-medium text-down">
            {error}
          </p>
        )}

        {missingPriceSymbols.length > 0 && (
          <p className="mb-4 rounded-field border border-line-2 bg-surface-2 px-4 py-3 text-[13.5px] text-ink-2">
            Live prices are unavailable for {missingPriceSymbols.join(', ')} — those positions are
            excluded from your portfolio value.
          </p>
        )}

        {!loading && !enrollments.length ? (
          <EnrollCard email={email} onEnrolled={reloadUser} />
        ) : (
          <div className="grid items-start gap-[22px] lg:grid-cols-[1fr_360px]">
            {/* MAIN COLUMN */}
            <div className="flex min-w-0 flex-col gap-[22px]">
              <PortfolioHero
                totalValue={totalValue}
                delta={delta}
                series={series}
                hasSeries={hasSeries}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
              <StatRow
                cashBalance={cashBalance}
                stockBalance={stockBalance}
                positions={holdings.length}
                totalReturn={totalReturn}
                totalReturnPct={totalReturnPct}
                hasStartFund={(enrollment?.simulator?.userStartFund ?? 0) > 0}
              />
              <HoldingsTable rows={holdings} loading={loading} nameFor={nameFor} />
            </div>

            {/* SIDEBAR */}
            <div className="flex flex-col gap-[22px]">
              <QuickTrade
                stocks={stocks}
                holdings={holdings}
                cashBalance={cashBalance}
                disabled={!enrollment}
                onTrade={handleTrade}
              />
              <StreakCard />
              <Watchlist rows={watchlist} />
            </div>
          </div>
        )}
      </main>

      <BrandFooter />
    </div>
  );
};

/** Shown when the user is not enrolled in any simulator. */
function EnrollCard({ email, onEnrolled }: { email: string | null; onEnrolled: () => void }) {
  const [available, setAvailable] = useState<Simulator[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get<Simulator[]>('game/simulator')
      .then((res) => {
        if (cancelled) return;
        setAvailable(Array.isArray(res.data) ? res.data.filter((s) => !s.hidden) : []);
      })
      .catch(() => setErr('Could not load the available simulators.'));
    return () => {
      cancelled = true;
    };
  }, []);

  const enroll = async (simulatorID: string) => {
    if (!email) return;
    setBusy(simulatorID);
    setErr('');
    try {
      await api.post(`game/simulator/${simulatorID}`, { email });
      onEnrolled();
    } catch (e) {
      setErr(serverMessage(e, 'Could not enrol you in that simulator.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl p-8 text-center">
      <h2 className="m-0 font-display text-[22px] font-bold text-ink">Join a simulator to start</h2>
      <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-2">
        Pick a run below and you’ll get paper money to trade real symbols at live prices.
      </p>

      {err && <p className="mt-4 text-[13.5px] font-medium text-down">{err}</p>}

      <ul className="mt-6 flex list-none flex-col gap-2.5 p-0">
        {available.map((s) => (
          <li
            key={s._id}
            className="flex items-center justify-between gap-4 rounded-field border border-line-2 bg-surface-2 px-4 py-3 text-left"
          >
            <div className="min-w-0">
              <div className="font-display text-[15px] font-bold text-ink">{s.title}</div>
              {s.userStartFund != null && (
                <div className="font-mono text-[12.5px] text-ink-3">
                  {usd(s.userStartFund, 0)} starting funds
                </div>
              )}
            </div>
            <Button
              size="sm"
              disabled={busy === s._id}
              onClick={() => enroll(s._id)}
              className={cn(busy === s._id && 'opacity-60')}
            >
              {busy === s._id ? 'Joining…' : 'Join'}
            </Button>
          </li>
        ))}
      </ul>

      {!available.length && !err && (
        <p className="mt-6 text-[13.5px] text-ink-3">No simulators are open right now.</p>
      )}
    </Card>
  );
}

export default SimulatorPortfolioPage;
