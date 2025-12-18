import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Bell } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { getMarketInsight } from '../services/geminiService';
import { BuySellModal } from '../components/BuySellModal';
import { AlertModal } from '../components/AlertModal';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';

const RANGES = ['1h', '24h', 'Week', 'Month', '3 Mo'];

export const StockDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedRange, setSelectedRange] = useState<string>('1h');
  const [stock, setStock] = useState<any>(undefined);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    if (id) {
      fetchStockDetails();
      fetchPortfolio();
    }
  }, [id]);

  const fetchStockDetails = async () => {
    try {
      const data = await api.getSecurityById(id!);
      if (data) {
        setStock(data);
        // Generate mock chart data
        const chartData = Array.from({ length: 30 }, (_, i) => ({
          time: i,
          value: data.currentPrice * (1 + (Math.random() - 0.5) * 0.1),
        }));
        setStock({ ...data, data: chartData, change: data.currentPrice * 0.05, changePercent: 5 });
        if (data.name && data.currentPrice) {
          getMarketInsight(data.name, data.currentPrice).then(setInsight);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-textPrimary">Loading...</div>;
  }

  if (!stock) {
    return <div className="p-8 text-center text-textPrimary">Stock not found</div>;
  }

  // Check if user owns this stock
  const existingPosition = portfolio?.positions?.find((p: any) =>
    (p.security?.id || p.security?._id || p.security) === id || p.symbol === stock.symbol
  );

  const openTradeModal = (type: 'buy' | 'sell') => {
    setTradeType(type);
    setIsTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    fetchPortfolio();
    fetchStockDetails();
  };

  // Generate chart data if not present
  const chartData = stock.data || Array.from({ length: 30 }, (_, i) => ({
    time: i,
    value: stock.currentPrice * (1 + (Math.random() - 0.5) * 0.1),
  }));

  return (
    <div className="min-h-screen bg-bgDark pb-32 font-sans relative transition-colors duration-300">
      {/* Nav */}
      <header className="flex justify-between items-center pt-2 mb-6 px-2">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight text-textPrimary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="font-semibold text-lg text-textPrimary">{stock.name}</h1>
          <p className="text-xs text-textSecondary font-medium uppercase tracking-wider">{stock.symbol}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight text-textPrimary transition-colors"
          >
            <Bell size={20} />
          </button>
          <button className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight text-textPrimary transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Price Hero */}
      <div className="text-center mb-8">
        <p className="text-textSecondary text-sm mb-2 font-medium">Market Price</p>
        <h2 className="text-[42px] font-medium text-textPrimary mb-1 tracking-tight leading-tight">
          ₹{Math.floor(stock.currentPrice || stock.price || 0).toLocaleString('en-IN')}
          <span className="text-xl text-textSecondary font-light ml-1">.{(stock.currentPrice || stock.price || 0).toFixed(2).split('.')[1]}</span>
        </h2>
        <div className="flex items-center justify-center gap-2">
          <span className={`text-sm font-medium px-2 py-1 rounded-lg ${(stock.changePercent || 0) >= 0 ? 'text-accentLime' : 'text-error'}`}>
            {(stock.changePercent || 0) >= 0 ? '+' : ''}₹{Math.abs(stock.change || 0).toLocaleString('en-IN')} <span className="ml-1">{(stock.changePercent || 0) > 0 ? '+' : ''}{stock.changePercent || 0}%</span>
          </span>
        </div>
      </div>

      {/* Range Selectors */}
      <div className="flex justify-between bg-cardDark border border-borderBase p-1.5 rounded-[24px] mb-8 mx-1">
        {RANGES.map(range => (
          <button
            key={range}
            onClick={() => setSelectedRange(range)}
            className={`flex-1 py-2 rounded-[20px] text-xs font-medium transition-all duration-200 ${selectedRange === range
                ? 'bg-accentLime text-bgDark shadow-lg shadow-accentLime/10'
                : 'text-textSecondary hover:text-textPrimary'
              }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full -mx-4 mb-6 relative">
        <div className="absolute left-6 top-4 bottom-8 flex flex-col justify-between text-[10px] text-textSecondary opacity-50 pointer-events-none z-10 font-medium">
          <span>₹{((stock.currentPrice || stock.price || 0) * 1.02).toLocaleString('en-IN')}</span>
          <span>₹{((stock.currentPrice || stock.price || 0) * 1.01).toLocaleString('en-IN')}</span>
          <span className="bg-cardDark/50 px-1.5 py-0.5 rounded text-textPrimary backdrop-blur-sm border border-borderBase">₹{Math.floor(stock.currentPrice || stock.price || 0).toLocaleString('en-IN')}</span>
          <span>₹{((stock.currentPrice || stock.price || 0) * 0.99).toLocaleString('en-IN')}</span>
          <span>₹{((stock.currentPrice || stock.price || 0) * 0.98).toLocaleString('en-IN')}</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A4E367" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#A4E367" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="5 5" />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#A4E367"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              isAnimationActive={true}
            />
            <Tooltip
              contentStyle={{ backgroundColor: theme === 'dark' ? '#1A1C1A' : '#FFFFFF', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '12px', color: theme === 'dark' ? '#FFF' : '#000' }}
              itemStyle={{ color: '#A4E367' }}
              cursor={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'Price']}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trading Activity Section */}
      <div className="bg-bgDark px-2 mb-8 transition-colors duration-300">
        <div className="flex justify-between items-center py-4 border-b border-borderBase mb-4">
          <div className="flex flex-col">
            <span className="text-textPrimary font-medium text-lg">Trading Activity</span>
          </div>
          {existingPosition && (
            <div className="text-right">
              <span className={`font-medium text-lg ${(existingPosition.pnl || 0) >= 0 ? 'text-accentLime' : 'text-error'}`}>
                {(existingPosition.pnl || 0) >= 0 ? '+' : ''}₹{Math.abs(existingPosition.pnl || 0).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cardDark p-5 rounded-3xl border border-borderBase shadow-sm">
              <p className="text-textSecondary text-xs mb-2 font-medium uppercase">Market Cap</p>
              <p className="text-xl font-medium text-textPrimary">{stock.marketCap || 'N/A'}</p>
            </div>
            <div className="bg-cardDark p-5 rounded-3xl border border-borderBase shadow-sm">
              <p className="text-textSecondary text-xs mb-2 font-medium uppercase">Type</p>
              <p className="text-xl font-medium text-textPrimary capitalize">{stock.type || 'N/A'}</p>
            </div>
          </div>

          {existingPosition && (
            <div className="bg-cardDark p-5 rounded-3xl border border-borderBase shadow-sm flex justify-between items-center">
              <div>
                <p className="text-textSecondary text-xs mb-1 font-medium uppercase">Your Holdings</p>
                <p className="text-base font-medium text-textPrimary">{existingPosition.quantity} units</p>
              </div>
              <div className="h-8 w-[1px] bg-borderBase"></div>
              <div className="text-right">
                <p className="text-textSecondary text-xs mb-1 font-medium uppercase">Avg Price</p>
                <p className="text-base font-medium text-textPrimary">₹{existingPosition.avgPrice?.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Buy/Sell Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-glassBg backdrop-blur-xl border-t border-borderBase flex gap-4 md:max-w-4xl md:mx-auto z-[60] transition-colors duration-300">
        {existingPosition && existingPosition.quantity > 0 && (
          <button
            onClick={() => openTradeModal('sell')}
            className="flex-1 bg-cardDark border border-borderBase text-textPrimary font-semibold py-4 rounded-xl hover:bg-surfaceLight transition-colors"
          >
            Sell
          </button>
        )}
        <button
          onClick={() => openTradeModal('buy')}
          className={`flex-1 bg-primary text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors ${!existingPosition ? 'w-full' : ''}`}
        >
          Buy {stock.symbol}
        </button>
      </div>

      {/* Trade Modal */}
      {isTradeModalOpen && (
        <BuySellModal
          stock={stock}
          type={tradeType}
          onClose={() => setIsTradeModalOpen(false)}
          existingPosition={existingPosition}
          onSuccess={handleTradeSuccess}
        />
      )}

      {/* Alert Modal */}
      {isAlertModalOpen && (
        <AlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          stock={stock}
        />
      )}
    </div>
  );
};
