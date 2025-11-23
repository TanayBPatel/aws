
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlignLeft, User as UserIcon, Plus, ArrowUpRight, Star, ArrowDown, ArrowUp, Bell, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { MOCK_STRATEGIES, MOCK_ALERTS, MOCK_WALLETS } from '../services/mockData';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TransferModal } from '../components/TransferModal';
import { api } from '../services/api';
import { Position, Stock } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'holdings' | 'watchlist' | 'alerts'>('holdings');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  
  // Real Data State
  const [portfolioData, setPortfolioData] = useState<{positions: Position[], balance: number}>({ positions: [], balance: 0 });
  const [marketData, setMarketData] = useState<Stock[]>([]);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const userId = localStorage.getItem('userId') || '1'; // Default for demo
    setUserName(localStorage.getItem('userName') || 'User');
    
    const loadData = async () => {
        const pf = await api.getPortfolio(userId);
        setPortfolioData(pf);
        const mk = await api.getMarkets();
        setMarketData(mk);
    };
    loadData();
  }, []);

  const openTransfer = (type: 'deposit' | 'withdraw') => {
    setTransferType(type);
    setIsTransferModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-10 font-sans">
      {/* Header */}
      <header className="flex justify-between items-start pt-2 px-2">
        <button className="w-12 h-12 bg-cardDark rounded-full flex items-center justify-center border border-borderBase hover:bg-surfaceLight transition-colors">
            <AlignLeft size={24} className="text-textPrimary" />
        </button>
        <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-textPrimary">Hello, {userName}!</h1>
            <p className="text-xs text-textSecondary font-medium mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
        </div>
        <button onClick={() => navigate('/settings')} className="w-12 h-12 bg-cardDark rounded-full flex items-center justify-center border border-borderBase hover:bg-surfaceLight transition-colors">
            <UserIcon size={24} className="text-textPrimary" />
        </button>
      </header>

      {/* Main Wallet */}
      <section>
        <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-lg font-medium text-textPrimary">My Portfolio</h2>
            <button onClick={() => navigate('/portfolio')} className="text-sm text-textSecondary hover:text-textPrimary transition-colors">See more</button>
        </div>
        
        <Card className="bg-cardDark border-none p-6 relative overflow-hidden h-[200px] mx-1 mb-4 shadow-xl">
             <div className="absolute top-0 right-0 w-48 h-48 bg-accentPurple/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col h-full justify-between relative z-10">
                <div className="inline-block">
                    <div className="bg-surfaceLighter text-textPrimary text-xs font-medium px-3 py-1.5 rounded-full inline-block backdrop-blur-sm mb-1 border border-borderBase">
                        ₹{Math.floor(portfolioData.balance).toLocaleString('en-IN')}
                    </div>
                </div>

                <div className="flex items-end justify-between w-full mt-auto">
                    <div className="mb-1">
                        <h3 className="text-[34px] font-semibold text-textPrimary leading-none mb-2 tracking-tight">
                            ₹{portfolioData.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-textSecondary">Total Value</span>
                        </div>
                    </div>

                    <div className="h-16 w-32 flex items-end justify-between gap-1.5 pb-1">
                         {MOCK_WALLETS[0].weeklyData.map((val, i) => (
                             <div key={i} className="flex flex-col items-center justify-end h-full w-full gap-1">
                                 <div 
                                    className={`w-2 rounded-sm ${i === 6 ? 'bg-accentPurple' : 'bg-surfaceLighter'}`}
                                    style={{ height: `${30 + Math.random() * 60}%` }}
                                 ></div>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </Card>

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

      {/* Strategies (Static for now) */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-lg font-medium text-textPrimary">Active strategies</h2>
            <button className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight transition-colors">
                <Plus size={20} className="text-textPrimary" />
            </button>
        </div>

        <div className="space-y-3 px-1">
            {MOCK_STRATEGIES.map(strategy => (
                <Card key={strategy.id} className="bg-cardDark border border-borderBase p-5 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center relative w-14 h-10">
                                <div className="w-10 h-10 rounded-full bg-surfaceLighter flex items-center justify-center border-[3px] border-cardDark z-20">
                                    <span className={`font-bold text-sm text-primary`}>{strategy.icon1}</span>
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
                    </div>
                </Card>
            ))}
        </div>
      </section>

      {/* Tabbed View */}
      <section>
        <div className="flex gap-6 mb-4 px-3 border-b border-borderBase overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('holdings')} className={`pb-3 text-lg font-medium transition-all whitespace-nowrap ${activeTab === 'holdings' ? 'text-textPrimary border-b-2 border-accentLime' : 'text-textSecondary'}`}>Portfolio</button>
            <button onClick={() => setActiveTab('watchlist')} className={`pb-3 text-lg font-medium transition-all whitespace-nowrap ${activeTab === 'watchlist' ? 'text-textPrimary border-b-2 border-accentLime' : 'text-textSecondary'}`}>Watchlist</button>
            <button onClick={() => setActiveTab('alerts')} className={`pb-3 text-lg font-medium transition-all whitespace-nowrap ${activeTab === 'alerts' ? 'text-textPrimary border-b-2 border-accentLime' : 'text-textSecondary'}`}>Alerts</button>
        </div>

        <div className="space-y-1 px-1 min-h-[300px]">
            {activeTab === 'holdings' && (
                portfolioData.positions.length > 0 ? portfolioData.positions.map(pos => (
                    <div 
                        key={pos.id} 
                        onClick={() => navigate(`/stock/${pos.stockId}`)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-transparent hover:bg-surfaceLight cursor-pointer transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold relative overflow-hidden bg-surfaceLighter text-textPrimary`}>
                                {pos.symbol[0]}
                            </div>
                            <div>
                                <h3 className="font-medium text-textPrimary text-base">{pos.symbol} <span className="text-textSecondary font-normal text-sm ml-1">{pos.name}</span></h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-textPrimary text-base">₹{pos.totalValue.toLocaleString('en-IN', {minimumFractionDigits: 0})}</p>
                            <p className={`text-xs ${pos.pnl >= 0 ? 'text-accentLime' : 'text-error'}`}>
                                {pos.pnl >= 0 ? '+' : ''}₹{Math.abs(pos.pnl).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-textSecondary">
                        No holdings found. Deposit funds to start trading.
                    </div>
                )
            )}

            {activeTab === 'watchlist' && marketData.slice(0, 5).map(stock => (
                 <div key={stock.id} onClick={() => navigate(`/stock/${stock.id}`)} className="flex items-center justify-between p-4 rounded-2xl hover:bg-surfaceLight cursor-pointer transition-colors">
                     <div className="flex items-center gap-4">
                         <div>
                             <h3 className="font-medium text-textPrimary">{stock.symbol}</h3>
                             <p className="text-xs text-textSecondary">{stock.name}</p>
                         </div>
                     </div>
                     <div className="text-right">
                         <p className="font-medium text-textPrimary">₹{stock.price.toLocaleString('en-IN')}</p>
                         <p className={`text-xs ${stock.changePercent >= 0 ? 'text-accentLime' : 'text-error'}`}>
                             {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                         </p>
                     </div>
                 </div>
            ))}

            {activeTab === 'alerts' && (
                <div className="text-center py-10 text-textSecondary">
                    <Bell size={24} className="mx-auto mb-2 opacity-30" />
                    <p>No active alerts.</p>
                </div>
            )}
        </div>
      </section>
      
      <TransferModal 
        isOpen={isTransferModalOpen}
        type={transferType}
        onClose={() => setIsTransferModalOpen(false)}
        currentBalance={portfolioData.balance}
      />
    </div>
  );
};
