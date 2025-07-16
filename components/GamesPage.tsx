import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { api } from '../services/api';
import GamesSlider from './games/GamesSlider';
import GenreCard from './games/GenreCard';
import CatalogSection from './games/CatalogSection';

interface NavigateOptions {
  game?: Game;
  filter?: string;
  search?: string;
}

interface GamesPageProps {
    navigate: (page: string, options?: NavigateOptions) => void;
    t: (key: string) => string;
}

const GamesPage: React.FC<GamesPageProps> = ({ navigate, t }) => {
    const [searchValue, setSearchValue] = useState('');
    const [availableFilters, setAvailableFilters] = useState<{key: string, label: string}[]>([]);
    const [originalFilterNames, setOriginalFilterNames] = useState<string[]>([]);
    const [topGames, setTopGames] = useState<Game[]>([]);
    const [actionGames, setActionGames] = useState<Game[]>([]);
    const [adventureGames, setAdventureGames] = useState<Game[]>([]);
    const [freeToPlayGames, setFreeToPlayGames] = useState<Game[]>([]);
    const [staticGenres, setStaticGenres] = useState<{ title: string; icon: string; slug: string; }[]>([]);

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
        };
        fetchData();
    }, [t]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate('all-games', { search: searchValue.trim() });
        }
    };

    const handleTagClick = (e: React.MouseEvent<HTMLAnchorElement>, originalFilter: string) => {
        e.preventDefault();
        navigate('all-games', { filter: originalFilter });
    };

    return (
        <div className="bg-[#111] text-white min-h-screen">
            <div className="catalogNav bg-[#1a1a1a] py-3 sticky top-[72px] lg:top-[56px] z-30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearch} className="catalogSearch flex-grow relative">
                            <input 
                                type="search" 
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="bg-[#2b2b2b] border border-gray-600 text-white placeholder-gray-400 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 pl-10" 
                                placeholder={t('searchPlaceholder')}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                        </form>
                    </div>
                     <div className="catalogTags mt-3">
                        <div className="flex space-x-2 pb-2 overflow-x-auto no-scrollbar">
                           {availableFilters.map((tag, index) => (
                            <a key={tag.key} href="#" onClick={(e) => handleTagClick(e, originalFilterNames[index])} className="catalogTags__item shrink-0 btn bg-[#333] text-gray-200 text-sm px-4 py-1.5 rounded-full hover:bg-gray-600 transition-colors">{tag.label}</a>
                           ))}
                        </div>
                    </div>
                </div>
            </div>

            <GamesSlider navigate={navigate} t={t} />

            <CatalogSection title={t('top10')} games={topGames} navigate={navigate} t={t} isTop10={true} />
            
            <section className="genres py-8 bg-black">
                <div className="container mx-auto px-4">
                    <div className="relative">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                           {staticGenres.map(genre => (
                                <GenreCard key={genre.title} genre={genre} onClick={() => navigate('all-games', { filter: genre.title })} />
                           ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-black">
              <CatalogSection title="Action" games={actionGames} navigate={navigate} t={t} />
              <CatalogSection title="Adventure" games={adventureGames} navigate={navigate} t={t} />
              <CatalogSection title="Free-to-Play" games={freeToPlayGames} navigate={navigate} t={t} />
            </div>

        </div>
    );
};

export default GamesPage;