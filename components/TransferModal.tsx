import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Check } from 'lucide-react';
import { api } from '../frontend/services/api';

interface TransferModalProps {
  isOpen: boolean;
  type: 'deposit' | 'withdraw';
  onClose: () => void;
  currentBalance: number;
  onSuccess?: () => void; // Callback to refresh portfolio data
}

export const TransferModal: React.FC<TransferModalProps> = ({ 
  isOpen, 
  type, 
  onClose, 
  currentBalance,
  onSuccess 
}) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'success' | 'error'>('input');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (type === 'withdraw' && amountNum > currentBalance) {
      setError('Insufficient balance');
      return;
    }

    setStep('processing');
    setError('');

    try {
      let result;
      if (type === 'deposit') {
        result = await api.deposit(amountNum);
      } else {
        result = await api.withdraw(amountNum);
      }

      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onClose();
          setStep('input');
          setAmount('');
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError(result.message || 'Transaction failed');
        setStep('error');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStep('error');
    }
  };

  const quickAmounts = type === 'deposit' 
    ? [1000, 5005, 10000] 
    : [1000, 5005, Math.floor(currentBalance)];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bgDark md:bg-cardDark w-full md:w-[420px] rounded-t-[32px] md:rounded-[32px] border-t md:border border-borderBase p-6 shadow-2xl relative transition-colors duration-300">
        
        {step === 'input' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-textPrimary capitalize flex items-center gap-2">
                {type === 'deposit' ? <ArrowDownCircle className="text-accentLime" /> : <ArrowUpCircle className="text-error" />}
                {type} Funds
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

            <div className="mb-8">
              <label className="text-textSecondary text-xs font-medium uppercase mb-2 block">Enter Amount</label>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-medium text-textSecondary opacity-50">₹</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="0"
                  className="w-full bg-transparent text-4xl font-semibold text-textPrimary pl-8 focus:outline-none placeholder:text-textSecondary/20"
                  autoFocus
                />
              </div>
              <p className="text-right text-xs text-textSecondary mt-2">
                Balance: ₹{currentBalance.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setAmount(amt.toString());
                    setError('');
                  }}
                  className="py-2 rounded-xl bg-surfaceLight border border-borderBase text-sm font-medium text-textSecondary hover:bg-surfaceLighter hover:text-textPrimary transition-colors"
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            <button 
              onClick={handleConfirm}
              disabled={!amount || parseFloat(amount) <= 0 || (type === 'withdraw' && parseFloat(amount) > currentBalance)}
              className={`w-full h-14 rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'deposit' 
                  ? 'bg-accentLime text-bgDark hover:bg-accentLime/90 shadow-accentLime/20' 
                  : 'bg-error text-white hover:bg-error/90 shadow-error/20'
              }`}
            >
              Confirm {type}
            </button>
          </>
        )}

        {step === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-surfaceLight border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-textPrimary font-medium">Processing Transaction...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-accentLime/20 text-accentLime rounded-full flex items-center justify-center mb-4">
              <Check size={40} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-semibold text-textPrimary mb-2">Success!</h3>
            <p className="text-textSecondary">
              Your {type} of ₹{parseInt(amount).toLocaleString('en-IN')} has been completed.
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
              <X size={40} strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-semibold text-textPrimary mb-2">Error</h3>
            <p className="text-textSecondary mb-4">{error}</p>
            <button
              onClick={() => {
                setStep('input');
                setError('');
              }}
              className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
