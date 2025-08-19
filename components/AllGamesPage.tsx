import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import GameCard from './GameCard';
import { Game } from '../types';
import { api } from '../services/api';
import { ChevronDownIcon, ChevronLeftIcon } from './icons';
import { GameCardSkeleton } from './SkeletonLoader';
import { useDebounce } from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 24;

interface NavigateOptions {
  game?: Game;
  filter?: string;
  search?: string;
}

interface AllGamesPageProps {
    navigate: (page: string, options?: NavigateOptions) => void;
    t: (key: string) => string;
    filter: string;
    search?: string;
}

const AllGamesPage: React.FC<AllGamesPageProps> = ({ navigate, t, filter, search }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [sortOrder, setSortOrder] = useState('popular');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState<{key: string, label: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastGameElementRef = useRef<HTMLDivElement>(null);
    const gamesPerPage = ITEMS_PER_PAGE;
    const [page, setPage] = useState(1);

    // Search state and refs
    const [searchQuery, setSearchQuery] = useState<string>(search || '');
    const debouncedSearchQuery = useDebounce(searchQuery, 600);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // Focus input on initial mount (useful when redirected here from other pages)
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
            const len = searchInputRef.current.value.length;
            try { searchInputRef.current.setSelectionRange(len, len); } catch {}
        }
    }, []);

    // Keep local search state in sync if parent passes updated search
    useEffect(() => {
        if (typeof search === 'string' && search !== searchQuery) {
            setSearchQuery(search);
        }
    }, [search]);

    // Navigate to keep URL/state consistent on debounced search
    useEffect(() => {
        const nextSearch = (debouncedSearchQuery || '');
        const currentSearch = (search || '');
        
        // Guard: only navigate if the debounced search query has changed
        if (nextSearch !== currentSearch) {
            navigate('all-games', { filter: filter, search: nextSearch });
        }
    }, [debouncedSearchQuery, filter, search]);

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
            setVisibleCount(ITEMS_PER_PAGE); // Reset visible count on new fetch
            const options = {
                sort: sortOrder,
                filter: filter, // Pass the current filter
            };
            const fetchedGames = await api.getGames(options);
            setGames(fetchedGames);
            setLoading(false);
        };
        fetchGames();
    }, [filter, sortOrder]);

    useEffect(() => {
        const query = (debouncedSearchQuery || '').toLowerCase();
        const filtered = games.filter(game => {
            const byTitle = query ? game.title.toLowerCase().includes(query) : true;
            return byTitle;
        });
        setFilteredGames(filtered);
    }, [games, debouncedSearchQuery]);

    const handleLoadMore = useCallback(() => {
        // Use a functional update to ensure we have the latest count
        // without needing `visibleCount` in the dependency array.
        setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
    }, []);

    useEffect(() => {
        if (loading) return;

        const currentElement = lastGameElementRef.current;
        // We need to check if there are more games to load than are currently visible.
        const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

        if (observer.current) {
            observer.current.disconnect();
        }

        if (currentElement && page < totalPages) {
            const intersectionObserver = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    handleLoadMore();
                    setPage(page + 1);
                }
            });
            intersectionObserver.observe(currentElement);
            observer.current = intersectionObserver;
        }
        // Re-run the effect if loading state, games list, or visible count changes.
    }, [loading, games, visibleCount, handleLoadMore, page]);

    const visibleGames = useMemo(() => filteredGames.slice(0, page * gamesPerPage), [filteredGames, page]);

    const sortOptions: { [key: string]: string } = {
        'popular': t('sortByPopularity'),
        'asc': t('sortByAz'),
        'desc': t('sortByZa'),
    };

    const handleFilterChange = (type: 'genre' | 'platform', value: string) => {
        // Update via App's navigate to avoid malformed URLs
        navigate('all-games', { filter: value, search: searchQuery });
    };

    const pageTitle = useMemo(() => {
        const currentFilter = filterOptions.find(f => f.key === filter);
        return currentFilter ? currentFilter.label : filter;
    }, [filter, filterOptions, t]);

    const breadcrumbTitle = pageTitle;

    return (
        <div className="bg-[#0A0A10] text-white min-h-screen">
            <div className="bg-black/30 py-3 sticky top-[72px] z-30 glass">
                <div className="container mx-auto px-4 flex items-center justify-between gap-3">
                    <button onClick={() => navigate('games')} className="text-gray-300 hover:text-white flex items-center gap-2 shrink-0">
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
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }} className="hover:underline">CLOUD PLAY</a></li>
                        <li><span className="text-gray-600">/</span></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('games'); }} className="hover:underline">{t('games')}</a></li>
                        <li><span className="text-gray-600">/</span></li>
                        <li className="text-gray-300" aria-current="page">{breadcrumbTitle}</li>
                    </ol>
                </nav>

                <div className="pageHeader mb-6">
                    <div className="pageHeader__titleWrap flex items-center gap-4">
                        <h1 className="pageHeader__title text-4xl font-orbitron font-bold">{pageTitle}</h1>
                        {!loading && <span className="pageHeader__counter text-gray-400 text-2xl pt-1">{filteredGames.length}</span>}
                    </div>
                </div>

                <div className="controls flex items-center justify-between flex-wrap gap-4 mb-8">
                     <div className="w-full md:w-auto md:flex-grow overflow-hidden">
                        <div className="flex items-center space-x-2 pb-2 overflow-x-auto no-scrollbar px-4 -mx-4">
                           {filterOptions.map((filterOpt) => (
                                <button
                                    key={filterOpt.key}
                                    onClick={() => handleFilterChange('genre', filterOpt.key)}
                                    className={`shrink-0 text-sm px-4 py-2 rounded-full transition-all duration-300 ${filter === filterOpt.key ? 'bg-theme-gradient text-white font-semibold shadow-glow' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                                >
                                    {filterOpt.label}
                                </button>
                            ))}
                        </div>
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
                                <GameCard key={game.id} game={game} onClick={() => navigate('game-details', { game })} />
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
