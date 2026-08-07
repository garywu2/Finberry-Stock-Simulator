import { useContext, useEffect, useMemo, useState } from 'react';
import api from '@/api/client';
import UserContext from '@/context/user';
import { BrandFooter, LoadedAnnouncement, Skeleton, TopNav } from '@/components/brand';
import { cn } from '@/lib/utils';
import { usd } from '@/lib/format';
import BoardSkeleton from './BoardSkeleton';
import Podium from './Podium';
import RankTable from './RankTable';
import { toRows } from './league';
import type { Leaderboard } from './types';

const PAGE_SIZE = 8;

// The designed scope switcher (Global / Friends / My league) needs a follow
// graph and a league model, neither of which exists. The tabs are rendered so
// the surface matches the design, but only Global is selectable.
// TODO(phase-3/4): wire Friends and My league to a real social layer.
const SCOPES = [
  { label: 'Global', enabled: true },
  { label: 'Friends', enabled: false },
  { label: 'My league', enabled: false },
];

function serverMessage(e: unknown, fallback: string) {
  const msg = (e as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return typeof msg === 'string' && msg ? msg : fallback;
}

const LeaderboardsPage = () => {
  const { user } = useContext(UserContext) ?? { user: null };
  const email: string | null = user?.email ?? null;

  const [boards, setBoards] = useState<Leaderboard[]>([]);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get<Leaderboard[]>('game/balancecalculation/balance/learderboard')
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setBoards(list);
        setBoardId((prev) => prev ?? list[0]?.simulatorID ?? null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(serverMessage(e, 'Could not load the leaderboards.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const board = useMemo(
    () => boards.find((b) => b.simulatorID === boardId) ?? null,
    [boards, boardId]
  );

  const rows = useMemo(() => toRows(board, email), [board, email]);
  const me = useMemo(() => rows.find((r) => r.isMe) ?? null, [rows]);

  /**
   * Rankings are written by the hourly cron, which does not fire on Vercel —
   * the standings can be months old, so the date is stated up front rather
   * than implied to be live.
   */
  const asOf = useMemo(() => {
    const stamps = (board?.orderedSimulatorEnrollments ?? [])
      .map((e) => e.lastCalculatedTotalDate)
      .filter((d): d is string => !!d)
      .sort();
    const latest = stamps[stamps.length - 1];
    return latest ? new Date(latest) : null;
  }, [board]);

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      {/* No entry on this board means no known total, so the cash chip is
          hidden rather than asserting $0.00. */}
      <TopNav
        active="Leaderboards"
        user={me?.name ?? email ?? 'Guest'}
        balance={loading ? <Skeleton className="h-3.5 w-16" /> : me ? usd(me.total) : undefined}
      />

      <main className="p-6 md:p-[30px]">
        {/* HEADER */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-[.04em] text-ink-3">
              {board ? board.title : 'All simulators'}
              {asOf &&
                ` · as of ${asOf.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}`}
            </div>
            <h1 className="m-0 mt-1.5 font-display text-[34px] font-bold tracking-[-.025em] text-ink">
              Leaderboards
            </h1>
          </div>

          <div
            className="flex gap-0.5 rounded-field border border-line bg-surface-2 p-[3px]"
            role="group"
            aria-label="Leaderboard scope"
          >
            {SCOPES.map((s) => (
              <button
                key={s.label}
                type="button"
                disabled={!s.enabled}
                aria-pressed={s.enabled}
                title={s.enabled ? undefined : 'Coming soon'}
                className={cn(
                  'cursor-pointer rounded-[9px] border-0 px-4 py-2 text-[13.5px] font-semibold transition-colors',
                  s.enabled
                    ? 'bg-violet text-white'
                    : 'cursor-not-allowed bg-transparent text-ink-3 opacity-50'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* BOARD SWITCHER — the four real simulators. Reserved while loading so
            the board list doesn't shove the ranking down when it arrives. */}
        {loading && (
          <div className="mb-6 flex flex-wrap gap-0.5 self-start rounded-field border border-line bg-surface-2 p-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[34px] w-28 rounded-[9px]" />
            ))}
          </div>
        )}
        {!loading && boards.length > 1 && (
          <div
            className="mb-6 flex flex-wrap gap-0.5 self-start rounded-field border border-line bg-surface-2 p-[3px]"
            role="group"
            aria-label="Select leaderboard"
          >
            {boards.map((b) => (
              <button
                key={b.simulatorID}
                type="button"
                aria-pressed={b.simulatorID === boardId}
                onClick={() => {
                  setBoardId(b.simulatorID);
                  setVisible(PAGE_SIZE);
                }}
                className={cn(
                  'cursor-pointer rounded-[9px] border-0 px-4 py-2 text-[13.5px] font-semibold transition-colors',
                  b.simulatorID === boardId
                    ? 'bg-violet text-white'
                    : 'bg-transparent text-ink-3 hover:text-ink'
                )}
              >
                {b.title}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-field border border-down/30 bg-down-soft px-4 py-3 text-[13.5px] font-medium text-down">
            {error}
          </p>
        )}

        {loading ? (
          <BoardSkeleton rows={PAGE_SIZE} />
        ) : !rows.length ? (
          <p className="rounded-card border border-line bg-surface px-6 py-16 text-center text-[14px] text-ink-3">
            No rankings have been calculated yet.
          </p>
        ) : (
          <>
            <Podium rows={rows} />
            <RankTable rows={rows} visible={visible} onShowAll={() => setVisible(rows.length)} />
            <LoadedAnnouncement message={`${rows.length} ranked investors loaded`} />
          </>
        )}
      </main>

      <BrandFooter />
    </div>
  );
};

export default LeaderboardsPage;
