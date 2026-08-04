import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/api/client';
import type { Leaderboard } from '@/containers/LeaderboardsPage/types';
import { computeTradeStats } from '@/containers/ProfilePage/tradeStats';
import type { TradeTransaction } from '@/containers/ProfilePage/types';
import type { CompareSide, FollowState, PublicProfile } from './types';

function serverMessage(e: unknown, fallback: string) {
  const msg = (e as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return typeof msg === 'string' && msg ? msg : fallback;
}

/** Best-ranked standing for an email across every board. */
function standingFor(boards: Leaderboard[], email: string | null) {
  if (!email) return null;
  const found = boards
    .map((b) => {
      const mine = (b.orderedSimulatorEnrollments ?? []).find(
        (e) => e.user?.email?.toLowerCase() === email.toLowerCase()
      );
      return mine
        ? {
            title: b.title,
            rank: mine.lastCalculatedRanking,
            total: mine.lastCalculatedTotal,
            startFund: b.userStartFund,
            field: (b.orderedSimulatorEnrollments ?? []).length,
            asOf: mine.lastCalculatedTotalDate ?? null,
            series: (mine.pastCalculatedTotal ?? [])
              .slice()
              .sort((a, b2) => new Date(a.datetime).getTime() - new Date(b2.datetime).getTime())
              .map((p) => Number(p.balance))
              .filter(Number.isFinite),
          }
        : null;
    })
    .filter((s): s is NonNullable<typeof s> => !!s)
    .sort((a, b) => a.rank - b.rank);
  return found[0] ?? null;
}

const returnOf = (s: { total: number; startFund: number } | null) =>
  s && s.startFund > 0 ? ((s.total - s.startFund) / s.startFund) * 100 : null;

export function useUserProfile(subjectEmail: string, viewerEmail: string | null) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [boards, setBoards] = useState<Leaderboard[]>([]);
  const [follow, setFollow] = useState<FollowState>({
    followers: 0,
    following: 0,
    viewerFollows: false,
  });
  const [viewerTrades, setViewerTrades] = useState<TradeTransaction[]>([]);
  const [viewerHoldings, setViewerHoldings] = useState<{ symbol: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!subjectEmail) return;
    let cancelled = false;
    setLoading(true);
    setError('');

    (async () => {
      const [profileRes, boardRes] = await Promise.allSettled([
        api.get<PublicProfile>('account/publicprofile', { params: { email: subjectEmail } }),
        api.get<Leaderboard[]>('game/balancecalculation/balance/learderboard'),
      ]);
      if (cancelled) return;

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data ?? null);
      } else {
        setProfile(null);
        setError(serverMessage(profileRes.reason, 'That investor could not be found.'));
      }
      setBoards(
        boardRes.status === 'fulfilled' && Array.isArray(boardRes.value.data)
          ? boardRes.value.data
          : []
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [subjectEmail]);

  // Follow counts + whether the viewer follows this investor.
  useEffect(() => {
    if (!subjectEmail) return;
    let cancelled = false;
    api
      .get<FollowState>('account/follow', {
        params: { email: subjectEmail, viewerEmail: viewerEmail ?? undefined },
      })
      .then((res) => {
        if (!cancelled && res.data) setFollow(res.data);
      })
      .catch(() => {
        /* Counts are cosmetic. */
      });
    return () => {
      cancelled = true;
    };
  }, [subjectEmail, viewerEmail]);

  // The viewer's own trades and holdings, for the comparison.
  useEffect(() => {
    if (!viewerEmail) return;
    let cancelled = false;
    api
      .get<TradeTransaction[]>('game/tradeTransaction', { params: { email: viewerEmail } })
      .then((res) => {
        if (!cancelled) setViewerTrades(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        /* Comparison degrades gracefully. */
      });
    api
      .get<{ symbol: string }[]>('game/holding', {
        params: { email: viewerEmail, greaterThanZero: true },
      })
      .then((res) => {
        if (!cancelled) setViewerHoldings(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        /* Comparison degrades gracefully. */
      });
    return () => {
      cancelled = true;
    };
  }, [viewerEmail]);

  const toggleFollow = useCallback(async () => {
    if (!viewerEmail || !subjectEmail) return;
    const next = !follow.viewerFollows;
    setFollow((f) => ({
      ...f,
      viewerFollows: next,
      followers: Math.max(0, f.followers + (next ? 1 : -1)),
    }));
    try {
      if (next) {
        await api.post('account/follow', {
          followerEmail: viewerEmail,
          followingEmail: subjectEmail,
        });
      } else {
        await api.delete('account/follow', {
          params: { followerEmail: viewerEmail, followingEmail: subjectEmail },
        });
      }
    } catch (e) {
      setFollow((f) => ({
        ...f,
        viewerFollows: !next,
        followers: Math.max(0, f.followers + (next ? -1 : 1)),
      }));
      setError(serverMessage(e, 'Could not update your follow.'));
    }
  }, [viewerEmail, subjectEmail, follow.viewerFollows]);

  const subjectStanding = useMemo(() => standingFor(boards, subjectEmail), [boards, subjectEmail]);
  const viewerStanding = useMemo(() => standingFor(boards, viewerEmail), [boards, viewerEmail]);

  const viewerStats = useMemo(() => computeTradeStats(viewerTrades), [viewerTrades]);

  /** Allocation by symbol from public holdings, largest first. */
  const topHoldings = useMemo(() => {
    const rows = profile?.holdings ?? [];
    const withCost = rows.map((h) => ({
      ...h,
      cost: h.quantity * (h.averagePurchasePrice || 0),
    }));
    const total = withCost.reduce((sum, h) => sum + h.cost, 0);
    return withCost
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)
      .map((h) => ({ ...h, allocation: total > 0 ? (h.cost / total) * 100 : 0 }));
  }, [profile]);

  const compare = useMemo<{ you: CompareSide; them: CompareSide } | null>(() => {
    if (!viewerEmail || !profile) return null;
    return {
      you: {
        label: 'You',
        returnPct: returnOf(viewerStanding),
        value: viewerStanding?.total ?? null,
        rank: viewerStanding?.rank ?? null,
        winRate: viewerStats.winRate,
        positions: viewerHoldings.length,
        symbols: viewerHoldings.map((h) => h.symbol),
      },
      them: {
        label: profile.username ?? profile.email,
        returnPct: returnOf(subjectStanding),
        value: subjectStanding?.total ?? null,
        rank: subjectStanding?.rank ?? null,
        winRate: profile.winRate,
        positions: profile.holdings.length,
        symbols: profile.holdings.map((h) => h.symbol),
      },
    };
  }, [viewerEmail, profile, viewerStanding, subjectStanding, viewerStats, viewerHoldings]);

  return {
    profile,
    loading,
    error,
    follow,
    toggleFollow,
    subjectStanding,
    subjectReturn: returnOf(subjectStanding),
    subjectWinRate: profile?.winRate ?? null,
    topHoldings,
    compare,
  };
}
