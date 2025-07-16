
import React, { useState } from 'react';
import { Game } from '../types';
import { CloseIcon, ShareIcon } from './icons';

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

const StoreTag: React.FC<{ store: string }> = ({ store }) => (
    <span className="capitalize bg-black/40 text-gray-300 text-xs px-2 py-1 rounded">
        {store}
    </span>
);

const ScreenshotGallery: React.FC<{ screenshots?: string[], title: string }> = ({ screenshots, title }) => {
    if (!screenshots || screenshots.length === 0) return null;
    return (
        <div className="py-8">
            <div className="flex overflow-x-auto space-x-4 no-scrollbar py-2">
                {screenshots.map((src, index) => (
                    <div key={index} className="flex-shrink-0 w-80 h-44 rounded-lg overflow-hidden">
                         <img src={src} alt={`${title} screenshot ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                ))}
            </div>
        </div>
    );
};

interface NavigateOptions {
  game?: Game;
  filter?: string;
}

// --- MAIN COMPONENT ---
interface GameDetailsPageProps {
    game: Game;
    navigate: (page: string, options?: NavigateOptions) => void;
    t: (key: string) => string;
}

const GameDetailsPage: React.FC<GameDetailsPageProps> = ({ game, navigate, t }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const tags = [...game.genres];
  
  const descriptionText = game.description || "No description available for this game. Explore the vast world and embark on an epic journey!";

  return (
    <div className="bg-[#0A0A10] text-white">
      {isShareModalOpen && <ShareModal url={window.location.href} onClose={() => setIsShareModalOpen(false)} t={t} />}
      
      <div className="relative h-64 md:h-96 w-full">
        <img src={game.wideImage || game.image} alt={`${game.title} background`} className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A10] to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-10">
        <nav className="breadcrumb text-sm text-gray-400 mb-6" aria-label="breadcrumb">
            <ol className="flex space-x-2 items-center">
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }} className="hover:underline hover:text-white">{t('cloudPlayBrandName')}</a></li>
                <li><span className="text-gray-600">/</span></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('games'); }} className="hover:underline hover:text-white">{t('games')}</a></li>
                <li><span className="text-gray-600">/</span></li>
                <li className="text-gray-200 truncate" aria-current="page">{game.title}</li>
            </ol>
        </nav>
        
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-lg overflow-hidden shadow-2xl shadow-blue-500/10">
            <img src={game.image} alt={game.title} className="w-full h-full object-cover fade-in-on-load" />
          </div>
          <div className="flex-grow pt-4">
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-4">{game.title}</h1>
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {tags.map(tag => (
                    <a 
                      href="#"
                      key={tag} 
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        navigate('all-games', { filter: tag });
                      }}
                      className="bg-white/10 text-gray-300 text-xs px-3 py-1.5 rounded-full shrink-0 hover:bg-white/20 hover:text-white transition-colors"
                    >
                      {tag}
                    </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="#" className="bg-theme-gradient text-white font-bold text-lg rounded-lg px-8 py-3 hover-glow transition-all shadow-lg transform hover:scale-105">{t('playNow')}</a>
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
                        <div className="flex flex-wrap gap-2">
                            {game.stores.map(store => <StoreTag key={store} store={store} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <ScreenshotGallery screenshots={game.screenshots} title={game.title} />

      </div>
    </div>
  );
};

export default GameDetailsPage;
