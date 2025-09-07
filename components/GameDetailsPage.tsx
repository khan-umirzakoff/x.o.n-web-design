

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Game, User, Language } from '../types';
import { api } from '../services/api';
import { CloseIcon, ShareIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { useToast } from '../hooks/useToast';
import { resolveStoreIcon } from '../utils/imageUtils';

// --- SUB-COMPONENTS ---

const ShareModal: React.FC<{ url: string; onClose: () => void; t: (key: string) => string; }> = ({ url, onClose, t }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="glass p-6 w-full max-w-md mx-4 rounded-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium">{t('share')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="relative">
                    <input type="text" value={url} readOnly className="w-full bg-black/30 border border-white/20 rounded-md p-2 pr-24 text-gray-300" />
                    <button onClick={handleCopy} className="absolute right-1 top-1 bottom-1 bg-gray-200 text-black px-4 rounded-md text-sm font-medium hover:bg-white">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InfoBlock: React.FC<{ label: string; value?: string | string[]; }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div>
            <h4 className="text-sm text-gray-400 font-medium">{label}</h4>
            <p className="text-base text-gray-200">{Array.isArray(value) ? value.join(', ') : value}</p>
        </div>
    );
};

const StoreTag: React.FC<{ store: string; url?: string }> = ({ store, url }) => {
    const iconSrc = resolveStoreIcon(store);
    const className = "inline-flex items-center gap-2 capitalize text-sm px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:border-white/20 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30";
    const content = (
        <>
            {iconSrc && <img src={iconSrc} alt={store} className="w-5 h-5 shrink-0" loading="lazy" />}
            <span className="font-medium">{store}</span>
        </>
    );
    if (url) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
            </a>
        );
    }
    return <span className={className}>{content}</span>;
};

const ScreenshotLightbox: React.FC<{
  screenshots: string[];
  startIndex: number;
  onClose: () => void;
  title: string;
}> = ({ screenshots, startIndex, onClose, title }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting'>('entering');

  const handleClose = useCallback(() => {
    setAnimationState('exiting');
    setTimeout(onClose, 300); // Match transition duration
  }, [onClose]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshots.length);
  }, [screenshots.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + screenshots.length) % screenshots.length);
  }, [screenshots.length]);

  useEffect(() => {
    // Trigger the enter animation
    const timer = requestAnimationFrame(() => setAnimationState('entered'));
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleClose, goToNext, goToPrev]);
  
  const backdropClasses = animationState === 'entered' ? 'opacity-100' : 'opacity-0';
  const imageContainerClasses = animationState === 'entered' ? 'opacity-100 scale-100' : 'opacity-0 scale-95';

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out ${backdropClasses}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} screenshot gallery`}
    >
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50"
        aria-label="Close gallery"
      >
        <CloseIcon className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        <button
          onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-50"
          aria-label="Previous screenshot"
        >
          <ChevronLeftIcon className="w-8 h-8" />
        </button>

        <div 
          className={`relative max-w-screen-lg max-h-[90vh] w-full transform transition-all duration-300 ease-in-out ${imageContainerClasses}`}
          onClick={(e) => e.stopPropagation()}
        >
           <div className="relative aspect-video bg-black/20 rounded-lg overflow-hidden">
                {screenshots.map((src, index) => (
                    <img
                        key={src}
                        src={src}
                        alt={`${title} screenshot ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ease-in-out ${currentIndex === index ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backfaceVisibility: 'hidden' }}
                    />
                ))}
            </div>
            <div className="text-center text-white/80 mt-2 text-sm">
                {currentIndex + 1} / {screenshots.length}
            </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-50"
          aria-label="Next screenshot"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};


const ScreenshotGallery: React.FC<{ screenshots?: string[], title: string, onScreenshotClick: (index: number) => void }> = ({ screenshots, title, onScreenshotClick }) => {
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);
    const scrollerRef = React.useRef<HTMLDivElement | null>(null);
    const animRef = React.useRef<number | null>(null);

    const updateScrollState = React.useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanScrollLeft(scrollLeft > 2);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }, []);

    React.useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        updateScrollState();

        const t1 = setTimeout(updateScrollState, 50);
        const t2 = setTimeout(updateScrollState, 200);

        const onScroll = () => updateScrollState();
        el.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [screenshots?.length, updateScrollState]);

    React.useEffect(() => {
        return () => {
            if (animRef.current !== null) {
                cancelAnimationFrame(animRef.current);
                animRef.current = null;
            }
        };
    }, []);

    if (!screenshots || screenshots.length === 0) return null;

    const animateScrollBy = (distance: number, duration = 500) => {
        const el = scrollerRef.current;
        if (!el) return;
        if (animRef.current !== null) {
            cancelAnimationFrame(animRef.current);
            animRef.current = null;
        }
        const startLeft = el.scrollLeft;
        const maxLeft = el.scrollWidth - el.clientWidth;
        const targetLeft = Math.max(0, Math.min(startLeft + distance, maxLeft));
        const delta = targetLeft - startLeft;
        if (delta === 0) return;
        const startTime = performance.now();
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const step = (now: number) => {
            const t = Math.min(1, (now - startTime) / duration);
            const eased = easeOutCubic(t);
            el.scrollLeft = startLeft + delta * eased;
            updateScrollState();
            if (t < 1) {
                animRef.current = requestAnimationFrame(step);
            } else {
                animRef.current = null;
            }
        };

        animRef.current = requestAnimationFrame(step);
    };

    const scrollByAmount = (dir: 1 | -1) => {
        const el = scrollerRef.current;
        if (!el) return;
        const cardWidth = 320;
        const spacing = 16;
        const base = cardWidth + spacing;
        const scrollDistance = base * 1.25 * dir;
        animateScrollBy(scrollDistance, 500);
    };

    return (
        <div className="py-8 relative overflow-hidden">
            {canScrollLeft && (
                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0A0A10] to-transparent z-10" />
            )}
            {canScrollRight && (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0A0A10] to-transparent z-10" />
            )}

            <button
                type="button"
                aria-label="Previous screenshots"
                onClick={() => scrollByAmount(-1)}
                disabled={!canScrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/50 border border-white/10 text-white hover:bg-black/60 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
                type="button"
                aria-label="Next screenshots"
                onClick={() => scrollByAmount(1)}
                disabled={!canScrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/50 border border-white/10 text-white hover:bg-black/60 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
                <ChevronRightIcon className="w-5 h-5" />
            </button>

            <div
                ref={scrollerRef}
                className="flex overflow-x-auto space-x-4 no-scrollbar py-2"
            >
                {screenshots.map((src, index) => (
                    <button
                        type="button"
                        key={index}
                        className="flex-shrink-0 w-80 h-44 rounded-lg overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        onClick={() => onScreenshotClick(index)}
                        aria-label={`View screenshot ${index + 1} of ${title} in fullscreen`}
                    >
                        <img
                            src={src}
                            alt={`${title} screenshot ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onLoad={updateScrollState}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
interface GameDetailsPageProps {
    t: (key: string) => string;
    language: Language;
    currentUser: User | null;
    isLoggedIn: boolean;
    onTopUpClick: () => void;
    onLoginClick: () => void;
}

const GameDetailsPage: React.FC<GameDetailsPageProps> = ({ t, language, currentUser, isLoggedIn, onTopUpClick, onLoginClick }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { addToast } = useToast();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) return;
      setLoading(true);
      try {
        const fetchedGame = await api.getGameById(gameId);
        setGame(fetchedGame || null);
      } catch (error) {
        console.error("Failed to fetch game details:", error);
        setGame(null);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [gameId]);

  const [coverSrc, setCoverSrc] = useState<string>('');
  const [wideSrc, setWideSrc] = useState<string>('');
  const [screenshotsSrc, setScreenshotsSrc] = useState<string[]>([]);

  useEffect(() => {
    if (!game) return;
    let canceled = false;
    (async () => {
      const { getImageSrc, getLocalScreenshots } = await import('../utils/imageUtils');
      const cover = await getImageSrc(game.title, game.image);
      const wide = await getImageSrc(game.title, game.wideImage || game.image);
      const shots = await getLocalScreenshots(game.title, game.screenshots || []);
      if (!canceled) {
        setCoverSrc(cover);
        setWideSrc(wide);
        setScreenshotsSrc(shots);
      }
    })();
    return () => { canceled = true; };
  }, [game]);

  const handlePlayClick = () => {
    if (!isLoggedIn) {
        onLoginClick();
    } else if (currentUser && currentUser.balance > 0) {
        addToast(t('featureComingSoon'), 'info');
    } else {
        onTopUpClick();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!game) {
    return <div className="min-h-screen flex items-center justify-center">Game not found.</div>;
  }

  const getGameDescription = (game: Game, language: Language): string => {
    if (game.descriptions && game.descriptions[language]) return game.descriptions[language];
    if (game.description) return game.description;
    return "No description available.";
  };

  const descriptionText = getGameDescription(game, language);
  const tags = [...game.genres];

  return (
    <div className="bg-[#0A0A10] text-white w-full overflow-x-hidden">
      {isShareModalOpen && <ShareModal url={window.location.href} onClose={() => setIsShareModalOpen(false)} t={t} />}
      {lightboxIndex !== null && screenshotsSrc.length > 0 && (
          <ScreenshotLightbox
            screenshots={screenshotsSrc}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            title={game.title}
          />
      )}
      
      <div className="relative h-64 md:h-96 w-full">
        <img src={wideSrc} alt={`${game.title} background`} className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A10] to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-10">
        <nav className="breadcrumb text-sm text-gray-400 mb-6" aria-label="breadcrumb">
            <ol className="flex space-x-2 items-center">
                <li><Link to="/" className="hover:underline hover:text-white">{t('cloudPlayBrandName')}</Link></li>
                <li><span className="text-gray-600">/</span></li>
                <li><Link to="/games" className="hover:underline hover:text-white">{t('games')}</Link></li>
                <li><span className="text-gray-600">/</span></li>
                <li className="text-gray-200 truncate" aria-current="page">{game.title}</li>
            </ol>
        </nav>
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12 w-full max-w-full">
          <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden shadow-2xl shadow-blue-500/10">
            <img src={coverSrc} alt={game.title} className="w-full h-full object-cover fade-in-on-load" />
          </div>
          <div className="flex-grow pt-4 min-w-0">
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-4 break-words">{game.title}</h1>
            <div className="w-full mb-6">
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                {tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/all-games?filter=${encodeURIComponent(tag)}`}
                      className="bg-white/10 text-gray-300 text-xs px-3 py-1.5 rounded-full shrink-0 hover:bg-white/20 hover:text-white transition-colors"
                    >
                      {tag}
                    </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={handlePlayClick} className="bg-theme-gradient text-white font-bold text-lg rounded-lg px-8 py-3 hover-glow transition-all shadow-lg transform hover:scale-105">{t('playNow')}</button>
              <button onClick={() => setIsShareModalOpen(true)} className="bg-white/10 text-white rounded-lg p-3 hover:bg-white/20 transition-colors">
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-2xl font-bold mb-4">About This Game</h3>
                <p className="text-gray-400 leading-relaxed whitespace-pre-line">{descriptionText}</p>
            </div>
            <div className="space-y-6">
                <div className="glass p-4 rounded-lg grid grid-cols-2 gap-4">
                    <InfoBlock label="Publisher" value={game.publisher} />
                    <InfoBlock label="Age Rating" value={game.ageRating ? `${game.ageRating}+` : undefined} />
                </div>

                {game.stores && game.stores.length > 0 && (
                    <div className="glass p-4 rounded-lg">
                        <h4 className="text-sm text-gray-400 font-medium mb-2">Available on</h4>
                        <div className="flex flex-wrap gap-3">
                            {game.stores.map(store => (
                                <StoreTag key={store} store={store} url={game.storeLinks?.[store]} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <ScreenshotGallery screenshots={screenshotsSrc} title={game.title} onScreenshotClick={setLightboxIndex} />

      </div>
    </div>
  );
};

export default GameDetailsPage;