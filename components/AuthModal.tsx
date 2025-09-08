import React, { useState } from 'react';
import { CloseIcon, GoogleIcon } from './icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void; // Simplified for Google Sign-In
  t: (key: string) => string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, t }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await onLogin();
      // No need to call onClose here, the auth state listener in App.tsx will handle it
    } catch (error) {
      // Error is already handled in App.tsx, but we can stop loading here
      setIsLoading(false);
    }
    // Don't set loading to false on success, as the modal will close
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-sm relative border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-orbitron font-bold text-white">
            {t('loginOrRegister')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
            <p className="text-gray-300 mb-6">{t('signInPrompt')}</p>
            <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <GoogleIcon className="w-5 h-5"/>
                {isLoading ? t('loading') : t('continueWithGoogle')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
