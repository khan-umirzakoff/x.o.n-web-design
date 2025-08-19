import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
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
import { api } from './services/api';
import { loggingService } from './services/loggingService';
import Subscriptions from './components/home/Subscriptions';

type TranslationKey = keyof typeof translations.ENG;

const getInitialLanguage = (): Language => {
  try {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && ['ENG', 'RUS', 'UZB'].includes(savedLang)) {
      return savedLang as Language;
    }
  } catch (error) {
    loggingService.logError(error, { context: 'getInitialLanguage', message: 'Could not access localStorage. Proceeding with browser language detection.' });
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
      // These props need to be wired up properly later
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
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsSidebarOpen(false);
            }
          }}
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
        loader.addEventListener('transitionend', () => {
          loader.remove();
        }, { once: true });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const translationKey = key as TranslationKey;
    return (translations[language] as typeof translations.ENG)[translationKey] || translations.ENG[translationKey] || fallback || key;
  }, [language]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await api.login(email, password);
      setIsLoggedIn(true);
      setCurrentUser(user);
      addToast(t('loginSuccess'), 'success');
      setIsAuthModalOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? t(error.message) : 'An error occurred';
      addToast(errorMessage, 'error');
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string, username: string) => {
    try {
      const user = await api.register(username, email, password);
      setIsLoggedIn(true);
      setCurrentUser(user);
      addToast(t('registerSuccess'), 'success');
      setIsAuthModalOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? t(error.message) : 'An error occurred';
      addToast(errorMessage, 'error');
      throw error;
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleTopUp = async (amount: number) => {
    if (!currentUser) return;
    try {
      type StoredUser = User & { password?: string };
      const users = JSON.parse(sessionStorage.getItem('mock_users_db') || '{}') as Record<string, StoredUser>;
      const freshUser = Object.values(users).find(u => u.id === currentUser.id);

      if (!freshUser) {
        throw new Error('userNotFound');
      }

      const updatedUser = await api.updateBalance(freshUser.id, Number(amount));
      setCurrentUser(updatedUser);
      addToast(t('topUpSuccessMessage'), 'success');
      setIsTopUpModalOpen(false);
    } catch (error) {
      addToast(t('topUpFailed'), 'error');
      loggingService.logError(error);
      throw error;
    }
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
        onLogin={handleLogin}
        onRegister={handleRegister}
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
