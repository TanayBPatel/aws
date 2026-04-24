import React, { useState } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { api } from '../services/api';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: any;
  onSuccess?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, stock, onSuccess }) => {
  const [price, setPrice] = useState((stock.price || stock.currentPrice || 0).toString());
  const [type, setType] = useState<'above' | 'below'>('above');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    const priceNum = parseFloat(price);

    if (!price || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.createAlert(stock.symbol, priceNum, type);
      if (!result.success) {
        throw new Error(result.message || 'Failed to create alert');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setPrice((stock.price || stock.currentPrice || 0).toString());
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bgDark md:bg-cardDark w-full md:w-[400px] rounded-t-[32px] md:rounded-[32px] border-t md:border border-borderBase p-6 shadow-2xl relative">

        {!success ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-textPrimary flex items-center gap-2">
                <Bell className="text-accentLime" size={20} />
                Set Price Alert
              </h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-surfaceLight flex items-center justify-center text-textPrimary hover:bg-surfaceLighter transition-colors">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <p className="text-textSecondary text-sm mb-6">
              Notify me when <span className="text-textPrimary font-medium">{stock.symbol}</span> goes...
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  setType('above');
                  setError('');
                }}
                className={`py-3 rounded-xl border text-sm font-medium transition-all ${type === 'above'
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-cardDark border-borderBase text-textSecondary hover:bg-surfaceLight'
                  }`}
              >
                Above
              </button>
              <button
                onClick={() => {
                  setType('below');
                  setError('');
                }}
                className={`py-3 rounded-xl border text-sm font-medium transition-all ${type === 'below'
                    ? 'bg-error/20 border-error text-error'
                    : 'bg-cardDark border-borderBase text-textSecondary hover:bg-surfaceLight'
                  }`}
              >
                Below
              </button>
            </div>

            <div className="mb-8 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary">₹</span>
              <input
                type="number"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setError('');
                }}
                className="w-full bg-surfaceLight border border-borderBase rounded-xl py-4 pl-8 pr-4 text-xl font-semibold text-textPrimary focus:outline-none focus:border-primary"
                disabled={loading}
              />
              <p className="text-right text-xs text-textSecondary mt-2">
                Current Price: ₹{(stock.price || stock.currentPrice || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={loading || !price || parseFloat(price) <= 0}
              className="w-full h-14 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </button>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-accentLime/20 text-accentLime rounded-full flex items-center justify-center mb-4">
              <Check size={40} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-semibold text-textPrimary mb-2">Alert Set!</h3>
            <p className="text-textSecondary">
              We'll notify you when {stock.symbol} reaches ₹{Number(price).toLocaleString('en-IN')}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
