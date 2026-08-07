export interface ProfileUser {
  _id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  premiumTier?: number;
  createdAt?: string;
  isPremium?: boolean;
  simulatorEnrollments?: {
    _id: string;
    balance: number;
    simulator: { _id: string; title: string; userStartFund?: number };
  }[];
}

export interface TradeTransaction {
  _id: string;
  symbol: string;
  index: string;
  transactionType: 1 | 2;
  transactionTime: string;
  quantity: number;
  price: number;
  simulatorEnrollment?: string;
}

export interface Badge {
  _id: string;
  displayName: string;
  type: string;
  /** 0 Common … 6 Exotic. */
  rarity: number;
  description: string;
  image?: string;
  enabled: boolean;
}

export interface UserBadge {
  _id: string;
  user: string;
  /** Populated with moreDetails=true. */
  badgeType: Badge | string;
  acquisition: string;
  retracted: boolean;
  dateEarned: string;
}

/** A badge tile: every enabled badge, flagged earned or locked. */
export interface BadgeTile {
  id: string;
  name: string;
  description: string;
  rarity: number;
  earned: boolean;
  earnedAt?: string;
  acquisition?: string;
}

export interface ActivityItem {
  id: string;
  kind: 'buy' | 'sell' | 'badge';
  title: string;
  detail: string;
  at: string;
}
