import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Download, Check } from 'lucide-react';
import { api } from '../services/api';

export const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Orders' | 'Deposits' | 'Withdrawals'>('All');
  const [toast, setToast] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.getTransactions();
      if (res && res.success) {
        setTransactions(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Orders') return tx.type === 'buy' || tx.type === 'sell';
    if (activeTab === 'Deposits') return tx.type === 'deposit';
    if (activeTab === 'Withdrawals') return tx.type === 'withdraw';
    return true;
  });

  const handleDownloadReport = () => {
    try {
      // Create CSV report
      const csvRows = [
        ['Transaction History Report', '', ''],
        ['Generated:', new Date().toLocaleString('en-IN'), ''],
        ['', '', ''],
        ['Transaction Type', 'Symbol', 'Quantity', 'Price', 'Amount', 'Status', 'Date'],
      ];

      filteredTransactions.forEach(tx => {
        csvRows.push([
          tx.type || '',
          tx.stockSymbol || 'N/A',
          tx.quantity?.toString() || 'N/A',
          tx.priceAtTransaction ? `₹${tx.priceAtTransaction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A',
          `₹${(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          tx.status || 'pending',
          new Date(tx.date).toLocaleString('en-IN'),
        ]);
      });

      // Add summary
      csvRows.push(['', '', '', '', '', '', '']);
      csvRows.push(['Summary', '', '', '', '', '', '']);
      const totalDeposits = filteredTransactions
        .filter(tx => tx.type === 'deposit')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const totalWithdrawals = filteredTransactions
        .filter(tx => tx.type === 'withdraw')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const totalBuy = filteredTransactions
        .filter(tx => tx.type === 'buy')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const totalSell = filteredTransactions
        .filter(tx => tx.type === 'sell')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

      csvRows.push(['Total Deposits', `₹${totalDeposits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, '', '', '', '', '']);
      csvRows.push(['Total Withdrawals', `₹${totalWithdrawals.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, '', '', '', '', '']);
      csvRows.push(['Total Buy Orders', `₹${totalBuy.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, '', '', '', '', '']);
      csvRows.push(['Total Sell Orders', `₹${totalSell.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, '', '', '', '', '']);

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `transaction-history-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast('Transaction history downloaded!');
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast('Failed to generate report');
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgDark">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgDark pb-24 font-sans px-2 transition-colors duration-300 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-cardDark text-textPrimary px-6 py-3 rounded-full shadow-2xl border border-borderBase z-50 animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-2">
          <Check size={16} className="text-accentLime" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <header className="pt-2 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-textPrimary">History</h1>
        <button
          onClick={handleDownloadReport}
          className="w-10 h-10 rounded-full border border-borderBase flex items-center justify-center hover:bg-surfaceLight transition-colors text-textPrimary"
          title="Download Report"
        >
          <Download size={20} />
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
        {['All', 'Orders', 'Deposits', 'Withdrawals'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveTab(filter as any)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border border-transparent ${activeTab === filter
                ? 'bg-textPrimary text-bgDark'
                : 'bg-cardDark text-textSecondary hover:bg-surfaceLight hover:text-textPrimary border-borderBase'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <h3 className="text-textSecondary text-xs font-semibold uppercase tracking-wider mb-2">Recent Activity</h3>

        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(tx => (
            <div key={tx.id} className="bg-cardDark p-4 rounded-2xl border border-borderBase flex items-center justify-between shadow-sm hover:bg-surfaceLight transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'buy' || tx.type === 'deposit'
                    ? 'bg-accentLime/10 text-accentLime'
                    : 'bg-surfaceLighter text-textPrimary'
                  }`}>
                  {tx.type === 'buy' && <ArrowDownRight size={20} />}
                  {tx.type === 'sell' && <ArrowUpRight size={20} />}
                  {tx.type === 'deposit' && <span className="font-bold text-lg">+</span>}
                  {tx.type === 'withdraw' && <span className="font-bold text-lg">-</span>}
                </div>
                <div>
                  <h4 className="text-textPrimary font-medium capitalize">
                    {tx.type} {tx.stockSymbol || 'Funds'}
                  </h4>
                  <p className="text-xs text-textSecondary">
                    {tx.quantity ? `${tx.quantity} @ ₹${tx.priceAtTransaction?.toLocaleString('en-IN') || 0}` : ''}
                    {new Date(tx.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${tx.type === 'buy' || tx.type === 'withdraw' ? 'text-textPrimary' : 'text-accentLime'
                  }`}>
                  {tx.type === 'buy' || tx.type === 'withdraw' ? '-' : '+'}
                  ₹{tx.amount?.toLocaleString('en-IN') || '0'}
                </p>
                <p className={`text-xs capitalize ${tx.status === 'completed' ? 'text-accentLime' : tx.status === 'failed' ? 'text-error' : 'text-textSecondary'
                  }`}>{tx.status || 'pending'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-textSecondary">
            No {activeTab.toLowerCase()} found.
          </div>
        )}
      </div>
    </div>
  );
};
