import React, { useState, useEffect } from 'react';
import { CloseIcon, GoogleIcon } from './icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  onEmailRegister: (email: string, password: string, username: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  t: (key: string) => string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  onEmailLogin,
  onEmailRegister,
  onPasswordReset,
  t,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'resetPassword'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setIsLoading(false);
      setResetEmailSent(false);
      setMode('login'); // Reset to login mode every time it opens
    }
  }, [isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
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
      if (mode === 'login') {
        await onEmailLogin(email, password);
      } else {
        await onEmailRegister(email, password, username);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onPasswordReset(email);
      setResetEmailSent(true);
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
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    if (mode === 'resetPassword') {
      if (resetEmailSent) {
        return (
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">{t('checkYourEmailForReset')}</h3>
            <p className="text-gray-400 mb-2">{t('followLinkToReset')}</p>
            <p className="text-gray-500 text-sm mb-6">{t('checkSpamForReset')}</p>
            <button onClick={() => setMode('login')} className="text-purple-400 hover:text-purple-300 font-medium">
              {t('backToLogin')}
            </button>
          </div>
        );
      }
      return (
        <div className="p-6">
          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white"
              placeholder={t('enterEmail')}
              required
              disabled={isLoading}
            />
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full bg-theme-gradient text-white font-bold py-3 rounded-lg">
              {isLoading ? t('loading') : t('sendResetLink')}
            </button>
          </form>
          <div className="text-center mt-4">
            <button onClick={() => setMode('login')} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              {t('backToLogin')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="p-6">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'register' && (
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white"
                placeholder={t('enterUsername')} required disabled={isLoading}
              />
            )}
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white"
              placeholder={t('enterEmail')} required disabled={isLoading}
            />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white"
              placeholder={t('enterPassword')} required minLength={6} disabled={isLoading}
            />
            {mode === 'register' && (
              <input
                type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-md text-white"
                placeholder={t('confirmPassword')} required minLength={6} disabled={isLoading}
              />
            )}
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => setMode('resetPassword')} className="text-sm text-purple-400 hover:text-purple-300 font-medium">
                  {t('forgotPassword')}
                </button>
              </div>
            )}
            {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full bg-theme-gradient text-white font-bold py-3 rounded-lg">
              {isLoading ? t('loading') : t(mode)}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs">{t('orSeparator')}</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-200">
            <GoogleIcon className="w-6 h-6" />
            {t('continueWithGoogle')}
          </button>
        </div>
        <div className="px-6 pb-6 text-center border-t border-gray-800 pt-4 mt-2">
          <p className="text-gray-400">
            {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-purple-400 hover:text-purple-300 ml-1 font-medium" disabled={isLoading}>
              {t(mode === 'login' ? 'register' : 'login')}
            </button>
          </p>
        </div>
      </>
    );
  };

  const getTitle = () => {
    if (mode === 'resetPassword') return t('resetPassword');
    if (mode === 'login') return t('login');
    return t('register');
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-sm relative border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-orbitron font-bold text-white">{getTitle()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AuthModal;
