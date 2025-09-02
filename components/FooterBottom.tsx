
import React from 'react';
import { Link } from 'react-router-dom';

const socialIcons = [
    { name: 'vk', src: '/assets/images/icons/social/vk.svg' },
    { name: 'instagram', src: '/assets/images/icons/social/instagram.svg' },
    { name: 'telegram', src: '/assets/images/icons/social/telegram.svg' },
    { name: 'tiktok', src: '/assets/images/icons/social/tiktok.svg' },
    { name: 'youtube', src: '/assets/images/icons/social/youtube.svg' },
    { name: 'discord', src: '/assets/images/icons/social/discord.svg' },
    { name: 'facebook', src: '/assets/images/icons/social/facebook.svg' },
    { name: 'twitch', src: '/assets/images/icons/social/twitch.svg' },
];

interface FooterBottomProps {
    t: (key: string) => string;
}

const FooterBottom: React.FC<FooterBottomProps> = ({ t }) => {
    return (
        <div className="bg-black border-t border-white/10 py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-y-6 md:gap-x-4">
                    <div className="text-gray-500 text-sm text-center md:text-left">
                        <p>
                            <span>{t('serviceProvidedBy')} </span>
                            <Link
                                to="/about-service"
                                className="text-gray-300 hover:text-white transition-colors underline"
                            >
                                X.O.N Cloud Gaming Services
                            </Link>
                            . © 2025
                        </p>
                        <p className="mt-1">
                            {t('developedBy')}{' '}
                            <a href="https://t.me/Khan_Umirzakoff" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors underline">
                                Khan Umirzakoff (Abdulbosit Umirzoqov)
                            </a>
                        </p>
                    </div>

                    <div className="flex items-center justify-center md:justify-end flex-wrap gap-x-6 gap-y-4">
                        {socialIcons.map(icon => (
                            <a key={icon.name} {...(icon.href ? { href: icon.href } : {})} target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 ease-in-out hover:scale-125">
                                <img src={icon.src} width="24" height="24" alt={icon.name} className="w-6 h-6 fade-in-on-load" loading="lazy" />
                            </a>
                        ))}
                        <a href="https://play.google.com/store/apps/details?id=com.limelight" target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                            <img src="/assets/images/logos/misc/google-play.svg" width="135" height="40" alt="Get it on Google Play" className="fade-in-on-load" loading="lazy" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FooterBottom;