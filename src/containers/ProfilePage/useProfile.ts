import { useEffect, useMemo, useState } from 'react';
import api from '@/api/client';
import type { Leaderboard } from '@/containers/LeaderboardsPage/types';
import { computeTradeStats } from './tradeStats';
import type {
  ActivityItem,
  Badge,
  BadgeTile,
  ProfileUser,
  TradeTransaction,
  UserBadge,
} from './types';

/** Rarity names for the badge tiles (Badge.rarity, 0-6). */
export const RARITY = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
  'Mythic',
  'Exotic',
] as const;

function serverMessage(e: unknown, fallback: string) {
  const msg = (e as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return typeof msg === 'string' && msg ? msg : fallback;
}

const badgeIdOf = (ub: UserBadge) =>
  typeof ub.badgeType === 'string' ? ub.badgeType : ub.badgeType?._id;

export function useProfile(email: string | null) {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earned, setEarned] = useState<UserBadge[]>([]);
  const [trades, setTrades] = useState<TradeTransaction[]>([]);
  const [boards, setBoards] = useState<Leaderboard[]>([]);
  // The hero and the portfolio card need only the user doc and the boards.
  // Badges and trades feed sections further down the page, and the earned-badge
  // lookup is serial (it keys off the user's _id) — gating first paint on all
  // of them made the wait as long as the slowest of five requests.
  const [loading, setLoading] = useState(true);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) return;
    let cancelled = false;
    setLoading(true);
    setBadgesLoading(true);
    setTradesLoading(true);

    // --- Primary: identity + standings ---------------------------------------
    const primaryLoad = (async () => {
      const [userRes, boardRes] = await Promise.allSettled([
        api.get<ProfileUser[]>('account/user', { params: { email, moreDetails: true } }),
        api.get<Leaderboard[]>('game/balancecalculation/balance/learderboard'),
      ]);
      if (cancelled) return null;

      const doc =
        userRes.status === 'fulfilled' && Array.isArray(userRes.value.data)
          ? (userRes.value.data[0] ?? null)
          : null;
      setUser(doc);
      if (userRes.status === 'rejected') {
        setError(serverMessage(userRes.reason, 'Could not load your profile.'));
      }
      setBoards(
        boardRes.status === 'fulfilled' && Array.isArray(boardRes.value.data)
          ? boardRes.value.data
          : []
      );
      setLoading(false);
      return doc;
    })();

    // --- Secondary: trades, which drive the stats and the activity feed -------
    void (async () => {
      try {
        const res = await api.get<TradeTransaction[]>('game/tradeTransaction', {
          params: { email },
        });
        if (!cancelled) setTrades(Array.isArray(res.data) ? res.data : []);
      } catch {
        // Stats degrade to "no trades yet" rather than blanking the profile.
      } finally {
        if (!cancelled) setTradesLoading(false);
      }
    })();

    // --- Secondary: the badge catalogue plus this user's earned badges --------
    void (async () => {
      try {
        const [catalogue, doc] = await Promise.all([
          api.get<Badge[]>('account/badge').catch(() => null),
          primaryLoad,
        ]);
        if (cancelled) return;
        setBadges(
          catalogue && Array.isArray(catalogue.data) ? catalogue.data.filter((b) => b.enabled) : []
        );

        // Earned badges key off the user's _id, so this waits on the user doc.
        if (doc?._id) {
          const res = await api.get<UserBadge[]>('account/userbadge', {
            params: { user: doc._id, moreDetails: true },
          });
          if (!cancelled) {
            setEarned(Array.isArray(res.data) ? res.data.filter((b) => !b.retracted) : []);
          }
        }
      } catch {
        // A missing badge list should not blank the whole profile.
      } finally {
        if (!cancelled) setBadgesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email]);

  /** My ranked entry across every board, best rank first. */
  const standings = useMemo(() => {
    if (!email) return [];
    return boards
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
  }, [boards, email]);

  /** The board shown in the hero and portfolio card: the best-ranked one. */
  const primary = standings[0] ?? null;

  const tradeStats = useMemo(() => computeTradeStats(trades), [trades]);

  const badgeTiles = useMemo<BadgeTile[]>(() => {
    const earnedById = new Map<string, UserBadge>();
    earned.forEach((ub) => {
      const id = badgeIdOf(ub);
      if (id) earnedById.set(id, ub);
    });

    return badges
      .map((b) => {
        const mine = earnedById.get(b._id);
        return {
          id: b._id,
          name: b.displayName,
          description: b.description,
          rarity: b.rarity,
          earned: !!mine,
          earnedAt: mine?.dateEarned,
          acquisition: mine?.acquisition,
        };
      })
      .sort((a, b) => {
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        return b.rarity - a.rarity;
      });
  }, [badges, earned]);

  const earnedCount = badgeTiles.filter((b) => b.earned).length;

  /** Trades and badge awards merged into one reverse-chronological feed. */
  const activity = useMemo<ActivityItem[]>(() => {
    const fromTrades: ActivityItem[] = trades.map((t) => {
      const buy = Number(t.transactionType) === 1;
      return {
        id: 't' + t._id,
        kind: buy ? 'buy' : 'sell',
        title: `${buy ? 'Bought' : 'Sold'} ${t.quantity} ${t.symbol}`,
        detail: `@ $${Number(t.price).toFixed(2)} · ${t.index}`,
        at: t.transactionTime,
      };
    });

    const fromBadges: ActivityItem[] = earned.map((ub) => {
      const badge = typeof ub.badgeType === 'string' ? null : ub.badgeType;
      return {
        id: 'b' + ub._id,
        kind: 'badge',
        title: badge ? `Earned “${badge.displayName}”` : 'Earned a badge',
        detail: ub.acquisition || badge?.description || '',
        at: ub.dateEarned,
      };
    });

    return [...fromTrades, ...fromBadges]
      .filter((a) => !!a.at)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [trades, earned]);

  return {
    user,
    loading,
    badgesLoading,
    /** Stats read off the trade history. */
    statsLoading: tradesLoading,
    /** The feed merges trades and badge awards, so it waits on both. */
    activityLoading: tradesLoading || badgesLoading,
    error,
    standings,
    primary,
    tradeStats,
    badgeTiles,
    earnedCount,
    totalBadges: badgeTiles.length,
    activity,
    tradeCount: trades.length,
  };
}
