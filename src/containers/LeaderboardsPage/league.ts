import type { PillTone } from '@/components/brand';
import type { League, LeaderRow, Leaderboard, RankedEnrollment } from './types';

// Leagues are derived from a player's position within the board rather than
// stored: the backend has no league model yet.
//
// Percentiles alone break on small boards — on an 8-player board a pure 10%
// cut means rank 1 (12.5%) misses Diamond and the top tier goes unused. Each
// tier therefore has a minimum head-count floor, which also reproduces the
// mock's banding (ranks 1-3 Diamond, 4-5 Platinum, rest Gold) exactly.
//
// TODO(phase-3/4): replace with a real league/season model on the server.
const DIAMOND = { percentile: 0.1, floor: 3 };
const PLATINUM = { percentile: 0.33, floor: 5 };

const cutoff = (tier: { percentile: number; floor: number }, total: number) =>
  Math.max(tier.floor, Math.ceil(total * tier.percentile));

export function leagueFor(rank: number, total: number): League {
  if (total <= 0) return 'Gold';
  if (rank <= cutoff(DIAMOND, total)) return 'Diamond';
  if (rank <= cutoff(PLATINUM, total)) return 'Platinum';
  return 'Gold';
}

export const LEAGUE_TONE: Record<League, PillTone> = {
  Diamond: 'violet',
  Platinum: 'mute',
  Gold: 'gold',
};

/** Medal colours for podium places 1-3 (design-system.md). */
export const MEDAL: Record<number, string> = {
  1: '#E8A21B',
  2: '#9AA1B5',
  3: '#C77A3C',
};

/**
 * A handle for display. The user model has no handle field, so it is derived
 * from the username (or the email local part) — never shown as authoritative.
 */
function handleFor(user: { username?: string; email: string } | null) {
  const base = user?.username?.trim() || (user?.email ?? '').split('@')[0];
  return '@' + base.toLowerCase().replace(/\s+/g, '.');
}

export function toRows(board: Leaderboard | null, myEmail: string | null): LeaderRow[] {
  if (!board) return [];
  const ranked = board.orderedSimulatorEnrollments ?? [];
  const total = ranked.length;
  const start = board.userStartFund;

  return ranked
    .filter((e): e is RankedEnrollment => !!e && typeof e.lastCalculatedTotal === 'number')
    .map((e) => {
      const value = e.lastCalculatedTotal;
      return {
        id: e._id,
        rank: e.lastCalculatedRanking,
        name: e.user?.username?.trim() || (e.user?.email ?? '').split('@')[0] || 'Unknown',
        handle: handleFor(e.user),
        email: e.user?.email ?? '',
        total: value,
        // Guard the divide-by-zero a misconfigured simulator would cause.
        returnPct: start > 0 ? ((value - start) / start) * 100 : 0,
        league: leagueFor(e.lastCalculatedRanking, total),
        series: (e.pastCalculatedTotal ?? [])
          .slice()
          .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
          .map((p) => Number(p.balance))
          .filter(Number.isFinite),
        isMe: !!myEmail && e.user?.email?.toLowerCase() === myEmail.toLowerCase(),
      };
    });
}
