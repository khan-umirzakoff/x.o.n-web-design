import React, { useState, useEffect, ReactNode } from 'react';
import { CheckIcon, CloseIcon } from './icons';
import { Toast, ToastContext, ToastType } from '../hooks/useToast';

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, type: ToastType = 'info', message?: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, title, type, message, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = React.useCallback(() => {
    setIsVisible(false);
    // Allow time for the fade-out animation before removing
    setTimeout(() => onRemove(toast.id), 300);
  }, [onRemove, toast.id]);

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, handleRemove]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500';
      case 'info':
        return 'bg-blue-600 border-blue-500';
      default:
        return 'bg-gray-600 border-gray-500';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckIcon className="w-5 h-5 text-white" />;
      case 'error':
        return <CloseIcon className="w-5 h-5 text-white" />;
      case 'warning':
        return <span className="text-white text-lg">⚠️</span>;
      case 'info':
        return <span className="text-white text-lg">ℹ️</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getToastStyles()}
        border rounded-lg shadow-lg p-4 min-w-80 max-w-md
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-white/80 text-sm mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          aria-label="Yopish"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
