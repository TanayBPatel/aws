
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Download, Link, Check, ShieldAlert } from 'lucide-react';
import { MOCK_POSITIONS } from '../services/mockData';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';

export const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const totalBalance = MOCK_POSITIONS.reduce((acc, curr) => acc + curr.totalValue, 0);
  const totalPnL = MOCK_POSITIONS.reduce((acc, curr) => acc + curr.pnl, 0);
  const totalPnLPercent = (totalPnL / (totalBalance - totalPnL)) * 100;

  // Allocation
  const cryptoValue = MOCK_POSITIONS.filter(p => p.type === 'crypto').reduce((acc, curr) => acc + curr.totalValue, 0);
  const stockValue = MOCK_POSITIONS.filter(p => p.type === 'stock').reduce((acc, curr) => acc + curr.totalValue, 0);
  const cryptoPercent = (cryptoValue / totalBalance) * 100;
  const stockPercent = (stockValue / totalBalance) * 100;

  // UC12: Sync Broker
  const handleSync = async () => {
    setToast('Connecting to broker...');
    await api.syncBroker();
    setTimeout(() => setToast('Synced with Zerodha successfully!'), 1000);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDownloadReport = () => {
    setToast('Generating Report...');
    setTimeout(() => setToast('Report downloaded.'), 2000);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6 pb-20 font-sans min-h-screen relative">
      {toast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-cardDark text-textPrimary px-6 py-3 rounded-full shadow-2xl border border-borderBase z-50 animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-2">
              <Check size={16} className="text-accentLime" />
              <span className="text-sm font-medium">{toast}</span>
          </div>
      )}

      <header className="px-2 pt-2 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-textPrimary">Portfolio</h1>
        <div className="flex gap-2">
            {/* UC11 Link */}
            <button 
                onClick={() => navigate('/portfolio/risk')}
                className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight text-textPrimary transition-colors"
                title="Risk Assessment"
            >
                <ShieldAlert size={20} />
            </button>
            {/* UC12 Sync Button */}
            <button 
                onClick={handleSync}
                className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight text-textPrimary transition-colors"
                title="Sync Broker"
            >
                <Link size={20} />
            </button>
            <button 
                onClick={handleDownloadReport}
                className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight text-textPrimary transition-colors"
                title="Download Report"
            >
                <Download size={20} />
            </button>
        </div>
      </header>

      <Card className="bg-cardDark border-none p-6 mx-1 relative overflow-hidden shadow-xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
         <div className="relative z-10 text-center">
             <p className="text-textSecondary text-sm mb-2 font-medium">Total Balance</p>
             <h2 className="text-4xl font-semibold text-textPrimary tracking-tight mb-2">
                ₹{totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                <span className="text-2xl text-textSecondary">.{(totalBalance % 1).toFixed(2).split('.')[1]}</span>
             </h2>
             <div className="flex justify-center items-center gap-2">
                 <span className={`px-2 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${totalPnL >= 0 ? 'bg-accentLime/10 text-accentLime' : 'bg-error/10 text-error'}`}>
                    {totalPnL >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    ₹{Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                 </span>
                 <span className={`text-sm font-medium ${totalPnLPercent >= 0 ? 'text-accentLime' : 'text-error'}`}>
                    ({totalPnLPercent.toFixed(2)}%)
                 </span>
             </div>
         </div>
      </Card>

      <section className="px-2">
        <h3 className="text-textPrimary font-medium mb-3">Asset Allocation</h3>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-surfaceLighter mb-2">
            <div style={{ width: `${cryptoPercent}%` }} className="h-full bg-accentPurple"></div>
            <div style={{ width: `${stockPercent}%` }} className="h-full bg-primary"></div>
        </div>
        <div className="flex justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accentPurple"></div>
                <span className="text-textSecondary">Crypto ({cryptoPercent.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-textSecondary">Stocks ({stockPercent.toFixed(0)}%)</span>
            </div>
        </div>
      </section>

      <section className="px-1 pt-2">
          <div className="flex justify-between items-center px-2 mb-4">
              <h3 className="text-lg font-medium text-textPrimary">Your Holdings</h3>
          </div>
          
          <div className="space-y-3">
              {MOCK_POSITIONS.map(position => (
                  <div 
                    key={position.id}
                    onClick={() => navigate(`/stock/${position.stockId}`)}
                    className="bg-cardDark p-4 rounded-2xl border border-borderBase flex justify-between items-center cursor-pointer hover:bg-surfaceLight transition-colors"
                  >
                      <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                              position.type === 'crypto' 
                                ? 'bg-accentPurple/20 text-accentPurple' 
                                : 'bg-primary/20 text-primary'
                          }`}>
                              {position.symbol[0]}
                          </div>
                          <div>
                              <h4 className="text-textPrimary font-medium">{position.symbol}</h4>
                              <p className="text-xs text-textSecondary">{position.quantity} units</p>
                          </div>
                      </div>

                      <div className="text-right">
                          <p className="text-textPrimary font-medium">₹{position.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                          <p className={`text-xs font-medium ${position.pnl >= 0 ? 'text-accentLime' : 'text-error'}`}>
                              {position.pnl >= 0 ? '+' : ''}₹{Math.abs(position.pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                      </div>
                  </div>
              ))}
          </div>
      </section>
    </div>
  );
};
