export interface PublicBadge {
  _id: string;
  dateEarned: string;
  acquisition: string;
  displayName: string | null;
  rarity: number;
  description: string | null;
}

export interface PublicHolding {
  symbol: string;
  index: string;
  quantity: number;
  averagePurchasePrice: number;
}

export interface PublicTrade {
  _id: string;
  symbol: string;
  transactionType: 1 | 2;
  quantity: number;
  price: number;
  transactionTime: string;
}

export interface PublicProfile {
  email: string;
  username?: string;
  createdAt?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  location?: string;
  bio?: string;
  privacy: {
    personalProfile: boolean;
    simulator: boolean;
    leaderboard: boolean;
    badges: boolean;
  };
  /** Computed server-side over the full trade history. */
  winRate: number | null;
  badges: PublicBadge[];
  holdings: PublicHolding[];
  trades: PublicTrade[];
}

export interface FollowState {
  followers: number;
  following: number;
  viewerFollows: boolean;
}

/** One side of the comparison — computed for both the viewer and the subject. */
export interface CompareSide {
  label: string;
  returnPct: number | null;
  value: number | null;
  rank: number | null;
  winRate: number | null;
  positions: number;
  symbols: string[];
}
