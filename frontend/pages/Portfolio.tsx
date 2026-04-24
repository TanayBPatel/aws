import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, ArrowUpRight, ArrowDownRight, Download, Link, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { api } from '../services/api';

export const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgDark">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgDark">
        <div className="text-textPrimary">Failed to load portfolio</div>
      </div>
    );
  }

  const positions = portfolio.positions || [];
  const balance = portfolio.balance || 0;
  const totalInvested = portfolio.totalInvested || 0;

  // Current value of holdings (sum of current market value)
  const currentValue = positions.reduce((acc: number, curr: any) => acc + (curr.totalValue || 0), 0);

  // Total portfolio value = current holdings value + cash balance
  const totalPortfolioValue = currentValue + balance;

  // Profit/Loss
  const totalPnL = currentValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Calculate Allocation based on invested amount only (not current value)
  const cryptoInvested = positions
    .filter((p: any) => p.type === 'crypto')
    .reduce((acc: number, curr: any) => acc + ((curr.avgPrice || 0) * (curr.quantity || 0)), 0);

  const stockInvested = positions
    .filter((p: any) => p.type === 'stock')
    .reduce((acc: number, curr: any) => acc + ((curr.avgPrice || 0) * (curr.quantity || 0)), 0);

  const cryptoPercent = totalInvested > 0 ? (cryptoInvested / totalInvested) * 100 : 0;
  const stockPercent = totalInvested > 0 ? (stockInvested / totalInvested) * 100 : 0;

  const handleSync = async () => {
    setToast('Syncing with broker...');
    try {
      await api.syncBroker();
      await fetchPortfolio();
      setTimeout(() => setToast('Portfolio synced successfully!'), 1500);
    } catch (error) {
      setTimeout(() => setToast('Sync failed'), 1500);
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownloadReport = () => {
    try {
      // Create CSV report
      const csvRows = [
        ['Portfolio Report', '', ''],
        ['Generated:', new Date().toLocaleString('en-IN'), ''],
        ['', '', ''],
        ['Summary', '', ''],
        ['Total Invested', `₹${totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, ''],
        ['Current Value', `₹${currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, ''],
        ['Cash Balance', `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, ''],
        ['Total Portfolio Value', `₹${totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, ''],
        ['Total P&L', `₹${totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, ''],
        ['Total P&L %', `${totalPnLPercent.toFixed(2)}%`, ''],
        ['', '', ''],
        ['Holdings', '', ''],
        ['Symbol', 'Quantity', 'Avg Price', 'Current Price', 'Invested', 'Current Value', 'P&L', 'P&L %'],
      ];

      positions.forEach((pos: any) => {
        const invested = (pos.avgPrice || 0) * (pos.quantity || 0);
        csvRows.push([
          pos.symbol || '',
          (pos.quantity || 0).toString(),
          `₹${(pos.avgPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          `₹${(pos.currentPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          `₹${invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          `₹${(pos.totalValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          `₹${(pos.pnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          `${(pos.pnlPercent || 0).toFixed(2)}%`,
        ]);
      });

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `portfolio-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast('Portfolio report downloaded!');
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast('Failed to generate report');
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans min-h-screen relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-cardDark text-textPrimary px-6 py-3 rounded-full shadow-2xl border border-borderBase z-50 animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-2">
          <Check size={16} className="text-accentLime" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="px-2 pt-2 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-textPrimary">Portfolio</h1>
        <div className="flex gap-2">
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

      {/* Portfolio Summary Card */}
      <Card className="bg-cardDark border-none p-6 mx-1 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-textSecondary text-sm mb-4 font-medium text-center">Portfolio Summary</p>

          {/* Invested vs Current Value */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-surfaceLight/50 p-4 rounded-xl border border-borderBase">
              <p className="text-textSecondary text-xs mb-1 font-medium">Total Invested</p>
              <p className="text-2xl font-semibold text-textPrimary tracking-tight">
                ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                <span className="text-lg text-textSecondary">.{((totalInvested % 1) * 100).toFixed(0).padStart(2, '0')}</span>
              </p>
            </div>
            <div className="bg-surfaceLight/50 p-4 rounded-xl border border-borderBase">
              <p className="text-textSecondary text-xs mb-1 font-medium">Current Value</p>
              <p className="text-2xl font-semibold text-textPrimary tracking-tight">
                ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                <span className="text-lg text-textSecondary">.{((currentValue % 1) * 100).toFixed(0).padStart(2, '0')}</span>
              </p>
            </div>
          </div>

          {/* Total Portfolio Value */}
          <div className="text-center mb-4">
            <p className="text-textSecondary text-xs mb-1 font-medium">Total Portfolio Value</p>
            <h2 className="text-3xl font-semibold text-textPrimary tracking-tight mb-2">
              ₹{totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              <span className="text-xl text-textSecondary">.{((totalPortfolioValue % 1) * 100).toFixed(0).padStart(2, '0')}</span>
            </h2>
          </div>

          {/* P&L */}
          <div className="flex justify-center items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${totalPnL >= 0 ? 'bg-accentLime/10 text-accentLime' : 'bg-error/10 text-error'}`}>
              {totalPnL >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              ₹{Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className={`text-sm font-medium ${totalPnLPercent >= 0 ? 'text-accentLime' : 'text-error'}`}>
              ({totalPnLPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </Card>

      {/* Asset Allocation Bars */}
      <section className="px-2">
        <h3 className="text-textPrimary font-medium mb-3">Asset Allocation (Based on Invested Amount)</h3>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-surfaceLighter mb-2">
          <div style={{ width: `${cryptoPercent}%` }} className="h-full bg-accentPurple"></div>
          <div style={{ width: `${stockPercent}%` }} className="h-full bg-primary"></div>
        </div>
        <div className="flex justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accentPurple"></div>
            <span className="text-textSecondary">Crypto ({cryptoPercent.toFixed(1)}%)</span>
            <span className="text-textSecondary">₹{cryptoInvested.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-textSecondary">Stocks ({stockPercent.toFixed(1)}%)</span>
            <span className="text-textSecondary">₹{stockInvested.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </section>

      {/* Holdings List */}
      <section className="px-1 pt-2">
        <div className="flex justify-between items-center px-2 mb-4">
          <h3 className="text-lg font-medium text-textPrimary">Your Holdings</h3>
        </div>

        <div className="space-y-3">
          {positions.length > 0 ? (
            positions.map((position: any) => (
              <div
                key={position.id}
                onClick={() => navigate(`/stock/${position.security?.id || position.id}`)}
                className="bg-cardDark p-4 rounded-2xl border border-borderBase flex justify-between items-center cursor-pointer hover:bg-surfaceLight transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${position.type === 'crypto'
                      ? 'bg-accentPurple/20 text-accentPurple'
                      : 'bg-primary/20 text-primary'
                    }`}>
                    {position.symbol?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h4 className="text-textPrimary font-medium">{position.symbol}</h4>
                    <p className="text-xs text-textSecondary">{position.quantity} units</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-textPrimary font-medium">₹{(position.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  <p className={`text-xs font-medium ${(position.pnl || 0) >= 0 ? 'text-accentLime' : 'text-error'}`}>
                    {(position.pnl || 0) >= 0 ? '+' : ''}₹{Math.abs(position.pnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-textSecondary">
              <p>No holdings yet. Start trading!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
