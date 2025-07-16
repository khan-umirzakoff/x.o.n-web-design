
import React, { useState, useMemo } from 'react';
import { NavigateOptions } from '../../types';

interface SidebarSectionProps {
  title: string;
  links: { page: string; text: string; platform?: string }[];
  navigate: (page: string, options?: NavigateOptions) => void;
  currentPage: string;
  currentPlatform: string;
  defaultOpen?: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, links, navigate, currentPage, currentPlatform, defaultOpen = false }) => {
    const isSectionActive = useMemo(() => links.some(l => l.page === currentPage), [links, currentPage]);
    const [isOpen, setIsOpen] = useState(defaultOpen || isSectionActive);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string, platform?: string) => {
        e.preventDefault();
        navigate(page, { platform });
    };

    return (
        <li className="guideSidebar__item guideSidebar__itemWithList">
            <button 
              className="guideSidebar__titleList font-medium text-white py-2 px-3 rounded flex items-center w-full text-left hover:bg-[#333]/50"
              onClick={() => setIsOpen(!isOpen)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className={`guideSidebar__itemIcon mr-2 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                    <path d="M5.5 12L5.5 4L10.5 8.19048L5.5 12Z" fill="#999999"></path>
                </svg>
                {title}
            </button>
            {isOpen && (
                <ul className="guideSidebar__childList pl-6 mt-1 space-y-1">
                    {links.map(link => (
                        <li key={link.page + link.text}>
                            <a 
                                href="#" 
                                onClick={(e) => handleLinkClick(e, link.page, link.platform)} 
                                className={`block py-1.5 px-3 rounded hover:bg-[#333] transition-colors ${currentPage === link.page && (!link.platform || currentPlatform === link.platform) ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}
                            >
                                {link.text}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};

interface GuideSidebarProps {
    navigate: (page: string, options?: NavigateOptions) => void;
    currentPage: string;
    platform: string;
    t: (key: string) => string;
}

const GuideSidebar: React.FC<GuideSidebarProps> = ({ navigate, currentPage, platform, t }) => {
    const [isListOpen, setIsListOpen] = useState(true);

    const mainLinks = [
        { page: 'how-to-start', text: t('guide1Title') },
        { page: 'guides', text: t('guide2Title') },
    ];

    const systemRequirementsLinks = useMemo(() => [
        { page: 'system-requirements', text: t('sysReqWindows'), platform: 'windows' },
        { page: 'system-requirements', text: t('sysReqMacOS'), platform: 'macos' },
        { page: 'system-requirements', text: t('sysReqAndroid'), platform: 'android' },
        { page: 'system-requirements', text: t('sysReqIOS'), platform: 'ios' },
        { page: 'system-requirements', text: t('sysReqLinux'), platform: 'linux' },
        { page: 'system-requirements', text: t('sysReqChrome'), platform: 'chrome' },
        { page: 'system-requirements', text: t('sysReqTV'), platform: 'tv' },
    ], [t]);

    const nvidiaTechLinks = [
        { page: 'nvidia-tech', text: 'RTX' },
        { page: 'nvidia-tech', text: 'DLSS 2.0' },
        { page: 'nvidia-tech', text: t('nvidiaServerTitle') },
    ];

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string) => {
        e.preventDefault();
        navigate(page);
    };

    return (
        <div className="guideSidebar w-full lg:max-w-xs">
            <div className="bg-[#222] rounded-lg p-2">
                <button
                    className="guideSidebar__title w-full text-left text-lg font-medium mb-2 flex justify-between items-center p-2 rounded hover:bg-[#333]/50"
                    onClick={() => setIsListOpen(!isListOpen)}
                >
                    <span className="text-white">{t('guides')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`guideSidebar__icon w-4 h-4 transition-transform text-gray-400 ${isListOpen ? '' : 'transform -rotate-90'}`} viewBox="0 0 16 16" fill="none">
                         <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
                {isListOpen && (
                    <div className="guideSidebar__body">
                        <nav className="guideSidebar__nav">
                            <ul className="guideSidebar__list space-y-1 text-sm text-gray-400">
                                {mainLinks.map(link => (
                                    <li key={link.page} className="guideSidebar__item">
                                        <a href="#" onClick={(e) => handleLinkClick(e, link.page)} 
                                           className={`block py-2 px-3 rounded hover:bg-[#333] hover:text-white transition-colors ${currentPage === link.page ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}>
                                            {link.text}
                                        </a>
                                    </li>
                                ))}
                                <SidebarSection 
                                    title={t('guide4Title')} 
                                    links={systemRequirementsLinks} 
                                    navigate={navigate} 
                                    currentPage={currentPage} 
                                    currentPlatform={platform}
                                    defaultOpen={systemRequirementsLinks.some(l => l.page === currentPage)} 
                                />
                                <SidebarSection 
                                    title={t('guide3Title')} 
                                    links={nvidiaTechLinks} 
                                    navigate={navigate} 
                                    currentPage={'nvidia-tech' === currentPage ? 'nvidia-tech' : currentPage} 
                                    currentPlatform={platform} 
                                    defaultOpen={'nvidia-tech' === currentPage}
                                />
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuideSidebar;
