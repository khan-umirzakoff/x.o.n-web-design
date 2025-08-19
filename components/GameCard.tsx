import React, { useState, useEffect } from 'react';
import { Game, Language } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { loggingService } from '../services/loggingService';

// Store icon mapping (reused from GameDetailsPage)
const STORE_ICON_MAP = {
    steam: '/assets/images/icons/support/steam.svg',
    epicgames: '/assets/images/icons/support/epicgames.svg',
    gog: '/assets/images/icons/support/gog.svg',
    eaapp: '/assets/images/icons/support/eaapp.svg',
    origin: '/assets/images/icons/support/eaapp.svg',
    uplay: '/assets/images/icons/support/uplay.svg',
    ubisoft: '/assets/images/icons/support/uplay.svg',
    battlenet: '/assets/images/icons/support/battlenet.svg',
    xbox: '/assets/images/icons/support/xbox.svg',
} as const;

const resolveStoreIcon = (store: string): string | undefined => {
    const normalized = store.toLowerCase().replace(/[\s-_]/g, '');
    return STORE_ICON_MAP[normalized as keyof typeof STORE_ICON_MAP] || 
           STORE_ICON_MAP[store.toLowerCase() as keyof typeof STORE_ICON_MAP];
};

interface GameCardProps {
    game: Game;
    onClick?: (game: Game) => void;
    language?: Language;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick, language = 'ENG' }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { t } = useTranslation(language);
    // Use local-first source for cover art
    const [imageSrc, setImageSrc] = useState<string>(game.image);

    useEffect(() => {
        let canceled = false;
        (async () => {
            const { getImageSrc } = await import('../utils/imageUtils');
            const src = await getImageSrc(game.title, game.image, 'art');
            if (!canceled) setImageSrc(src);
        })();
        return () => { canceled = true; };
    }, [game.title, game.image]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (onClick) {
            onClick(game);
        }
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(true);
    };

    return (
        <button onClick={handleClick} type="button"
            className="gameCard group block relative rounded-lg overflow-hidden shrink-0 aspect-square cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 w-full"
            
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onClick) {
                        onClick(game);
                    }
                }
            }}
            aria-label={`Play ${game.title} - ${game.genres.join(", ")}`}
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
      CLOUD PLAY
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
                            <span className="bg-tertiary text-on-tertiary text-xs px-3 py-1.5 rounded-full font-medium">
                                Bepul
                            </span>
                        )}
                        {game.rtx && (
                            <span className="bg-secondary text-on-tertiary text-xs px-2.5 py-1.5 rounded-full font-medium inline-flex items-center gap-2">
                                <span>RTX</span>
                                {/* Store icons next to RTX on hover */}
                                {Array.isArray(game.stores) && game.stores.length > 0 && (
                                    <span className="inline-flex items-center gap-1 pl-1 border-l border-white/20">
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
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};

export default GameCard;
