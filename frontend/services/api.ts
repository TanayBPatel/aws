import { RiskMetrics, SystemStats } from '../types';

// Pointing to the express server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper to handle fetch errors
const fetchJson = async (url: string, options?: RequestInit) => {
  try {
    const token = getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(options?.headers || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      // Try to parse error message
      let errData: any = {};
      try {
        errData = await res.json();
      } catch (e) {
        // If response is not JSON, use status text
        errData = { message: res.statusText };
      }
      throw new Error(errData.error || errData.message || `API Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (error: any) {
    console.error("API Fetch Error:", error);
    // Handle network errors (server not running, CORS, etc.)
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please make sure the backend server is running on http://localhost:5000');
    }
    throw error;
  }
};

export const api = {
  // Authentication
  login: async (credentials: { email: string; password: string }) => {
    const res = await fetchJson(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const res = await fetchJson(`${API_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },

  // Portfolio
  getPortfolio: async () => {
    const res = await fetchJson(`${API_URL}/portfolio`);
    return res.success ? res.data : { positions: [], balance: 0, totalInvested: 0 };
  },

  deposit: async (amount: number) => {
    const res = await fetchJson(`${API_URL}/portfolio/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return res;
  },

  withdraw: async (amount: number) => {
    const res = await fetchJson(`${API_URL}/portfolio/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return res;
  },

  // Trade
  buy: async (securityId: string, quantity: number) => {
    const res = await fetchJson(`${API_URL}/trade/buy`, {
      method: 'POST',
      body: JSON.stringify({ securityId, quantity }),
    });
    return res;
  },

  sell: async (securityId: string, quantity: number) => {
    const res = await fetchJson(`${API_URL}/trade/sell`, {
      method: 'POST',
      body: JSON.stringify({ securityId, quantity }),
    });
    return res;
  },

  // Markets
  getMarkets: async () => {
    const res = await fetchJson(`${API_URL}/markets`);
    return res.success ? res.data : [];
  },

  getSecurityById: async (id: string) => {
    const res = await fetchJson(`${API_URL}/markets/${id}`);
    return res.success ? res.data : null;
  },

  seedSecurities: async () => {
    const res = await fetchJson(`${API_URL}/markets/seed`, {
      method: 'POST',
    });
    return res;
  },

  // Social
  getSocialPosts: async () => {
    const res = await fetchJson(`${API_URL}/social`);
    return res.success ? res.data : [];
  },

  createPost: async (content: string, tags: string[] = []) => {
    const res = await fetchJson(`${API_URL}/social`, {
      method: 'POST',
      body: JSON.stringify({ content, tags }),
    });
    return res;
  },

  toggleLike: async (postId: string) => {
    const res = await fetchJson(`${API_URL}/social/${postId}/like`, {
      method: 'PUT',
    });
    return res;
  },

  addComment: async (postId: string, content: string) => {
    const res = await fetchJson(`${API_URL}/social/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return res;
  },

  toggleFollow: async (userId: string) => {
    const res = await fetchJson(`${API_URL}/social/follow/${userId}`, {
      method: 'PUT',
    });
    return res;
  },

  // Admin
  getSystemHealth: async (): Promise<SystemStats> => {
    const res = await fetchJson(`${API_URL}/admin/system`);
    return res.success ? res.data : {
      status: 'Offline',
      cpuLoad: '0%',
      memoryUsage: '0%',
      activeUsers: 0,
      totalUsers: 0,
      totalPortfolios: 0,
      totalAUM: 0,
      dbLatency: '0ms',
      uptime: '0%',
    };
  },

  getUsers: async () => {
    const res = await fetchJson(`${API_URL}/admin/users`);
    return res.success ? res.data : [];
  },

  getUserById: async (userId: string) => {
    const res = await fetchJson(`${API_URL}/admin/user/${userId}`);
    return res.success ? res.data : null;
  },

  // Risk Assessment (Mock endpoint - can be implemented later)
  getTransactions: async () => {
    const res = await fetchJson(`${API_URL}/portfolio/transactions`);
    return res;
  },

  // Alerts
  getAlerts: async () => {
    const res = await fetchJson(`${API_URL}/alerts`);
    return res.success ? res.data : [];
  },

  createAlert: async (stockSymbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const res = await fetchJson(`${API_URL}/alerts`, {
      method: 'POST',
      body: JSON.stringify({ stockSymbol, targetPrice, condition }),
    });
    return res;
  },

  deleteAlert: async (alertId: string) => {
    const res = await fetchJson(`${API_URL}/alerts/${alertId}`, {
      method: 'DELETE',
    });
    return res;
  },

  getRiskMetrics: async (portfolioId: string): Promise<RiskMetrics> => {
    // This would call a risk assessment endpoint if implemented
    // For now, return mock data
    return {
      beta: 1.12,
      standardDeviation: 14.5,
      sharpeRatio: 1.8,
      var: 5.2,
      recommendations: ['Reduce Crypto Exposure', 'Hedging Required']
    };
  },

  // Sync Broker (Mock endpoint)
  syncBroker: async () => {
    // This would call a sync endpoint if implemented
    return { success: true, message: 'Synced with broker' };
  },
};
