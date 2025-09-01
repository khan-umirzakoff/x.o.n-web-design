import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import GameCard from './GameCard';
import { Game } from '../types';
import { api } from '../services/api';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import { GameCardSkeleton } from './SkeletonLoader';
import { useDebounce } from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 24;

interface AllGamesPageProps {
    t: (key: string) => string;
}

const smoothScrollBy = (element: HTMLElement, distance: number, duration: number = 400) => {
    const start = element.scrollLeft;
    const startTime = performance.now();

    // ease-out cubic function: starts fast, decelerates to a halt
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


const AllGamesPage: React.FC<AllGamesPageProps> = ({ t }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'All Games';
    const search = searchParams.get('search') || '';

    const [games, setGames] = useState<Game[]>([]);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);
    const [sortOrder, setSortOrder] = useState('popular');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState<{key: string, label: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastGameElementRef = useRef<HTMLDivElement>(null);
    const gamesPerPage = ITEMS_PER_PAGE;
    const [page, setPage] = useState(1);
    
    const filtersContainerRef = useRef<HTMLDivElement | null>(null);
    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);

    // Search state and refs
    const [searchQuery, setSearchQuery] = useState<string>(search || '');
    const debouncedSearchQuery = useDebounce(searchQuery, 600);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // Focus input on initial mount if search is active
    useEffect(() => {
        if (search && searchInputRef.current) {
            searchInputRef.current.focus();
            const len = searchInputRef.current.value.length;
            try { searchInputRef.current.setSelectionRange(len, len); } catch (e) { console.error(e) }
        }
    }, [search]);

    // Update URL when search query changes
    useEffect(() => {
        const newSearch = debouncedSearchQuery || '';
        if (newSearch !== search) {
            setSearchParams({ filter, search: newSearch }, { replace: true });
        }
    }, [debouncedSearchQuery, filter, search, setSearchParams]);

    useEffect(() => {
        const fetchFilters = async () => {
            const genres = await api.getAvailableFilters();
            const filters = [
                { key: 'All Games', label: t('allGames') },
                { key: 'Free-to-Play', label: t('freeToPlay') },
                ...genres.map(g => ({ key: g, label: g }))
            ];
            setFilterOptions(filters);
        };
        fetchFilters();
    }, [t]);

    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            setPage(1); // Reset page on new filter/sort
            const options = {
                sort: sortOrder,
                filter: filter,
            };
            const fetchedGames = await api.getGames(options);
            setGames(fetchedGames);
            setLoading(false);
        };
        fetchGames();
    }, [filter, sortOrder]);

    useEffect(() => {
        const query = search.toLowerCase();
        const filtered = games.filter(game => {
            return query ? game.title.toLowerCase().includes(query) : true;
        });
        setFilteredGames(filtered);
    }, [games, search]);

    const handleLoadMore = useCallback(() => {
        setPage(prevPage => prevPage + 1);
    }, []);

    useEffect(() => {
        if (loading) return;

        const currentElement = lastGameElementRef.current;
        const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

        if (observer.current) observer.current.disconnect();

        if (currentElement && page < totalPages) {
            const intersectionObserver = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    handleLoadMore();
                }
            }, { threshold: 1.0 });
            intersectionObserver.observe(currentElement);
            observer.current = intersectionObserver;
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [loading, page, filteredGames.length, gamesPerPage, handleLoadMore]);

    const visibleGames = useMemo(() => filteredGames.slice(0, page * gamesPerPage), [filteredGames, page, gamesPerPage]);

    const sortOptions: { [key: string]: string } = useMemo(() => ({
        'popular': t('sortByPopularity'),
        'asc': t('sortByAz'),
        'desc': t('sortByZa'),
    }), [t]);

    const handleFilterChange = (newFilter: string) => {
        setSearchParams({ filter: newFilter, search });
    };

    const pageTitle = useMemo(() => {
        const currentFilter = filterOptions.find(f => f.key === filter);
        return currentFilter ? currentFilter.label : filter;
    }, [filter, filterOptions]);
    
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
    }, [checkScrollButtons, filterOptions]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (filtersContainerRef.current) {
            const container = filtersContainerRef.current;
            const scrollAmount = 250; // Adjusted for 1-2 buttons
            const distance = direction === 'left' ? -scrollAmount : scrollAmount;
            smoothScrollBy(container, distance, 500); // Slower animation
        }
    };

    return (
        <div className="bg-[#0A0A10] text-white min-h-screen">
            <div className="bg-black/30 py-3 sticky top-[72px] z-30 glass">
                <div className="container mx-auto px-4 flex items-center justify-between gap-3">
                    <button onClick={() => navigate('/games')} className="text-gray-300 hover:text-white flex items-center gap-2 shrink-0">
                        <ChevronLeftIcon className="w-5 h-5"/>
                        {t('toCatalog')}
                    </button>
                    <div className="search flex-1 max-w-md">
                        <form onSubmit={(e) => e.preventDefault()} className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('searchGames')}
                                className="w-full bg-white/5 border border-white/10 text-white pl-4 pr-10 py-2 rounded-full focus:bg-white/10 focus:border-indigo-500 outline-none"
                            />
                            {searchQuery && (
                                <button 
                                    type="button"
                                    onClick={() => setSearchQuery('')} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                       <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                   </svg>
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <nav className="breadcrumb text-sm text-gray-500 mb-6" aria-label="breadcrumb">
                    <ol className="flex items-center space-x-2">
                        <li><Link to="/" className="hover:underline">X.O.N</Link></li>
                        <li><span className="text-gray-600">/</span></li>
                        <li><Link to="/games" className="hover:underline">{t('games')}</Link></li>
                        <li><span className="text-gray-600">/</span></li>
                        <li className="text-gray-300" aria-current="page">{pageTitle}</li>
                    </ol>
                </nav>

                <div className="pageHeader mb-6">
                    <div className="pageHeader__titleWrap flex items-center gap-4">
                        <h1 className="pageHeader__title text-4xl font-orbitron font-bold">{pageTitle}</h1>
                        {!loading && <span className="pageHeader__counter text-gray-400 text-2xl pt-1">{filteredGames.length}</span>}
                    </div>
                </div>

                <div className="controls flex items-center justify-between flex-wrap gap-4 mb-8">
                    <div className="relative flex-1 min-w-0">
                        <div
                            ref={filtersContainerRef}
                            className="flex items-center space-x-2 pb-2 overflow-x-auto no-scrollbar scroll-smooth pr-8 md:pr-0"
                        >
                           {filterOptions.map((filterOpt) => (
                                <button
                                    key={filterOpt.key}
                                    onClick={() => handleFilterChange(filterOpt.key)}
                                    className={`shrink-0 text-sm px-4 py-2 rounded-full transition-all duration-300 ${filter === filterOpt.key ? 'bg-theme-gradient text-white font-semibold shadow-glow' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                                >
                                    {filterOpt.label}
                                </button>
                            ))}
                        </div>

                        <div className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0A0A10] to-transparent transition-opacity duration-300 ${!isAtStart ? 'opacity-100' : 'opacity-0'}`} />
                        <div className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0A0A10] to-transparent transition-opacity duration-300 ${!isAtEnd ? 'opacity-100' : 'opacity-0'}`} />

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
                    <div className="sort relative ml-auto md:ml-4">
                        <button onClick={() => setIsSortOpen(!isSortOpen)} className="bg-white/5 hover:bg-white/10 text-gray-200 px-4 py-2 rounded-md flex items-center gap-2">
                            <span>{sortOptions[sortOrder]}</span>
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>
                         {isSortOpen && (
                            <ul className="absolute right-0 mt-2 w-48 glass rounded-md shadow-lg z-20" onMouseLeave={() => setIsSortOpen(false)}>
                                {Object.entries(sortOptions).map(([key, value]) => (
                                    <li key={key}>
                                        <button onClick={() => { setSortOrder(key); setIsSortOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5">
                                            {value}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                {loading ? (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                            <li key={index}>
                                <GameCardSkeleton />
                            </li>
                        ))}
                    </ul>
                ) : visibleGames.length > 0 ? (
                    <>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {visibleGames.map((game) => (
                                <li key={game.id}>
                                    <Link to={`/game/${game.id}`}>
                                        <GameCard game={game} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        {/* This div is the trigger for loading more games. It's placed after the list of visible games. */}
                        {page < Math.ceil(filteredGames.length / gamesPerPage) && (
                            <div ref={lastGameElementRef} style={{ height: '20px' }}>
                                {/* You can place a loading spinner here if you want */}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-400">{t('noGamesFound')}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllGamesPage;