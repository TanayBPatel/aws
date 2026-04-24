
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  data: { time: string; value: number }[];
  type: 'crypto' | 'stock';
  marketCap?: string;
  volume?: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  changePercent: number;
  weeklyData: number[];
}

export interface Strategy {
  id: string;
  name: string;
  pair: string;
  balance: number;
  activeUntil: string;
  icon1: string;
  icon2: string;
}

export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Position {
  id: string;
  stockId: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'stock';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  stockSymbol?: string;
  amount: number;
  quantity?: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface SocialPost {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
    isFollowing?: boolean;
  };
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked?: boolean;
}

export interface Alert {
  id: string;
  stockId: string;
  type: 'above' | 'below';
  price: number;
  isActive: boolean;
  triggered?: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  walletBalance: number;
  holdings: Position[];
  transactions: Transaction[];
  joinedDate: string;
}

export type TimeRange = '1h' | '24h' | '1W' | '1M' | '3M';