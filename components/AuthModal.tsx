import React, { useState, useEffect } from 'react';
import { CloseIcon, GoogleIcon } from './icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  onEmailRegister: (email: string, password: string, username: string) => Promise<void>;
  t: (key: string) => string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  onEmailLogin,
  onEmailRegister,
  t,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when mode switches or modal closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setIsLoading(false);
    }
  }, [isOpen, isLoginMode]);


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setError(t('passwordsDoNotMatch'));
        return;
      }
      if (username.length < 3) {
        setError(t('usernameTooShort'));
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await onEmailLogin(email, password);
      } else {
        await onEmailRegister(email, password, username);
      }
      onClose(); // Close modal on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        await onGoogleSignIn();
        onClose(); // Close modal on success
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
        setIsLoading(false);
    }
  }

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-sm relative border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-orbitron font-bold text-white">
            {isLoginMode ? t('login') : t('register')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {!isLoginMode && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={t('enterUsername')}
                required
                disabled={isLoading}
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('enterEmail')}
              required
              disabled={isLoading}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('enterPassword')}
              required
              minLength={6}
              disabled={isLoading}
            />
            {!isLoginMode && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={t('confirmPassword')}
                required
                minLength={6}
                disabled={isLoading}
              />
            )}

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-theme-gradient text-white font-bold py-3 rounded-lg hover-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? t('loading') : (isLoginMode ? t('login') : t('register'))}
            </button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50">
            <GoogleIcon className="w-5 h-5"/>
            {t('continueWithGoogle')}
          </button>
        </div>

        <div className="px-6 pb-6 text-center border-t border-gray-800 pt-4 mt-2">
          <p className="text-gray-400">
            {isLoginMode ? t('dontHaveAccount') : t('alreadyHaveAccount')}
            <button onClick={switchMode} className="text-purple-400 hover:text-purple-300 ml-1 font-medium" disabled={isLoading}>
              {isLoginMode ? t('register') : t('login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
