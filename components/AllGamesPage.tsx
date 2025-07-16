import React, { useState, useMemo, useEffect } from 'react';
import GameCard from './GameCard';
import { Game } from '../types';
import { api } from '../services/api';
import { ChevronDownIcon, ChevronLeftIcon } from './icons';

const ITEMS_PER_PAGE = 24;

interface NavigateOptions {
  game?: Game;
  filter?: string;
  search?: string;
}

interface AllGamesPageProps {
    navigate: (page: string, options?: NavigateOptions) => void;
    initialFilter: string;
    searchQuery: string;
    t: (key: string) => string;
}

const AllGamesPage: React.FC<AllGamesPageProps> = ({ navigate, initialFilter, searchQuery, t }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [sortOrder, setSortOrder] = useState('popular');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [activeFilterKey, setActiveFilterKey] = useState(initialFilter);
    const [filterOptions, setFilterOptions] = useState<{key: string, label: string}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (searchQuery) {
            setActiveFilterKey('All Games');
        } else {
            setActiveFilterKey(initialFilter);
        }
    }, [initialFilter, searchQuery]);

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
            setVisibleCount(ITEMS_PER_PAGE);
            const options = {
                sort: sortOrder,
                ...(searchQuery ? { search: searchQuery } : { filter: activeFilterKey })
            };
            const fetchedGames = await api.getGames(options);
            setGames(fetchedGames);
            setLoading(false);
        };
        fetchGames();
    }, [activeFilterKey, searchQuery, sortOrder]);


    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
    };
    
    const visibleGames = games.slice(0, visibleCount);

    const sortOptions: { [key: string]: string } = {
        'popular': t('sortByPopularity'),
        'asc': t('sortByAz'),
        'desc': t('sortByZa'),
    };
    
    const handleFilterClick = (filterKey: string) => {
        navigate('all-games', { filter: filterKey });
    };

    const pageTitle = useMemo(() => {
        if (searchQuery) return `${t('searchResFor')} "${searchQuery}"`;
        const currentFilter = filterOptions.find(f => f.key === activeFilterKey);
        return currentFilter ? currentFilter.label : activeFilterKey;
    }, [searchQuery, activeFilterKey, filterOptions, t]);

    const breadcrumbTitle = searchQuery ? t('searchResFor') : pageTitle;

    return (
        <div className="bg-[#0A0A10] text-white min-h-screen">
            <div className="bg-black/30 py-3 sticky top-[72px] z-30 glass">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <button onClick={() => navigate('games')} className="text-gray-300 hover:text-white flex items-center gap-2">
                        <ChevronLeftIcon className="w-5 h-5"/>
                        {t('toCatalog')}
                    </button>
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
                        {!loading && <span className="pageHeader__counter text-gray-400 text-2xl pt-1">{games.length}</span>}
                    </div>
                </div>

                <div className="controls flex items-center justify-between flex-wrap gap-4 mb-8">
                     <div className="w-full md:w-auto md:flex-grow overflow-hidden">
                        <div className="flex items-center space-x-2 pb-2 overflow-x-auto no-scrollbar">
                           {filterOptions.map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => handleFilterClick(filter.key)}
                                    className={`shrink-0 text-sm px-4 py-2 rounded-full transition-all duration-300 ${activeFilterKey === filter.key && !searchQuery ? 'bg-theme-gradient text-white font-semibold shadow-glow' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                                >
                                    {filter.label}
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
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-xl font-medium">Loading games...</p>
                    </div>
                ) : visibleGames.length > 0 ? (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {visibleGames.map(game => (
                            <li key={game.id}>
                                <GameCard game={game} onClick={(game) => navigate('game-details', { game })} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-xl font-medium">{t('noGamesFound')}</p>
                        <p>{t('noGamesFoundDesc')}</p>
                    </div>
                )}


                {!loading && visibleCount < games.length && (
                    <div className="text-center mt-12">
                        <button onClick={handleLoadMore} className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-8 rounded-lg transition-colors">
                            {t('loadMore')}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllGamesPage;