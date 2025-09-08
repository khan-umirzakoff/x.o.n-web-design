import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { useToast } from './hooks/useToast';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import Hero from './components/home/Hero';
import StartToPlay from './components/home/StartToPlay';
import Advantages from './components/home/Advantages';
import Wall from './components/home/Wall';
import CtaSection from './components/home/TryFree';
import Footer from './components/Footer';
import FooterBottom from './components/FooterBottom';
import DownloadPage from './components/DownloadPage';
import SystemRequirementsPage from './components/SystemRequirementsPage';
import GamesPage from './components/GamesPage';
import AllGamesPage from './components/AllGamesPage';
import HowToStartPage from './components/HowToStartPage';
import GuidesPage from './components/GuidesPage';
import GameDetailsPage from './components/GameDetailsPage';
import AboutServicePage from './components/AboutServicePage';
import SupportPage from './components/SupportPage';
import DownloadModal from './components/DownloadModal';
import TopUpModal from './components/TopUpModal';
import NotFoundPage from './components/NotFoundPage';
import { Language, User } from './types';
import { translations } from './i18n';
import { useLocalStorage } from './hooks/useLocalStorage';
import { auth, googleProvider } from './services/firebase';
import { loggingService } from './services/loggingService';
import Subscriptions from './components/home/Subscriptions';
import { api } from './services/api';

type TranslationKey = keyof typeof translations.ENG;

const getInitialLanguage = (): Language => {
  try {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && ['ENG', 'RUS', 'UZB'].includes(savedLang)) {
      return savedLang as Language;
    }
  } catch (error) {
    loggingService.logError(error, { context: 'getInitialLanguage', message: 'Could not access localStorage.' });
  }
  const browserLang = navigator.language?.toLowerCase().split('-')[0];
  if (browserLang === 'uz') return 'UZB';
  if (browserLang === 'ru') return 'RUS';
  return 'ENG';
};

const HomePage: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div>
    <Hero t={t} />
    <StartToPlay t={t} />
    <Advantages t={t} />
    <Subscriptions
      t={t}
      onTopUpClick={() => {}}
      currentUser={null}
      isLoggedIn={false}
      onLoginClick={() => {}}
    />
    <Wall t={t} />
    <CtaSection t={t} />
  </div>
);

const Layout: React.FC<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  t: (key: string) => string;
  onLoginClick: () => void;
  onLogout: () => void;
  currentUser: User | null;
}> = ({ isSidebarOpen, setIsSidebarOpen, isLoggedIn, language, setLanguage, t, onLoginClick, onLogout, currentUser }) => {
  return (
    <div className="bg-[#0A0A10] text-gray-200 min-h-screen">
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        isLoggedIn={isLoggedIn}
        language={language}
        setLanguage={setLanguage}
        t={t}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        currentUser={currentUser}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        isLoggedIn={isLoggedIn}
        t={t}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        currentUser={currentUser}
        closeSidebar={() => setIsSidebarOpen(false)}
      />
      <main className="pt-[72px]">
        <Outlet />
      </main>
      <Footer t={t} />
      <FooterBottom t={t} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setIsSidebarOpen(false)}
          aria-label="Sidebar yopish"
        />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [language, setLanguage] = useLocalStorage<Language>('appLanguage', getInitialLanguage());
  const { addToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loader = document.getElementById('initial-loader');
      if (loader) {
        loader.classList.add('hidden');
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: User = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL,
        };
        setCurrentUser(appUser);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, [setCurrentUser, setIsLoggedIn]);

  const t = useCallback((key: string, fallback?: string): string => {
    const translationKey = key as TranslationKey;
    return (translations[language] as any)[translationKey] || (translations.ENG as any)[translationKey] || fallback || key;
  }, [language]);

  const handleAuthError = (error: AuthError) => {
    loggingService.logError(error);
    switch (error.code) {
      case 'auth/email-already-in-use':
        return t('emailAlreadyExists');
      case 'auth/invalid-email':
        return t('invalidEmail');
      case 'auth/weak-password':
        return t('weakPassword');
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return t('invalidCredentials');
      default:
        return t('loginError');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addToast(t('loginSuccess'), 'success');
      setIsAuthModalOpen(false);
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code !== 'auth/popup-closed-by-user') {
        const message = handleAuthError(authError);
        addToast(message, 'error');
      }
    }
  };

  const handleEmailRegister = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      addToast(t('registerSuccess'), 'success');
      setIsAuthModalOpen(false);
    } catch (error) {
      const message = handleAuthError(error as AuthError);
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      addToast(t('loginSuccess'), 'success');
      setIsAuthModalOpen(false);
    } catch (error) {
      const message = handleAuthError(error as AuthError);
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      // No need to show toast here, the modal will show a success message
    } catch (error) {
      const message = handleAuthError(error as AuthError);
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addToast(t('logoutSuccess'), 'success');
    } catch (error) {
      loggingService.logError(error, { context: 'handleLogout' });
      addToast(t('logoutError'), 'error');
    }
  };

  const handleTopUp = async (amount: number) => {
     if (!currentUser) return;
     addToast('Top-up functionality is currently disabled.', 'info');
  };

  const onLoginClick = () => setIsAuthModalOpen(true);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              isLoggedIn={isLoggedIn}
              language={language}
              setLanguage={setLanguage}
              t={t}
              onLoginClick={onLoginClick}
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          }
        >
          <Route index element={<HomePage t={t} />} />
          <Route path="download" element={<DownloadPage t={t} />} />
          <Route path="system-requirements/:platform" element={<SystemRequirementsPage t={t} />} />
          <Route path="system-requirements" element={<SystemRequirementsPage t={t} />} />
          <Route path="games" element={<GamesPage t={t} currentUser={currentUser} isLoggedIn={isLoggedIn} onTopUpClick={() => setIsTopUpModalOpen(true)} onLoginClick={onLoginClick} language={language} />} />
          <Route path="all-games" element={<AllGamesPage t={t} />} />
          <Route path="game/:gameId" element={<GameDetailsPage t={t} language={language} currentUser={currentUser} isLoggedIn={isLoggedIn} onTopUpClick={() => setIsTopUpModalOpen(true)} onLoginClick={onLoginClick} />} />
          <Route path="how-to-start" element={<HowToStartPage t={t} onLoginClick={onLoginClick} onTopUpClick={() => setIsTopUpModalOpen(true)} isLoggedIn={isLoggedIn} />} />
          <Route path="guides" element={<GuidesPage t={t} />} />
          <Route path="nvidia-tech" element={<DownloadModal t={t} />} />
          <Route path="about-service" element={<AboutServicePage t={t} />} />
          <Route path="support" element={<SupportPage t={t} />} />
          <Route path="*" element={<NotFoundPage t={t} />} />
        </Route>
      </Routes>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailLogin={handleEmailLogin}
        onEmailRegister={handleEmailRegister}
        onPasswordReset={handlePasswordReset}
        t={t}
      />
      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onConfirm={handleTopUp}
        t={t}
      />
    </>
  );
};

const App: React.FC = () => (
  <ErrorBoundary language={getInitialLanguage()}>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </ErrorBoundary>
);

export default App;
