import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { api } from '../frontend/services/api';

const FILTERS = ['All', 'Crypto', 'Stocks', 'Gainers'];

export const Markets: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const data = await api.getMarkets();
      setStocks(data || []);
    } catch (error) {
      console.error('Failed to fetch markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stock.symbol?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Crypto') return stock.type === 'crypto';
    if (activeFilter === 'Stocks') return stock.type === 'stock';
    if (activeFilter === 'Gainers') return (stock.changePercent || 0) > 0;
    return true;
  });

  const trendingStocks = [...stocks].sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0)).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgDark">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 font-sans min-h-screen">
      {/* Header */}
      <header className="px-2 pt-2">
        <h1 className="text-2xl font-semibold text-textPrimary mb-6">Markets</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={20} className="text-textSecondary" />
            </div>
            <input 
                type="text" 
                placeholder="Search coin, token, or stock..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cardDark border border-borderBase text-textPrimary placeholder-textSecondary rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-lg"
            />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {FILTERS.map(filter => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border border-transparent ${
                        activeFilter === filter 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-cardDark text-textSecondary hover:bg-surfaceLight hover:text-textPrimary border-borderBase'
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>
      </header>

      {/* Trending Section */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-lg font-medium text-textPrimary">Top Movers</h2>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-2 pb-4">
            {trendingStocks.map(stock => (
                <div 
                    key={stock.id}
                    onClick={() => navigate(`/stock/${stock.id}`)}
                    className="min-w-[160px] bg-cardDark p-4 rounded-2xl border border-borderBase cursor-pointer hover:bg-surfaceLight transition-colors relative overflow-hidden shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            stock.symbol === 'ETH' ? 'bg-[#627EEA]/20 text-[#627EEA]' :
                            stock.symbol === 'BTC' ? 'bg-[#F7931A]/20 text-[#F7931A]' :
                            'bg-surfaceLighter text-textPrimary'
                        }`}>
                            {stock.symbol?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-textPrimary truncate">{stock.symbol || 'N/A'}</p>
                        </div>
                    </div>
                    <p className="text-lg font-semibold text-textPrimary mb-1">
                        ₹{stock.price?.toLocaleString('en-IN', {minimumFractionDigits: 2}) || '0.00'}
                    </p>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                        (stock.changePercent || 0) >= 0 ? 'text-accentLime' : 'text-error'
                    }`}>
                        {(stock.changePercent || 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(stock.changePercent || 0).toFixed(2)}%
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* All Stocks */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-lg font-medium text-textPrimary">All Markets</h2>
        </div>

        <div className="space-y-2 px-2">
            {filteredStocks.length > 0 ? (
                filteredStocks.map(stock => (
                    <div 
                        key={stock.id}
                        onClick={() => navigate(`/stock/${stock.id}`)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-cardDark border border-borderBase hover:bg-surfaceLight cursor-pointer transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                                stock.symbol === 'ETH' ? 'bg-[#627EEA]/20 text-[#627EEA]' :
                                stock.symbol === 'BTC' ? 'bg-[#F7931A]/20 text-[#F7931A]' :
                                stock.type === 'crypto' ? 'bg-accentPurple/20 text-accentPurple' :
                                'bg-surfaceLighter text-textPrimary'
                            }`}>
                                {stock.symbol?.charAt(0) || 'S'}
                            </div>
                            <div>
                                <h3 className="font-medium text-textPrimary text-base">{stock.symbol || 'N/A'}</h3>
                                <p className="text-xs text-textSecondary">{stock.name || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-textPrimary text-base">
                                ₹{stock.price?.toLocaleString('en-IN', {minimumFractionDigits: 2}) || '0.00'}
                            </p>
                            <div className={`flex items-center justify-end gap-1 text-xs font-medium ${
                                (stock.changePercent || 0) >= 0 ? 'text-accentLime' : 'text-error'
                            }`}>
                                {(stock.changePercent || 0) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(stock.changePercent || 0).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 text-textSecondary">
                    <p>No stocks found</p>
                </div>
            )}
        </div>
      </section>
    </div>
  );
};
