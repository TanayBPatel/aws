import React, { useState, useEffect } from 'react';
import { X, Wallet, Check } from 'lucide-react';
import { api } from '../frontend/services/api';

interface BuySellModalProps {
  stock: any;
  onClose: () => void;
  type: 'buy' | 'sell';
  existingPosition?: any;
  onSuccess?: () => void;
}

export const BuySellModal: React.FC<BuySellModalProps> = ({ 
  stock, 
  onClose, 
  type, 
  existingPosition,
  onSuccess 
}) => {
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mode, setMode] = useState<'amount' | 'quantity'>('amount');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const portfolio = await api.getPortfolio();
      setBalance(portfolio.balance || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const price = stock.price || stock.currentPrice || 0;
  
  const handleAmountChange = (val: string) => {
    setAmount(val);
    setError('');
    if (val && !isNaN(parseFloat(val))) {
      setQuantity((parseFloat(val) / price).toFixed(4));
    } else {
      setQuantity('');
    }
  };

  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    setError('');
    if (val && !isNaN(parseFloat(val))) {
      setAmount((parseFloat(val) * price).toFixed(2));
    } else {
      setAmount('');
    }
  };

  const handleSubmit = async () => {
    const qty = parseFloat(quantity);
    const amt = parseFloat(amount);

    // Validation
    if (!quantity || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (type === 'buy' && amt > balance) {
      setError(`Insufficient balance. Available: ₹${balance.toLocaleString('en-IN')}`);
      return;
    }

    if (type === 'sell' && (!existingPosition || qty > existingPosition.quantity)) {
      setError(`Insufficient quantity. Available: ${existingPosition?.quantity || 0}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const securityId = stock.id || stock._id;
      
      if (type === 'buy') {
        const result = await api.buy(securityId, qty);
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            onClose();
            setSuccess(false);
            setAmount('');
            setQuantity('');
            if (onSuccess) onSuccess();
          }, 1500);
        } else {
          setError(result.message || 'Purchase failed');
        }
      } else {
        const result = await api.sell(securityId, qty);
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            onClose();
            setSuccess(false);
            setAmount('');
            setQuantity('');
            if (onSuccess) onSuccess();
          }, 1500);
        } else {
          setError(result.message || 'Sale failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-cardDark p-8 rounded-3xl border border-white/10 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-accentLime/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-accentLime" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Order Executed</h3>
            <p className="text-textSecondary">Your {type === 'buy' ? 'buy' : 'sell'} order for {stock.symbol} was successful.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bgDark md:bg-cardDark w-full md:w-[400px] rounded-t-[32px] md:rounded-[32px] border-t md:border border-white/10 p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-semibold text-white capitalize">{type} {stock.symbol}</h2>
                <p className="text-sm text-textSecondary">Current Price: ₹{price.toLocaleString('en-IN')}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10">
                <X size={20} />
            </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-6">
            <div className="bg-cardDark md:bg-bgDark p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between text-xs text-textSecondary mb-2 uppercase font-medium">
                    <span>{mode === 'amount' ? 'Amount (INR)' : 'Quantity'}</span>
                    <button 
                        onClick={() => {
                          setMode(mode === 'amount' ? 'quantity' : 'amount');
                          setError('');
                        }}
                        className="text-primary hover:underline"
                    >
                        Switch to {mode === 'amount' ? 'Quantity' : 'Amount'}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-medium text-white/50">{mode === 'amount' ? '₹' : ''}</span>
                    <input 
                        type="number" 
                        value={mode === 'amount' ? amount : quantity}
                        onChange={(e) => mode === 'amount' ? handleAmountChange(e.target.value) : handleQuantityChange(e.target.value)}
                        className="bg-transparent text-3xl font-medium text-white w-full focus:outline-none"
                        placeholder="0.00"
                        autoFocus
                        disabled={loading}
                    />
                </div>
                <div className="text-right mt-2 text-sm text-textSecondary">
                    ≈ {mode === 'amount' ? `${quantity || '0'} ${stock.symbol}` : `₹${amount || '0'}`}
                </div>
            </div>

            {/* Info */}
            <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2 text-textSecondary">
                    <Wallet size={16} />
                    <span>{type === 'buy' ? 'Available Balance' : 'Available Holdings'}</span>
                </div>
                <span className="text-white font-medium">
                    {type === 'buy' 
                        ? `₹${balance.toLocaleString('en-IN')}` 
                        : `${existingPosition ? existingPosition.quantity : 0} ${stock.symbol}`
                    }
                </span>
            </div>

            {/* Action Button */}
            <button 
                onClick={handleSubmit}
                disabled={loading || !quantity || parseFloat(quantity) <= 0}
                className={`w-full h-14 rounded-xl font-semibold text-lg flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    type === 'buy' 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'bg-error text-white hover:bg-error/90'
                }`}
            >
                {loading ? 'Processing...' : `Confirm ${type === 'buy' ? 'Buy' : 'Sell'}`}
            </button>
        </div>
      </div>
    </div>
  );
};
