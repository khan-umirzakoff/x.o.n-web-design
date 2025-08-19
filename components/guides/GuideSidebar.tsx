
import React, { useState, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

interface SidebarSectionProps {
  title: string;
  links: { path: string; text: string; platform?: string }[];
  defaultOpen?: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, links, defaultOpen = false }) => {
    const location = useLocation();
    const { platform: currentPlatform } = useParams<{ platform: string }>();
    const isSectionActive = useMemo(() => links.some(l => location.pathname.startsWith(l.path)), [links, location.pathname]);
    const [isOpen, setIsOpen] = useState(defaultOpen || isSectionActive);

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
                    {links.map(link => {
                        const isActive = location.pathname === link.path && (!link.platform || currentPlatform === link.platform);
                        return (
                            <li key={link.path + link.text}>
                                <Link
                                    to={link.path}
                                    className={`block py-1.5 px-3 rounded hover:bg-[#333] transition-colors ${isActive ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}
                                >
                                    {link.text}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
};

interface GuideSidebarProps {
    t: (key: string) => string;
}

const GuideSidebar: React.FC<GuideSidebarProps> = ({ t }) => {
    const location = useLocation();
    const [isListOpen, setIsListOpen] = useState(true);

    const mainLinks = [
        { path: '/how-to-start', text: t('guide1Title') },
        { path: '/guides', text: t('guide2Title') },
    ];

    const systemRequirementsLinks = useMemo(() => [
        { path: '/system-requirements/windows', text: t('sysReqWindows'), platform: 'windows' },
        { path: '/system-requirements/macos', text: t('sysReqMacOS'), platform: 'macos' },
        { path: '/system-requirements/android', text: t('sysReqAndroid'), platform: 'android' },
        { path: '/system-requirements/ios', text: t('sysReqIOS'), platform: 'ios' },
        { path: '/system-requirements/linux', text: t('sysReqLinux'), platform: 'linux' },
        { path: '/system-requirements/chrome', text: t('sysReqChrome'), platform: 'chrome' },
        { path: '/system-requirements/tv', text: t('sysReqTV'), platform: 'tv' },
    ], [t]);

    const nvidiaTechLinks = [
        { path: '/nvidia-tech', text: 'RTX' },
        { path: '/nvidia-tech', text: 'DLSS 2.0' },
        { path: '/nvidia-tech', text: t('nvidiaServerTitle') },
    ];

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
                                    <li key={link.path} className="guideSidebar__item">
                                        <Link to={link.path}
                                           className={`block py-2 px-3 rounded hover:bg-[#333] hover:text-white transition-colors ${location.pathname === link.path ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}>
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                                <SidebarSection 
                                    title={t('guide4Title')} 
                                    links={systemRequirementsLinks} 
                                    defaultOpen={location.pathname.startsWith('/system-requirements')}
                                />
                                <SidebarSection 
                                    title={t('guide3Title')} 
                                    links={nvidiaTechLinks} 
                                    defaultOpen={location.pathname.startsWith('/nvidia-tech')}
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
