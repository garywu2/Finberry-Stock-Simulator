// Shapes returned by GET game/balancecalculation/balance/learderboard
// (note the server's spelling — see CLAUDE.md).

export interface LeaderboardUser {
  _id: string;
  email: string;
  username?: string;
}

export interface RankedEnrollment {
  _id: string;
  user: LeaderboardUser | null;
  lastCalculatedRanking: number;
  lastCalculatedTotal: number;
  lastCalculatedTotalDate?: string;
  joinDate?: string;
  /** Added to the server projection for the trend sparkline. */
  pastCalculatedTotal?: { balance: number; datetime: string }[];
}

export interface Leaderboard {
  simulatorID: string;
  title: string;
  userStartFund: number;
  orderedSimulatorEnrollments: RankedEnrollment[];
}

/** A ranked row with everything the table needs, derived once. */
export interface LeaderRow {
  id: string;
  rank: number;
  name: string;
  handle: string;
  email: string;
  total: number;
  returnPct: number;
  league: League;
  series: number[];
  isMe: boolean;
}

export type League = 'Diamond' | 'Platinum' | 'Gold';
