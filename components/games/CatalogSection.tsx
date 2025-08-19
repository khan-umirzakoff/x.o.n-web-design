import React from 'react';
import GameCarousel from '../GameCarousel';
import GameCard from '../GameCard';
import { Game } from '../../types';

interface NavigateOptions {
  game?: Game;
  filter?: string;
  search?: string;
}

interface CatalogSectionProps {
    title: string;
    games: Game[];
    navigate: (page: string, options?: NavigateOptions) => void;
    t: (key: string) => string;
    isTop10?: boolean;
}

const CatalogSection: React.FC<CatalogSectionProps> = ({ title, games, navigate, t, isTop10 = false }) => {
    // Hide section completely if there are no games
    if (!games || games.length === 0) {
        return null;
    }

    const handleTitleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        // For Top 10, navigate to all games without a filter. For others, filter by title.
        const filter = isTop10 ? 'All Games' : title;
        navigate('all-games', { filter });
    };

    return (
        <section className="catalogSection py-8">
            <div className="container mx-auto px-4">
                <h2 className="catalogSection__title text-2xl font-medium text-white mb-4">
                    <a href="#" onClick={handleTitleClick} className="hover:underline flex items-center gap-2">{title}
                        {!isTop10 && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>}
                    </a>
                </h2>
            </div>
            <div className="categorySlider gcSlider relative">
                <GameCarousel>
                    {games.slice(0, 10).map(game => (
                         <div key={game.id} className="w-48 sm:w-40 shrink-0">
                            <GameCard game={game} onClick={(game) => navigate('game-details', { game })} />
                        </div>
                    ))}
                    {!isTop10 && (
                        <a href="#" onClick={handleTitleClick} className="seeMore flex flex-col items-center justify-center w-48 sm:w-40 shrink-0 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors">
                            <div className="seeMore__icon w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                                <img src="/assets/images/misc/arrow-right.svg" alt="See more" className="fade-in-on-load" />
                            </div>
                            <div className="seeMore__title text-white">{t('viewAll')}</div>
                        </a>
                    )}
                </GameCarousel>
            </div>
        </section>
    );
};

export default CatalogSection;
