import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from './icons';
import Logo from './Logo';

const FooterNavSection = ({ title, links }: { title: string; links: { to: string; text: string }[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="w-full">
            <h3 className="text-white font-bold text-base mb-4 border-b border-white/10 pb-3 lg:border-none lg:pb-0">
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left hover:text-gray-300 transition-colors lg:cursor-default lg:hover:text-white lg:pointer-events-none">
                    <span>{title}</span>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} lg:hidden`} />
                </button>
            </h3>
            <nav className={`flex-col space-y-2 ${isOpen ? 'flex' : 'hidden'} lg:flex`}>
                {links.map(link => (
                    <Link key={link.text} to={link.to} className="text-gray-400 text-sm hover:text-white transition-opacity">{link.text}</Link>
                ))}
            </nav>
        </div>
    );
};

interface FooterProps {
    t: (key: string) => string;
}

const Footer: React.FC<FooterProps> = ({ t }) => {
    const usefulLinks = [
        { to: "/faq", text: t('faq') },
        { to: "/system-requirements", text: t('sysReq') },
        { to: "/support", text: t('support') },
        { to: "/recommended-devices", text: t('recDev') },
    ];
    const aboutLinks = [
        { to: "/about-service", text: t('aboutService') },
        { to: "/games", text: t('availableGames') },
        { to: "/contacts", text: t('contacts') },
    ];
    const xonLinks = [
        { to: "/download", text: t('dlWindows') },
        { to: "/download", text: t('dlMac') },
        { to: "/download", text: t('dlAndroid') },
    ];
    const legalLinks = [
        { to: "/agreement", text: t('agreement') },
        { to: "/privacy", text: t('privacy') },
        { to: "/credentials", text: t('credentials') },
    ];

    return (
        <footer className="bg-black border-t border-white/10 py-10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col">
                    <div className="flex-shrink-0 mb-8">
                         <Link to="/"><Logo className="text-3xl" /></Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                        <div className="w-full"><FooterNavSection title={t('usefulInfo')} links={usefulLinks} /></div>
                        <div className="w-full"><FooterNavSection title={t('about')} links={aboutLinks} /></div>
                        <div className="w-full"><FooterNavSection title={'X.O.N'} links={xonLinks} /></div>
                        <div className="w-full"><FooterNavSection title={t('legal')} links={legalLinks} /></div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
