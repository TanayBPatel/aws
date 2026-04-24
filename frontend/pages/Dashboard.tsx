import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Plus, ArrowDown, ArrowUp, Star, Bell, Trash2, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { TransferModal } from '../components/TransferModal';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PortfolioPosition {
  id: string;
  symbol: string;
  type: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'holdings' | 'watchlist' | 'alerts'>('holdings');
  const [portfolio, setPortfolio] = useState<{ balance: number; positions: PortfolioPosition[]; totalInvested: number }>({
    balance: 0,
    positions: [],
    totalInvested: 0,
  });
  const [markets, setMarkets] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      const data = await api.getPortfolio();
      if (data) {
        setPortfolio(data);
        // Generate strategies from positions
        generateStrategies(data.positions);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch markets data
  const fetchMarkets = async () => {
    try {
      const marketsData = await api.getMarkets();
      if (marketsData) {
        setMarkets(marketsData);
      }
    } catch (error) {
      console.error('Failed to fetch markets:', error);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const alertsData = await api.getAlerts();
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  // Load watchlist from localStorage
  const loadWatchlist = () => {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    } else {
      // Initialize with first 5 stocks
      const initial = markets.slice(0, 5).map((s: any) => s.id);
      setWatchlist(initial);
      localStorage.setItem('watchlist', JSON.stringify(initial));
    }
  };

  // Generate strategies from portfolio positions
  const generateStrategies = (positions: PortfolioPosition[]) => {
    if (positions.length < 2) return [];

    const cryptoPositions = positions.filter(p => p.type === 'crypto').slice(0, 2);
    const stockPositions = positions.filter(p => p.type === 'stock').slice(0, 2);

    const newStrategies = [];

    if (cryptoPositions.length >= 2) {
      newStrategies.push({
        id: 'strategy-crypto-1',
        name: `${cryptoPositions[0].symbol} + ${cryptoPositions[1].symbol}`,
        pair: `${cryptoPositions[0].symbol} + ${cryptoPositions[1].symbol}`,
        balance: (cryptoPositions[0].totalValue || 0) + (cryptoPositions[1].totalValue || 0),
        activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        icon1: cryptoPositions[0].symbol.charAt(0),
        icon2: cryptoPositions[1].symbol.charAt(0),
        symbol1: cryptoPositions[0].symbol,
        symbol2: cryptoPositions[1].symbol,
      });
    }

    if (stockPositions.length >= 2) {
      newStrategies.push({
        id: 'strategy-stock-1',
        name: `${stockPositions[0].symbol} + ${stockPositions[1].symbol}`,
        pair: `${stockPositions[0].symbol} + ${stockPositions[1].symbol}`,
        balance: (stockPositions[0].totalValue || 0) + (stockPositions[1].totalValue || 0),
        activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        icon1: stockPositions[0].symbol.charAt(0),
        icon2: stockPositions[1].symbol.charAt(0),
        symbol1: stockPositions[0].symbol,
        symbol2: stockPositions[1].symbol,
      });
    }

    setStrategies(newStrategies);
  };

  useEffect(() => {
    fetchPortfolio();
    fetchMarkets();
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (markets.length > 0) {
      loadWatchlist();
    }
  }, [markets]);

  // Refresh portfolio when modal closes (after deposit/withdraw)
  const handleTransferSuccess = () => {
    fetchPortfolio();
  };

  // Open transfer modal
  const openTransfer = (type: 'deposit' | 'withdraw') => {
    setTransferType(type);
    setIsTransferModalOpen(true);
  };

  // Toggle watchlist
  const toggleWatchlist = (stockId: string) => {
    const newWatchlist = watchlist.includes(stockId)
      ? watchlist.filter(id => id !== stockId)
      : [...watchlist, stockId];
    setWatchlist(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
  };

  // Remove strategy
  const removeStrategy = (strategyId: string) => {
    setStrategies(strategies.filter(s => s.id !== strategyId));
  };

  // Delete alert
  const deleteAlert = async (alertId: string) => {
    try {
      await api.deleteAlert(alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const watchlistStocks = markets.filter(stock => watchlist.includes(stock.id));
  const triggeredAlerts = alerts.filter((a: any) => a.isTriggered);
  const activeAlerts = alerts.filter((a: any) => !a.isTriggered);

  // Calculate total portfolio value
  const totalPortfolioValue = portfolio.positions.reduce((sum, pos) => sum + pos.totalValue, 0) + portfolio.balance;
  const totalPnL = portfolio.positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalPnLPercent = portfolio.totalInvested > 0 ? (totalPnL / portfolio.totalInvested) * 100 : 0;

  // Mock weekly data for chart
  const weeklyData = [100, 110, 105, 115, 120, 118, totalPnLPercent + 100];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgDark">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 font-sans">
      {/* Header */}
      <header className="flex justify-between items-start pt-2 px-2">
        <div className="w-12"></div> {/* Spacer instead of button */}
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight text-textPrimary">Hello, {user?.name || 'User'}!</h1>
          <p className="text-xs text-textSecondary font-medium mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => navigate('/settings')} className="w-12 h-12 bg-cardDark rounded-full flex items-center justify-center border border-borderBase hover:bg-surfaceLight transition-colors">
          <UserIcon size={24} className="text-textPrimary" />
        </button>
      </header>

      {/* My Wallets */}
      <section>
        <div className="flex justify-between items-end mb-4 px-2">
          <h2 className="text-lg font-medium text-textPrimary">My wallets</h2>
          <button className="text-sm text-textSecondary hover:text-textPrimary transition-colors">See more</button>
        </div>

        {/* Main Wallet Card */}
        <Card className="bg-cardDark border-none p-6 relative overflow-hidden h-[200px] mx-1 mb-4 shadow-xl">
          {/* Background Gradient */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-accentPurple/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="inline-block">
              <div className="bg-surfaceLighter text-textPrimary text-xs font-medium px-3 py-1.5 rounded-full inline-block backdrop-blur-sm mb-1 border border-borderBase">
                ₹{Math.floor(portfolio.balance).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex items-end justify-between w-full mt-auto">
              <div className="mb-1">
                <h3 className="text-[34px] font-semibold text-textPrimary leading-none mb-2 tracking-tight">
                  ₹{portfolio.balance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-textSecondary">24h %</span>
                  <span className={`font-medium ${totalPnLPercent >= 0 ? 'text-accentLime' : 'text-error'}`}>
                    {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Custom Bar Chart */}
              <div className="h-16 w-32 flex items-end justify-between gap-1.5 pb-1">
                {weeklyData.map((val, i) => {
                  const height = `${Math.min(Math.max((val / Math.max(...weeklyData)) * 100, 20), 100)}%`;
                  const isMax = i === weeklyData.length - 1;
                  return (
                    <div key={i} className="flex flex-col items-center justify-end h-full w-full gap-1">
                      <div
                        className={`w-2 rounded-sm ${isMax ? 'bg-accentPurple' : 'bg-surfaceLighter'}`}
                        style={{ height: height }}
                      ></div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Days Labels */}
            <div className="absolute bottom-2 right-6 flex gap-3.5 text-[9px] text-textSecondary font-medium w-32 justify-between">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 px-1">
          <button
            onClick={() => openTransfer('deposit')}
            className="flex items-center justify-center gap-2 bg-cardDark border border-borderBase py-3 rounded-xl hover:bg-surfaceLight transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-accentLime/10 text-accentLime flex items-center justify-center group-hover:bg-accentLime group-hover:text-bgDark transition-colors">
              <ArrowDown size={18} />
            </div>
            <span className="text-textPrimary font-medium text-sm">Deposit</span>
          </button>
          <button
            onClick={() => openTransfer('withdraw')}
            className="flex items-center justify-center gap-2 bg-cardDark border border-borderBase py-3 rounded-xl hover:bg-surfaceLight transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-surfaceLighter text-textPrimary flex items-center justify-center group-hover:bg-textPrimary group-hover:text-bgDark transition-colors">
              <ArrowUp size={18} />
            </div>
            <span className="text-textPrimary font-medium text-sm">Withdraw</span>
          </button>
        </div>
      </section>

      {/* Active Strategies */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-medium text-textPrimary">Active strategies</h2>
          <button
            onClick={() => setIsStrategyModalOpen(true)}
            className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight transition-colors"
          >
            <Plus size={20} className="text-textPrimary" />
          </button>
        </div>

        <div className="space-y-3 px-1">
          {strategies.length > 0 ? (
            strategies.map(strategy => (
              <Card key={strategy.id} className="bg-cardDark border border-borderBase p-5 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-accentLime/5 blur-[40px] rounded-full pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center relative w-14 h-10">
                      <div className="w-10 h-10 rounded-full bg-surfaceLighter flex items-center justify-center border-[3px] border-cardDark z-20">
                        <span className="font-bold text-sm text-textPrimary">{strategy.icon1}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-surfaceLighter flex items-center justify-center border-[3px] border-cardDark absolute left-6 z-10">
                        <span className="text-textPrimary font-bold text-sm">{strategy.icon2}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-textPrimary text-base">{strategy.name}</h3>
                      <p className="text-xs text-textSecondary mt-0.5">{strategy.pair}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStrategy(strategy.id)}
                    className="w-9 h-9 rounded-full bg-surfaceLight flex items-center justify-center text-textSecondary hover:text-error transition-colors border border-borderBase"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <p className="text-xs text-textSecondary mb-1">Balance</p>
                    <p className="text-2xl font-medium text-textPrimary tracking-tight">
                      ₹{Math.floor(strategy.balance).toLocaleString('en-IN')}
                      <span className="text-lg text-textSecondary">.{strategy.balance.toFixed(2).split('.')[1]}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-textSecondary mb-1">Active until</p>
                    <p className="text-sm text-textPrimary font-medium">{strategy.activeUntil}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-textSecondary text-sm">
              <p>No active strategies. Buy at least 2 stocks/crypto to create strategies.</p>
            </div>
          )}
        </div>
      </section>

      {/* Assets / Watchlist / Alerts Tabs */}
      <section>
        <div className="flex gap-6 mb-4 px-3 border-b border-borderBase overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`pb-3 text-lg font-medium transition-all whitespace-nowrap ${activeTab === 'holdings' ? 'text-textPrimary border-b-2 border-accentLime' : 'text-textSecondary'}`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`pb-3 text-lg font-medium transition-all whitespace-nowrap ${activeTab === 'watchlist' ? 'text-textPrimary border-b-2 border-accentLime' : 'text-textSecondary'}`}
          >
            Watchlist
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 text-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'alerts' ? 'text-textPrimary border-b-2 border-accentLime' : 'text-textSecondary'}`}
          >
            Alerts
            {triggeredAlerts.length > 0 && <span className="w-2 h-2 rounded-full bg-accentLime animate-pulse"></span>}
          </button>
        </div>

        <div className="space-y-1 px-1 min-h-[300px]">
          {activeTab === 'holdings' && (
            portfolio.positions.length > 0 ? (
              portfolio.positions.map(position => (
                <div
                  key={position.id}
                  onClick={() => navigate(`/stock/${position.security?.id || position.id}`)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-transparent hover:bg-surfaceLight cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold relative overflow-hidden ${position.symbol === 'ETH' ? 'bg-[#627EEA]/20 text-[#627EEA]' :
                        position.symbol === 'SOL' ? 'bg-[#9945FF]/20 text-[#9945FF]' :
                          position.symbol === 'BTC' ? 'bg-[#F7931A]/20 text-[#F7931A]' :
                            'bg-surfaceLighter text-textPrimary'
                      }`}>
                      <span className="z-10">{position.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-textPrimary text-base">{position.symbol}</h3>
                      <p className="text-xs text-textSecondary">Qty: {position.quantity.toFixed(4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-textPrimary text-base">₹{position.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p className={`text-xs ${position.pnl >= 0 ? 'text-accentLime' : 'text-error'}`}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-textSecondary">
                <p>No holdings yet. Start trading!</p>
              </div>
            )
          )}

          {activeTab === 'watchlist' && (
            markets.length > 0 ? (
              <div className="space-y-3">
                {markets.map(stock => {
                  const isInWatchlist = watchlist.includes(stock.id);
                  return (
                    <div
                      key={stock.id}
                      onClick={() => navigate(`/stock/${stock.id}`)}
                      className="flex items-center justify-between p-4 rounded-2xl bg-cardDark border border-borderBase hover:border-textSecondary/20 cursor-pointer transition-all mb-3 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <h3 className="font-medium text-textPrimary text-base">{stock.symbol}</h3>
                          <p className="text-xs text-textSecondary">{stock.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium text-textPrimary text-base">₹{stock.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(stock.id);
                          }}
                          className="p-1 hover:bg-surfaceLight rounded-full transition-colors"
                        >
                          <Star size={20} className={isInWatchlist ? 'text-accentLime fill-accentLime' : 'text-textSecondary'} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-textSecondary">
                <p>No watchlist items yet.</p>
              </div>
            )
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {triggeredAlerts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-textPrimary font-medium mb-2 px-2">Triggered</h4>
                  {triggeredAlerts.map((alert: any) => (
                    <Card key={alert.id || alert._id} className="bg-cardDark border border-accentLime/30 p-4 mb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium capitalize text-textPrimary">{alert.stockSymbol} {alert.condition} ₹{alert.targetPrice}</p>
                          <p className="text-xs text-textSecondary mt-1">Triggered</p>
                        </div>
                        <Bell size={20} className="text-accentLime" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeAlerts.length > 0 && (
                <div>
                  <h4 className="text-textPrimary font-medium mb-2 px-2">Active</h4>
                  {activeAlerts.map((alert: any) => (
                    <Card key={alert.id || alert._id} className="bg-cardDark border border-borderBase p-4 mb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium capitalize text-textPrimary">{alert.stockSymbol} {alert.condition} ₹{alert.targetPrice}</p>
                          <p className="text-xs text-textSecondary mt-1">Waiting</p>
                        </div>
                        <button
                          onClick={() => deleteAlert(alert.id || alert._id)}
                          className="w-8 h-8 rounded-full bg-surfaceLight flex items-center justify-center hover:bg-surfaceLighter transition-colors"
                        >
                          <Trash2 size={14} className="text-textSecondary" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {alerts.length === 0 && (
                <div className="text-center py-12 text-textSecondary">
                  <p>No alerts set yet. Click the bell icon on any stock to set an alert.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        type={transferType}
        onClose={() => setIsTransferModalOpen(false)}
        currentBalance={portfolio.balance}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
};
