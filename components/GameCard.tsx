
import React, { useState } from 'react';
import { Game, Language } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { loggingService } from '../services/loggingService';

interface GameCardProps {
    game: Game;
    onClick?: (game: Game) => void;
    language?: Language;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick, language = 'ENG' }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { t } = useTranslation(language);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (onClick) {
            onClick(game);
        }
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setImageError(true);
        setImageLoaded(true);
        loggingService.logError(new Error('Image failed to load'), {
            component: 'GameCard',
            imageSrc: event.currentTarget.src,
            gameTitle: game.title,
        });
    };

    return (
        <a
            href="#"
            onClick={handleClick}
            className="gameCard group block relative rounded-lg overflow-hidden shrink-0 aspect-square cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onClick) {
                        onClick(game);
                    }
                }
            }}
            aria-label={`${game.title} o'yinini ochish`}
        >
            <div className="absolute -inset-px bg-theme-gradient rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 z-0"></div>
            <div className="relative w-full h-full bg-gray-900 rounded-md">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                    </div>
                )}
{imageError ? (
  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
    <div className="text-center text-gray-400">
      <div className="text-4xl mb-2">🎮</div>
      <div className="text-sm">{t('imageLoadError')}</div>
    </div>
  </div>
) : (
  <img
    className={`object-cover w-full h-full transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
    src={game.image}
    alt={game.title}
    loading="lazy"
    onLoad={handleImageLoad}
    onError={handleImageError}
  />
)}
                
                {/* Game info overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
                    <div className="font-bold text-white text-base leading-tight drop-shadow-md">{game.title}</div>
                    <div className="text-gray-400 text-xs mt-1 truncate">{game.genres.join(', ')}</div>
                    
                    {/* Game badges */}
                    <div className="flex items-center gap-2 mt-2">
                        {game.isFree && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                Bepul
                            </span>
                        )}
                        {game.rtx && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                RTX
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </a>
    );
};

export default GameCard;







