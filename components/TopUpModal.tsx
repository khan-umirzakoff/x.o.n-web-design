

import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  onConfirm: (amount: number) => Promise<void>;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, t, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'payme' | 'click' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const resetForm = () => {
    setAmount('');
    setPaymentMethod(null);
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || Number(amount) < 10000) {
      setError(t('minAmountError'));
      return;
    }
    if (!paymentMethod) {
      setError(t('paymentMethodRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(Number(amount));
      // Parent component will handle closing the modal and showing success message.
    } catch {
      // The parent will show a toast, but we can show a local error message too.
      setError(t('topUpFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-gradient-to-br from-[#1d1d23] to-[#111116] rounded-xl w-full max-w-md relative border border-gray-700/50 shadow-2xl shadow-purple-900/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-orbitron font-bold text-white">
            {t('topUpBalanceTitle')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              {t('amount')}
            </label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-4 pr-16 py-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder={t('enterAmount')}
                required
                min="10000"
                disabled={isLoading}
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 font-bold text-sm">
                SO'M
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('minAmountNote')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('choosePaymentMethod')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('payme')}
                disabled={isLoading}
                className={`sheen-hover flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-300 border-2 w-full aspect-square
                  ${
                    paymentMethod === 'payme'
                      ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/10'
                      : 'bg-[#2a2a2a] border-gray-600 hover:border-gray-500'
                  }
                `}
              >
                <img src="/assets/images/logos/payment/Payme.webp" alt="Payme" className="w-20 h-20 object-contain p-2" />
                <span className="font-semibold text-white text-base mt-2">{t('payme')}</span>
              </button>
               <button
                type="button"
                onClick={() => setPaymentMethod('click')}
                disabled={isLoading}
                className={`sheen-hover flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-300 border-2 w-full aspect-square
                  ${
                    paymentMethod === 'click'
                      ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/10'
                      : 'bg-[#2a2a2a] border-gray-600 hover:border-gray-500'
                  }
                `}
              >
                <img src="/assets/images/logos/payment/clickuz.webp" alt="Click" className="w-20 h-20 object-contain rounded-2xl" />
                <span className="font-semibold text-white text-base mt-2">{t('click')}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/30 border border-red-800/50 rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !paymentMethod || !amount}
            className="w-full bg-theme-gradient text-white font-bold py-4 rounded-lg hover-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? t('loading') : t('proceedToPayment')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TopUpModal;