import React, { useState, useCallback, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/Toast';
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
import TopUpModal from './components/TopUpModal'; // Yangi modalni import qilish
import { Game, Language, User, NavigateOptions } from './types';
import { translations } from './i18n';
import { useLocalStorage } from './hooks/useLocalStorage';
import { api } from './services/api';
import { loggingService } from './services/loggingService'; // Import loggingService
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
  const hash = window.location.hash.slice(1); 
  return hash || 'home';
};

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [language, setLanguage] = useLocalStorage<Language>('appLanguage', getInitialLanguage());
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeGameFilter, setActiveGameFilter] = useState('All Games');
  const [activePlatform, setActivePlatform] = useState('windows');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const { addToast } = useToast();

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

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryState | null;
      if (state) {
        setCurrentPage(state.page);
        if (state.game) setSelectedGame(state.game);
        if (state.filter) setActiveGameFilter(state.filter);
        if (state.platform) setActivePlatform(state.platform);
        if (state.search !== undefined) setActiveSearch(state.search);
      } else {
        // Fallback to hash-based routing
        const hash = window.location.hash.slice(1);
        setCurrentPage(hash || 'home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL hash when page changes (only if not triggered by navigation)
  useEffect(() => {
    const hash = currentPage === 'home' ? '' : currentPage;
    const currentHash = window.location.hash.slice(1);
    if (currentHash !== hash) {
      // Don't update if we're already at the correct URL
      const targetUrl = currentPage === 'home' ? '/' : `/#${currentPage}`;
      const currentUrl = window.location.pathname + window.location.hash;
      if (currentUrl !== targetUrl) {
        window.location.hash = hash;
      }
    }
  }, [currentPage]);

  const t = useCallback((key: string, fallback?: string): string => {
    const translationKey = key as TranslationKey;
    return (translations[language] as typeof translations.ENG)[translationKey] || translations.ENG[translationKey] || fallback || key;
  }, [language]);

  const navigate = useCallback((page: string, options: NavigateOptions = {}) => {
    const { game, filter, platform, search } = options as any;
    
    // Update state
    if (page === 'game-details' && game) {
      setSelectedGame(game);
    }

    if (page === 'all-games') {
      setActiveGameFilter(filter || 'All Games');
      if (search !== undefined) setActiveSearch(search);
    }
    
    if (page === 'system-requirements' && platform) {
      setActivePlatform(platform);
    }
    
    // Create history state
    const historyState: HistoryState = {
      page,
      ...(game && { game }),
      ...(filter && { filter }),
      ...(platform && { platform }),
      ...(search !== undefined ? { search } : {}),
    };
    
    // Update browser history
    const url = page === 'home' ? '/' : `/#${page}`;
    const currentUrl = window.location.pathname + window.location.hash;
    if (currentUrl !== url && currentPage !== page) {
        window.history.pushState(historyState, '', url);
    } else {
        // Replace state when staying on same URL but changing options like search/filter
        window.history.replaceState(historyState, '', url);
    }
    
    // Only update current page and scroll when the page actually changes
    if (page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsSidebarOpen(false);
  }, [currentPage]);
  
  const onLoginClick = () => setIsAuthModalOpen(true);

  const renderCurrentPage = useCallback(() => {
    switch (currentPage) {
      case 'download':
        return <DownloadPage navigate={navigate} t={t} />;
      case 'system-requirements':
        return <SystemRequirementsPage navigate={navigate} currentPage={currentPage} platform={activePlatform} t={t} />;
      case 'games':
        return <GamesPage 
                  navigate={navigate} 
                  t={t} 
                  currentUser={currentUser}
                  isLoggedIn={isLoggedIn}
                  onTopUpClick={() => setIsTopUpModalOpen(true)}
                  onLoginClick={onLoginClick}
                  language={language}
                />;
      case 'all-games':
        return <AllGamesPage navigate={navigate} filter={activeGameFilter} t={t} search={activeSearch} />;
      case 'game-details':
        return selectedGame ? <GameDetailsPage game={selectedGame} navigate={navigate} t={t} language={language} currentUser={currentUser} isLoggedIn={isLoggedIn} onTopUpClick={() => setIsTopUpModalOpen(true)} onLoginClick={onLoginClick} /> : <GamesPage navigate={navigate} t={t} currentUser={currentUser} isLoggedIn={isLoggedIn} onTopUpClick={() => setIsTopUpModalOpen(true)} onLoginClick={onLoginClick} language={language} />;
      case 'how-to-start':
        return <HowToStartPage navigate={navigate} currentPage={currentPage} t={t} onLoginClick={onLoginClick} onTopUpClick={() => setIsTopUpModalOpen(true)} isLoggedIn={isLoggedIn} />;
      case 'guides':
        return <GuidesPage navigate={navigate} t={t}/>;
       case 'nvidia-tech':
        return <DownloadModal navigate={navigate} t={t} />;
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
            {/* Removed GamesPage section from Home */}
            <Subscriptions
              navigate={navigate}
              t={t}
              onTopUpClick={() => setIsTopUpModalOpen(true)}
              currentUser={currentUser}
              isLoggedIn={isLoggedIn}
              onLoginClick={onLoginClick}
            />
            {/* End Subscriptions section */}
            <Wall navigate={navigate} t={t} />
            <CtaSection navigate={navigate} t={t} />
          </div>
        );
    }
  }, [currentPage, navigate, t, activePlatform, activeGameFilter, selectedGame, currentUser, isLoggedIn, onLoginClick, handleTopUp, language]);

  return (
    <>
        <div className="bg-[#0A0A10] text-gray-200 min-h-screen">
          <Header
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={() => setIsSidebarOpen(!isSidebarOpen)}
            isLoggedIn={isLoggedIn}
            language={language}
            setLanguage={setLanguage}
            navigate={navigate}
            t={t}
            onLoginClick={onLoginClick}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
          <Sidebar
            isOpen={isSidebarOpen}
            isLoggedIn={isLoggedIn}
            navigate={navigate}
            t={t}
            onLoginClick={onLoginClick}
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
