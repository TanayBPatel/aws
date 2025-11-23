
import { Stock, Strategy, Wallet, Position, Transaction, SocialPost, Alert, AdminUser } from "../types";

export const MOCK_WALLETS: Wallet[] = [
  {
    id: '1',
    name: 'Main Portfolio',
    balance: 4287310.50, // ~42 Lakhs
    changePercent: 12.46,
    weeklyData: [3800000, 3950000, 3900000, 4100000, 4000000, 4150000, 4287310],
  },
  {
    id: '2',
    name: 'Trading',
    balance: 545000.00, // ~5.4 Lakhs
    changePercent: 3.2,
    weeklyData: [520000, 525000, 522000, 530000, 535000, 540000, 545000],
  }
];

export const MOCK_STRATEGIES: Strategy[] = [
  {
    id: '1',
    name: 'SOL + XRP',
    pair: 'Solana + XRP',
    balance: 185400.50,
    activeUntil: '27 January',
    icon1: 'S',
    icon2: 'X',
  },
  {
    id: '2',
    name: 'ETH + BTC',
    pair: 'Ethereum + Bitcoin',
    balance: 450000.20,
    activeUntil: '15 February',
    icon1: 'E',
    icon2: 'B',
  }
];

export const MOCK_STOCKS: Stock[] = [
  {
    id: 'nifty',
    symbol: 'NIFTY 50',
    name: 'Nifty 50 Index',
    price: 19425.35,
    change: 125.40,
    changePercent: 0.65,
    type: 'stock',
    marketCap: 'N/A',
    volume: 'N/A',
    data: Array.from({ length: 40 }, (_, i) => ({
      time: `${i}:00`,
      value: 19300 + i * 3 + Math.random() * 50
    }))
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 2450000.00, // INR
    change: 85000.50,
    changePercent: 4.06,
    type: 'crypto',
    marketCap: '₹48T',
    volume: '₹2.1T',
    data: Array.from({ length: 40 }, (_, i) => ({
      time: `${i}:00`,
      value: 2400000 + Math.sin(i / 3) * 50000 + Math.random() * 10000
    }))
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 165000.00, // INR
    change: 4200.00,
    changePercent: 2.54,
    type: 'crypto',
    marketCap: '₹18T',
    volume: '₹900B',
    data: Array.from({ length: 40 }, (_, i) => ({
      time: `${i}:00`,
      value: 160000 + Math.sin(i / 5) * 4000 + Math.random() * 1000
    }))
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    price: 2100.50, // INR
    change: -140.00,
    changePercent: -6.66,
    type: 'crypto',
    marketCap: '₹680B',
    volume: '₹40B',
    data: Array.from({ length: 40 }, (_, i) => ({
      time: `${i}:00`,
      value: 2200 - Math.sin(i / 4) * 100
    }))
  },
  {
    id: 'rel',
    symbol: 'RELIANCE',
    name: 'Reliance Ind.',
    price: 2345.60,
    change: 45.20,
    changePercent: 1.95,
    type: 'stock',
    marketCap: '₹15.8T',
    volume: '4.2M',
    data: Array.from({ length: 40 }, (_, i) => ({
      time: `${i}:00`,
      value: 2300 + Math.random() * 100
    }))
  },
  {
    id: 'tcs',
    symbol: 'TCS',
    name: 'Tata Consultancy',
    price: 3450.25,
    change: -12.50,
    changePercent: -0.36,
    type: 'stock',
    marketCap: '₹12.6T',
    volume: '1.8M',
    data: Array.from({ length: 40 }, (_, i) => ({
      time: `${i}:00`,
      value: 3460 - Math.random() * 20
    }))
  },
  {
    id: 'hdfc',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    price: 1620.10,
    change: 15.30,
    changePercent: 0.95,
    type: 'stock',
    marketCap: '₹9.1T',
    volume: '5.5M',
    data: Array.from({ length: 40 }, (_, i) => ({
      time: `${i}:00`,
      value: 1600 + Math.sin(i / 10) * 30
    }))
  },
  {
    id: 'tata',
    symbol: 'TATAMOTORS',
    name: 'Tata Motors',
    price: 620.45,
    change: 8.20,
    changePercent: 1.34,
    type: 'stock',
    marketCap: '₹2.1T',
    volume: '12M',
    data: Array.from({ length: 40 }, (_, i) => ({
      time: `${i}:00`,
      value: 610 + i * 0.5
    }))
  }
];

export const MOCK_POSITIONS: Position[] = [
  {
    id: 'p1',
    stockId: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    quantity: 0.45,
    avgPrice: 2100000,
    currentPrice: 2450000,
    totalValue: 1102500,
    pnl: 157500,
    pnlPercent: 16.6
  },
  {
    id: 'p2',
    stockId: 'rel',
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    type: 'stock',
    quantity: 150,
    avgPrice: 2100,
    currentPrice: 2345.60,
    totalValue: 351840,
    pnl: 36840,
    pnlPercent: 11.7
  },
  {
    id: 'p3',
    stockId: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    quantity: 5.2,
    avgPrice: 150000,
    currentPrice: 165000,
    totalValue: 858000,
    pnl: 78000,
    pnlPercent: 10.0
  },
  {
    id: 'p4',
    stockId: 'hdfc',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    type: 'stock',
    quantity: 200,
    avgPrice: 1550,
    currentPrice: 1620.10,
    totalValue: 324020,
    pnl: 14020,
    pnlPercent: 4.5
  }
];

export const MOCK_WATCHLIST_IDS = ['sol', 'tcs', 'tata'];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'buy',
    stockSymbol: 'BTC',
    amount: 120000,
    quantity: 0.05,
    date: '2024-12-12',
    status: 'completed'
  },
  {
    id: 't2',
    type: 'deposit',
    amount: 500000,
    date: '2024-12-10',
    status: 'completed'
  },
  {
    id: 't3',
    type: 'sell',
    stockSymbol: 'SOL',
    amount: 45000,
    quantity: 20,
    date: '2024-12-08',
    status: 'completed'
  },
  {
    id: 't4',
    type: 'buy',
    stockSymbol: 'RELIANCE',
    amount: 210000,
    quantity: 100,
    date: '2024-12-05',
    status: 'completed'
  }
];

export const MOCK_POSTS: SocialPost[] = [
  {
    id: 'sp1',
    user: {
      name: 'Rajiv Kumar',
      handle: '@rajiv_trades',
      avatar: 'R',
      isFollowing: true
    },
    content: 'Just bought more $RELIANCE. The technicals are looking very strong for a breakout above 2400 levels. 🚀 #LongTerm',
    tags: ['RELIANCE', 'Investing'],
    likes: 45,
    comments: 12,
    timeAgo: '2h',
    isLiked: true
  },
  {
    id: 'sp2',
    user: {
      name: 'Crypto Queen',
      handle: '@crypto_queen',
      avatar: 'C',
      isFollowing: false
    },
    content: 'Bitcoin holding steady at 24L. If we break 25L resistance, we might see a rally to 28L by next month. What do you guys think? $BTC',
    tags: ['BTC', 'Crypto'],
    likes: 128,
    comments: 34,
    timeAgo: '5h'
  },
  {
    id: 'sp3',
    user: {
      name: 'Amit Shah',
      handle: '@amit_stocks',
      avatar: 'A',
      isFollowing: true
    },
    content: 'Tata Motors showing great resilience despite market correction. EV segment growth is key. $TATAMOTORS',
    tags: ['TATAMOTORS', 'Auto'],
    likes: 89,
    comments: 8,
    timeAgo: '1d'
  }
];

export const MOCK_ALERTS: Alert[] = [
    { id: 'a1', stockId: 'btc', type: 'above', price: 2500000, isActive: true },
    { id: 'a2', stockId: 'rel', type: 'below', price: 2300, isActive: true },
    { id: 'a3', stockId: 'eth', type: 'above', price: 160000, isActive: true, triggered: true },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'u1',
    name: 'Sujal Patel',
    email: 'sujal@example.com',
    role: 'user',
    status: 'active',
    walletBalance: 4287310.50,
    joinedDate: '2023-11-15',
    holdings: MOCK_POSITIONS,
    transactions: MOCK_TRANSACTIONS
  },
  {
    id: 'u2',
    name: 'Rajiv Kumar',
    email: 'rajiv.k@example.com',
    role: 'user',
    status: 'active',
    walletBalance: 125000.00,
    joinedDate: '2024-01-20',
    holdings: [
      {
        id: 'p5',
        stockId: 'tata',
        symbol: 'TATAMOTORS',
        name: 'Tata Motors',
        type: 'stock',
        quantity: 500,
        avgPrice: 580,
        currentPrice: 620.45,
        totalValue: 310225,
        pnl: 20225,
        pnlPercent: 6.9
      }
    ],
    transactions: [
      { id: 't10', type: 'deposit', amount: 500000, date: '2024-01-20', status: 'completed' },
      { id: 't11', type: 'buy', stockSymbol: 'TATAMOTORS', amount: 290000, quantity: 500, date: '2024-01-22', status: 'completed' }
    ]
  },
  {
    id: 'u3',
    name: 'Maurya Patel',
    email: 'maurya@admin.com',
    role: 'admin',
    status: 'active',
    walletBalance: 0,
    joinedDate: '2023-01-10',
    holdings: [],
    transactions: []
  }
];