
import React from 'react';
import { LoginIcon, LogoutIcon } from './icons';
import { User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  isLoggedIn: boolean;
  navigate: (page: string, options?: object) => void;
  t: (key: string) => string;
  onLoginClick: () => void;
  onLogout: () => void;
  currentUser: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    isLoggedIn,
    navigate,
    t,
    onLoginClick,
    onLogout,
    currentUser
}) => {
  return (
    <div
      className={`fixed top-[72px] right-0 h-[calc(100vh-72px)] w-72 bg-[#101018] shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
        <aside className="p-4 flex flex-col h-full">
            {!isLoggedIn ? (
                <div className="flex flex-col space-y-4 mb-4">
                    <button onClick={onLoginClick} className="bg-white/10 text-white text-center py-2.5 rounded-lg font-medium hover-glow hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                      <LoginIcon className="w-5 h-5" />
                      {t('login')}
                    </button>
                    <button onClick={onLoginClick} className="bg-theme-gradient text-white text-center py-2.5 rounded-lg font-medium hover-glow transition-all">
                      {t('registerAndPlay')}
                    </button>
                </div>
            ) : (
                <div className="mb-4 p-4 bg-white/5 rounded-lg">
                    <p className="font-semibold text-white truncate">{currentUser?.username}</p>
                    <p className="text-sm text-gray-400 truncate">{currentUser?.email}</p>
                </div>
            )}
             <nav className="flex flex-col space-y-2 text-gray-300 flex-grow">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('games'); }} className="p-3 hover:bg-white/5 rounded-md transition-colors">{t('games')}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('download'); }} className="p-3 hover:bg-white/5 rounded-md transition-colors">{t('download')}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('guides'); }} className="p-3 hover:bg-white/5 rounded-md transition-colors">{t('guides')}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('about-service'); }} className="p-3 hover:bg-white/5 rounded-md transition-colors">{t('aboutService')}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('support'); }} className="p-3 hover:bg-white/5 rounded-md transition-colors">{t('support')}</a>
             </nav>
             {isLoggedIn && (
               <div className="mt-auto">
                   <button
                       onClick={onLogout}
                       className="w-full bg-red-500/10 text-red-400 text-center py-2.5 rounded-lg font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                   >
                     <LogoutIcon className="w-5 h-5" />
                     {t('logout')}
                   </button>
               </div>
             )}
        </aside>
    </div>
  );
};

export default Sidebar;
