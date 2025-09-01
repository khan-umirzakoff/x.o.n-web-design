import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { resolveStoreIcon } from '../utils/imageUtils';

interface GameCardProps {
    game: Game;
    onClick?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    // Use local-first source for cover art
    const [imageSrc, setImageSrc] = useState<string>(game.image);

    useEffect(() => {
        let canceled = false;
        (async () => {
            const { getImageSrc } = await import('../utils/imageUtils');
            const src = await getImageSrc(game.title, game.image);
            if (!canceled) setImageSrc(src);
        })();
        return () => { canceled = true; };
    }, [game.title, game.image]);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div
            className="gameCard group block relative rounded-lg overflow-hidden shrink-0 aspect-square cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full"
            aria-label={`Play ${game.title} - ${game.genres.join(", ")}`}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleKeyDown}
        >
            <div className="absolute -inset-px bg-theme-gradient rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 z-0"></div>
            <div className="relative w-full h-full bg-surface-variant rounded-md">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-surface animate-pulse flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin"></div>
                    </div>
                )}
{imageError ? (
  <div className="w-full h-full bg-black flex items-center justify-center p-4">
    <div className="text-center font-orbitron text-white text-xl font-bold select-none">
      X.O.N
    </div>
  </div>
) : (
  <img
    crossOrigin="anonymous"
    className={`object-cover w-full h-full transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
    src={imageSrc}
    alt={game.title}
    loading="lazy"
    onLoad={handleImageLoad}
    onError={handleImageError}
  />
)}
                
                {/* Game info overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 sm:p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
                    <div className="font-bold text-white text-base leading-tight drop-shadow-md">{game.title}</div>
                    <div className="text-on-surface-variant text-xs mt-1 truncate">{game.genres.join(', ')}</div>
                    
                    {/* Game badges */}
                    <div className="flex items-center gap-2 mt-2">
                        {game.isFree && (
                            <span className="bg-white/10 text-gray-200 text-xs px-2 py-0.5 rounded-full font-medium ring-1 ring-white/10">
                                Bepul
                            </span>
                        )}
                        {game.rtx && (
                            <span className="bg-black/40 backdrop-blur-sm text-theme-gradient text-xs px-2 py-0.5 rounded-full font-medium ring-1 ring-white/10 shadow-sm">
                                RTX
                            </span>
                        )}
                        {Array.isArray(game.stores) && game.stores.length > 0 && (
                            <span className="inline-flex items-center gap-1 flex-shrink-0">
                                {game.stores.slice(0, 3).map((store, idx) => {
                                    const icon = resolveStoreIcon(store);
                                    return icon ? (
                                        <img
                                            key={store + idx}
                                            src={icon}
                                            alt={store}
                                            className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                                            loading="lazy"
                                        />
                                    ) : null;
                                })}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
