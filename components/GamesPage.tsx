import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { Game, User, Language } from '../types';
import { api } from '../services/api';
import GamesSlider from './games/GamesSlider';
import GameCarousel from './GameCarousel';
import GenreCard from './games/GenreCard';
import CatalogSection from './games/CatalogSection';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface GamesPageProps {
    t: (key: string) => string;
    currentUser: User | null;
    isLoggedIn: boolean;
    onTopUpClick: () => void;
    onLoginClick: () => void;
    language?: Language;
}

const smoothScrollBy = (element: HTMLElement, distance: number, duration: number = 400) => {
    const start = element.scrollLeft;
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = easeOutCubic(progress);
        element.scrollLeft = start + distance * easedProgress;
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    };
    requestAnimationFrame(animateScroll);
};

const GamesPage: React.FC<GamesPageProps> = ({ t, currentUser, isLoggedIn, onTopUpClick, onLoginClick, language }) => {
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 600);

    const searchContainerRef = useRef<HTMLDivElement | null>(null);
    const searchToggleRef = useRef<HTMLButtonElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const filtersContainerRef = useRef<HTMLDivElement | null>(null);

    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);

    // Close search on outside click or Escape
    useEffect(() => {
        if (!isSearchOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(target) &&
                searchToggleRef.current &&
                !searchToggleRef.current.contains(target)
            ) {
                setIsSearchOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSearchOpen]);

    // Focus input after opening (slight delay to allow expand animation)
    useEffect(() => {
        if (isSearchOpen) {
            const id = window.setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                    const len = searchInputRef.current.value.length;
                    try { searchInputRef.current.setSelectionRange(len, len); } catch (e) { console.error("Failed to set selection range", e); }
                }
            }, 200);
            return () => window.clearTimeout(id);
        }
    }, [isSearchOpen]);

    const [availableFilters, setAvailableFilters] = useState<{key: string, label: string}[]>([]);
    const [originalFilterNames, setOriginalFilterNames] = useState<string[]>([]);
    const [topGames, setTopGames] = useState<Game[]>([]);
    const [actionGames, setActionGames] = useState<Game[]>([]);
    const [adventureGames, setAdventureGames] = useState<Game[]>([]);
    const [freeToPlayGames, setFreeToPlayGames] = useState<Game[]>([]);
    const [staticGenres, setStaticGenres] = useState<{ title: string; icon: string; slug: string; }[]>([]);
    // New: dynamic sections for all other categories with at least one game
    const [extraSections, setExtraSections] = useState<{ title: string; games: Game[] }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [
                top, 
                action, 
                adventure, 
                free, 
                sGenres,
                availableGenreFilters
            ] = await Promise.all([
                api.getTopGames(),
                api.getGames({ genre: 'Action', limit: 10 }),
                api.getGames({ genre: 'Adventure', limit: 10 }),
                api.getGames({ genre: 'Free-to-Play', limit: 10 }),
                api.getStaticGenres(),
                api.getAvailableFilters(),
            ]);
            setTopGames(top);
            setActionGames(action);
            setAdventureGames(adventure);
            setFreeToPlayGames(free);
            setStaticGenres(sGenres);
            
            const originalNames = ['All Games', 'Free-to-Play', ...availableGenreFilters];
            setOriginalFilterNames(originalNames);

            const translatedFilters = originalNames.map(filter => {
                if (filter === 'All Games') return { key: filter, label: t('allGames') };
                if (filter === 'Free-to-Play') return { key: filter, label: t('freeToPlay') };
                return { key: filter, label: filter };
            });
            setAvailableFilters(translatedFilters);

            // Build dynamic sections for remaining categories (excluding the ones already shown)
            const excluded = new Set(['Action', 'Adventure', 'Free-to-Play']);
            const dynamicGenres = availableGenreFilters.filter(g => !excluded.has(g));
            if (dynamicGenres.length) {
                const sections = await Promise.all(
                    dynamicGenres.map(async (g) => {
                        const items = await api.getGames({ genre: g, limit: 10 });
                        return { title: g, games: items };
                    })
                );
                setExtraSections(sections.filter(s => s.games && s.games.length > 0));
            } else {
                setExtraSections([]);
            }
        };
        fetchData();
    }, [t]);

    useEffect(() => {
        if (debouncedSearchQuery) {
            navigate(`/all-games?search=${debouncedSearchQuery}`);
        }
    }, [debouncedSearchQuery, navigate]);

    const handleTagClick = (originalFilter: string) => {
        navigate(`/all-games?filter=${originalFilter}`);
    };
    
    const checkScrollButtons = useCallback(() => {
        const container = filtersContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            const scrollEndReached = scrollLeft + clientWidth >= scrollWidth - 2;
            setIsAtStart(scrollLeft <= 2);
            setIsAtEnd(scrollEndReached);
        }
    }, []);

    useEffect(() => {
        const container = filtersContainerRef.current;
        if (container) {
            checkScrollButtons();
            container.addEventListener('scroll', checkScrollButtons, { passive: true });
            const resizeObserver = new ResizeObserver(checkScrollButtons);
            resizeObserver.observe(container);
            return () => {
                container.removeEventListener('scroll', checkScrollButtons);
                resizeObserver.disconnect();
            };
        }
    }, [checkScrollButtons, availableFilters]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (filtersContainerRef.current) {
            const container = filtersContainerRef.current;
            const scrollAmount = 250; // Adjusted for 1-2 buttons
            const distance = direction === 'left' ? -scrollAmount : scrollAmount;
            smoothScrollBy(container, distance, 500); // Slower animation
        }
    };

    return (
        <div className="bg-[#111] text-white min-h-screen">
            <div className="catalogNav bg-[#1a1a1a] py-3 sticky top-[72px] z-30">
                <div className="container mx-auto px-4">
                    <div className="search-and-filters flex items-center gap-2">
                        <div ref={searchContainerRef} className={`search-container ${isSearchOpen ? 'open' : ''}`}>
                            <form onSubmit={(e) => e.preventDefault()} className="search-form">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('searchGames')}
                                    className="search-input"
                                />
                            </form>
                        </div>
                        <button
                            ref={searchToggleRef}
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-colors duration-200 shrink-0"
                            aria-label={isSearchOpen ? 'Close search' : 'Open search'}
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </button>
                        
                        <div className="relative flex-1 min-w-0">
                             <div 
                                ref={filtersContainerRef} 
                                className="filters flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth"
                            >
                                {availableFilters.map((tag, index) => (
                                    <button key={tag.key} onClick={() => handleTagClick(originalFilterNames[index])} className="catalogTags__item shrink-0 btn bg-[#333] text-gray-200 text-sm px-4 py-1.5 rounded-full hover:bg-gray-600 transition-colors">{tag.label}</button>
                                ))}
                            </div>

                            <div className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#1a1a1a] to-transparent transition-opacity duration-300 ${!isAtStart ? 'opacity-100' : 'opacity-0'}`} />
                            <div className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#1a1a1a] to-transparent transition-opacity duration-300 ${!isAtEnd ? 'opacity-100' : 'opacity-0'}`} />

                            <button
                                type="button"
                                aria-label="Scroll left"
                                onClick={() => handleScroll('left')}
                                className={`absolute hidden md:inline-flex -left-1 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-6 h-6 rounded-full bg-gray-800/80 border border-white/10 text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-opacity duration-300 ${!isAtStart ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                aria-label="Scroll right"
                                onClick={() => handleScroll('right')}
                                className={`absolute hidden md:inline-flex -right-1 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-6 h-6 rounded-full bg-gray-800/80 border border-white/10 text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition-opacity duration-300 ${!isAtEnd ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <GamesSlider
                t={t}
                currentUser={currentUser}
                isLoggedIn={isLoggedIn}
                onTopUpClick={onTopUpClick}
                onLoginClick={onLoginClick}
                language={language}
            />

            <CatalogSection title={t('top10')} games={topGames} t={t} isTop10={true} />
            
            <section className="genres py-8 bg-black">
                <div className="container mx-auto px-4">
                    {/* Display the translated "Genres" title */}
                    <h2 className="text-2xl font-medium text-white mb-4">{t('genres')}</h2>
                </div>
                <div className="categorySlider gcSlider relative">
                    <GameCarousel>
                        {staticGenres.map(genre => (
                            <div key={genre.title} className="w-48 sm:w-40 shrink-0">
                                <GenreCard genre={genre} onClick={() => navigate(`/all-games?filter=${genre.title}`)} />
                            </div>
                        ))}
                    </GameCarousel>
                </div>
            </section>

            <div className="bg-black">
              {actionGames && actionGames.length > 0 && (
                <CatalogSection title="Action" games={actionGames} t={t} />
              )}
              {adventureGames && adventureGames.length > 0 && (
                <CatalogSection title="Adventure" games={adventureGames} t={t} />
              )}
              {freeToPlayGames && freeToPlayGames.length > 0 && (
                <CatalogSection title="Free-to-Play" games={freeToPlayGames} t={t} />
              )}
              {/* Dynamic category sections (only those with games) */}
              {extraSections.map(section => (
                <CatalogSection key={section.title} title={section.title} games={section.games} t={t} />
              ))}
            </div>

        </div>
    );
};

export default GamesPage;