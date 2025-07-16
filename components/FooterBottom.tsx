
import React from 'react';

const twitchIconDataUri = 'data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmaWxsPSIjOUNBM0FGIj48dGl0bGU+VHdpdGNoPC90aXRsZT48cGF0aCBkPSJNMTEuNTcxIDQuNzE0aDEuNzE1djUuMTQzSDExLjU3em00LjcxNCAwaDEuNzE1djUuMTQzaC0xLjcxNXpNNiAwTDIuNzE0IDQuMjg2djE1LjQyOGg1LjE0M1YyNGw0LjI4Ni00LjI4NmgzLjQyOEwyMi4yODYgMTJWMEg2em0xNC41NzEgMTEuMTQzbC0zLjQyOCAzLjQyOGgtMy40MjlsLTMgM3YtM0g4LjU3MVYxLjcxNGgxMnY5LjQyOXoiLz48L3N2Zz4=';

const socialIcons = [
    { name: 'vk', href: 'https://r.gfn.am/vk', src: 'https://gfn.am/img/icons/footer/vk.svg' },
    { name: 'instagram', href: 'https://www.instagram.com/adept.tech?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', src: 'https://gfn.am/img/icons/footer/instagram.svg' },
    { name: 'telegram', href: 'https://t.me/adept_tech', src: 'https://gfn.am/img/icons/footer/telegram.svg' },
    { name: 'tiktok', href: 'https://r.gfn.am/tiktok', src: 'https://gfn.am/img/icons/footer/tiktok.svg' },
    { name: 'youtube', href: 'https://www.youtube.com/@UZGAMER', src: 'https://gfn.am/img/icons/footer/youtube.svg' },
    { name: 'discord', href: 'https://discord.gg/jZsQWJP', src: 'https://gfn.am/img/icons/footer/discord.svg' },
    { name: 'facebook', href: 'https://r.gfn.am/facebook', src: 'https://gfn.am/img/icons/footer/facebook.svg' },
    { name: 'twitch', href: 'https://twitch.tv/uzgamer_twitch', src: twitchIconDataUri },
];

interface FooterBottomProps {
    t: (key: string) => string;
    navigate: (page: string) => void;
}

const FooterBottom: React.FC<FooterBottomProps> = ({ t, navigate }) => {
    return (
        <div className="bg-black border-t border-white/10 py-6">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between flex-col md:flex-row gap-6">
                    <div className="text-gray-500 text-sm order-3 md:order-1 text-center md:text-left">
                        <p>
                            <span>{t('serviceProvidedBy')} </span>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); navigate('about-service'); }}
                                className="text-gray-300 hover:text-white transition-colors underline"
                            >
                                CLOUD PLAY Services
                            </a>
                            . © 2025
                        </p>
                        <p className="mt-1">
                            {t('developedBy')}{' '}
                            <a href="https://t.me/Khan_Umirzakoff" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors underline">
                                Khan Umirzakoff (Abdulbosit Umirzoqov)
                            </a>
                        </p>
                    </div>

                    <nav className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-center order-1 md:order-2">
                       {socialIcons.map(icon => (
                           <a key={icon.name} href={icon.href} target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 ease-in-out hover:scale-125">
                               <img src={icon.src} width="24" height="24" alt={icon.name} className="w-6 h-6 fade-in-on-load" loading="lazy" />
                           </a>
                       ))}
                    </nav>

                    <div className="order-2 md:order-3">
                      <a href="https://play.google.com/store/apps/details?id=com.limelight" target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                          <img src="https://gfn.am/img/icons/google-play.svg" width="135" height="40" alt="Get it on Google Play" className="fade-in-on-load" loading="lazy" />
                      </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FooterBottom;