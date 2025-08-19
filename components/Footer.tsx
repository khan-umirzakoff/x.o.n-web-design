import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';
import Logo from './Logo';

const FooterNavSection = ({ title, links, onLinkClick }: { title: string; links: { href: string; text: string }[], onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>, text: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="w-full">
            <h3 className="text-white font-bold text-base mb-4 border-b border-white/10 pb-3 md:border-none md:pb-0">
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left hover:text-gray-300 transition-colors md:cursor-default md:hover:text-white md:pointer-events-none">
                    <span>{title}</span>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} md:hidden`} />
                </button>
            </h3>
            <nav className={`flex-col space-y-2 ${isOpen ? 'flex' : 'hidden'} md:flex`}>
                {links.map(link => (
                    <a key={link.text} href={link.href} onClick={(e) => onLinkClick && onLinkClick(e, link.text)} className="text-gray-400 text-sm hover:text-white transition-opacity">{link.text}</a>
                ))}
            </nav>
        </div>
    );
};

interface FooterProps {
    navigate: (page: string) => void;
    t: (key: string) => string;
}

const Footer: React.FC<FooterProps> = ({ navigate, t }) => {
    const usefulLinks = [
        { href: "#", text: t('faq') },
        { href: "#", text: t('sysReq') },
        { href: "#", text: t('support') },
        { href: "#", text: t('recDev') },
    ];
    const aboutLinks = [
        { href: "#", text: t('aboutService') },
        { href: "#", text: t('availableGames') },
        { href: "#", text: t('contacts') },
    ];
    const cloudPlayLinks = [
        { href: "#", text: t('dlWindows') },
        { href: "#", text: t('dlMac') },
        { href: "#", text: t('dlAndroid') },
    ];
    const legalLinks = [
        { href: "#", text: t('agreement') },
        { href: "#", text: t('privacy') },
        { href: "#", text: t('credentials') },
    ];

    const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, text: string) => {
        e.preventDefault();
        if (text === t('dlWindows') || text === t('dlMac') || text === t('dlAndroid')) {
            navigate('download');
        } else if (text === t('sysReq')) {
            navigate('system-requirements');
        } else if (text === t('availableGames')) {
            navigate('games');
        } else if (text === t('support')) {
            navigate('support');
        } else if (text === t('aboutService')) {
            navigate('about-service');
        }
    };

    return (
        <footer className="bg-black border-t border-white/10 py-10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col">
                    <div className="flex-shrink-0 mb-8">
                         <Logo onClick={() => navigate('home')} className="text-3xl" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        <div className="w-full"><FooterNavSection title={t('usefulInfo')} links={usefulLinks} onLinkClick={handleFooterLinkClick} /></div>
                        <div className="w-full"><FooterNavSection title={t('about')} links={aboutLinks} onLinkClick={handleFooterLinkClick} /></div>
                        <div className="w-full"><FooterNavSection title={'CLOUD PLAY'} links={cloudPlayLinks} onLinkClick={handleFooterLinkClick} /></div>
                        <div className="w-full"><FooterNavSection title={t('legal')} links={legalLinks} /></div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
