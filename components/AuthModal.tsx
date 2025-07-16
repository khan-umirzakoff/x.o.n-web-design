import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, username: string) => void;
  t: (key: string) => string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister, t }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, username);
      }
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md relative border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-orbitron font-bold text-white">
            {isLoginMode ? t('login') : t('register')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLoginMode && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                {t('username')}
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={t('enterUsername')}
                required={!isLoginMode}
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('enterEmail')}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('enterPassword')}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-theme-gradient text-white font-bold py-3 rounded-lg hover-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('loading') : (isLoginMode ? t('login') : t('register'))}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="px-6 pb-6 text-center">
          <p className="text-gray-400">
            {isLoginMode ? t('dontHaveAccount') : t('alreadyHaveAccount')}
            <button
              onClick={switchMode}
              className="text-purple-400 hover:text-purple-300 ml-1 font-medium"
              disabled={isLoading}
            >
              {isLoginMode ? t('register') : t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
