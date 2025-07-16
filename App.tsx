
import React, { useState, useCallback, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/Toast';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import Hero from './components/home/Hero';
import StartToPlay from './components/home/StartToPlay';
import Advantages from './components/home/Advantages';
import Subscriptions from './components/home/Subscriptions';
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
import NvidiaTechPage from './components/DownloadModal';
import { Game, Language, User, NavigateOptions } from './types';
import { translations } from './translations';
import { useLocalStorage } from './hooks/useLocalStorage';
import { api } from './services/api';
import { loggingService } from './services/loggingService'; // Import loggingService

type TranslationKey = keyof typeof translations.ENG;

const getInitialLanguage = (): Language => {
  try {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && ['ENG', 'RUS', 'UZB'].includes(savedLang)) {
      return savedLang as Language;
    }
  } catch (error) {
    loggingService.logError(error, { context: 'getInitialLanguage', message: 'Could not access localStorage. Proceeding with browser language detection.' });
    // console.warn("Could not access localStorage. Proceeding with browser language detection.", error); // Remove console.warn
  }

  const browserLang = navigator.language?.toLowerCase().split('-')[0];
  if (browserLang === 'uz') return 'UZB';
  if (browserLang === 'ru') return 'RUS';

  return 'ENG';
};

// Browser history state interface
interface HistoryState {
  page: string;
  game?: Game;
  filter?: string;
  search?: string;
  platform?: string;
}

// Get initial page from URL hash or default to home
const getInitialPage = (): string => {
  const hash = window.location.hash.slice(1); // Remove #
  return hash || 'home';
};

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [language, setLanguage] = useLocalStorage<Language>('appLanguage', getInitialLanguage());
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeGameFilter, setActiveGameFilter] = useState('All Games');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatform, setActivePlatform] = useState('windows');
  const { addToast } = useToast();

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

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryState | null;
      if (state) {
        setCurrentPage(state.page);
        if (state.game) setSelectedGame(state.game);
        if (state.filter) setActiveGameFilter(state.filter);
        if (state.search) setSearchQuery(state.search);
        if (state.platform) setActivePlatform(state.platform);
      } else {
        // Fallback to hash-based routing
        const hash = window.location.hash.slice(1);
        setCurrentPage(hash || 'home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL hash when page changes
  useEffect(() => {
    const hash = currentPage === 'home' ? '' : currentPage;
    if (window.location.hash.slice(1) !== hash) {
      window.location.hash = hash;
    }
  }, [currentPage]);

  const t = useCallback((key: string, fallback?: string): string => {
    const translationKey = key as TranslationKey;
    return (translations[language] as typeof translations.ENG)[translationKey] || translations.ENG[translationKey] || fallback || key;
  }, [language]);

  const navigate = useCallback((page: string, options: NavigateOptions = {}) => {
    const { game, filter, search, platform } = options;
    
    // Update state
    if (page === 'game-details' && game) {
      setSelectedGame(game);
    }
    if (page === 'all-games') {
      setActiveGameFilter(filter || 'All Games');
      setSearchQuery(search || '');
    }
    if (page === 'system-requirements' && platform) {
      setActivePlatform(platform);
    }
    
    // Create history state
    const historyState: HistoryState = {
      page,
      ...(game && { game }),
      ...(filter && { filter }),
      ...(search && { search }),
      ...(platform && { platform })
    };
    
    // Update browser history
    const url = page === 'home' ? '/' : `/#${page}`;
    window.history.pushState(historyState, '', url);
    
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSidebarOpen(false);
  }, []);

  const renderCurrentPage = useCallback(() => {
    switch (currentPage) {
      case 'download':
        return <DownloadPage navigate={navigate} t={t} />;
      case 'system-requirements':
        return <SystemRequirementsPage navigate={navigate} currentPage={currentPage} platform={activePlatform} t={t} />;
      case 'games':
        return <GamesPage navigate={navigate} t={t} />;
      case 'all-games':
        return <AllGamesPage navigate={navigate} initialFilter={activeGameFilter} searchQuery={searchQuery} t={t} />;
      case 'game-details':
        return selectedGame ? <GameDetailsPage game={selectedGame} navigate={navigate} t={t} /> : <GamesPage navigate={navigate} t={t} />;
      case 'how-to-start':
        return <HowToStartPage navigate={navigate} currentPage={currentPage} t={t} />;
      case 'guides':
        return <GuidesPage navigate={navigate} t={t}/>;
       case 'nvidia-tech':
        return <NvidiaTechPage navigate={navigate} t={t} />;
      case 'about-service':
        return <AboutServicePage navigate={navigate} t={t} />;
      case 'support':
        return <SupportPage navigate={navigate} t={t} />;
      case 'home':
      default:
        return (
          <div>
            <Hero navigate={navigate} t={t} />
            <StartToPlay navigate={navigate} t={t} />
            <Advantages navigate={navigate} t={t} />
            <Subscriptions navigate={navigate} t={t} />
            <Wall navigate={navigate} t={t} />
            <CtaSection navigate={navigate} t={t} />
          </div>
        );
    }
  }, [currentPage, navigate, t, activePlatform, activeGameFilter, searchQuery, selectedGame]);

  return (
    <>
        <div className="bg-[#0A0A10] text-gray-200 overflow-x-hidden">
          <Header
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={() => setIsSidebarOpen(!isSidebarOpen)}
            isLoggedIn={isLoggedIn}
            language={language}
            setLanguage={setLanguage}
            navigate={navigate}
            t={t}
            onLoginClick={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
          <Sidebar
            isOpen={isSidebarOpen}
            isLoggedIn={isLoggedIn}
            navigate={navigate}
            t={t}
            onLoginClick={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
          <main className="pt-[72px]">
            {renderCurrentPage()}
          </main>
          <Footer navigate={navigate} t={t} />
          <FooterBottom t={t} navigate={navigate} />
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
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
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
