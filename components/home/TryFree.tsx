
import React from 'react';
import { Link } from 'react-router-dom';

interface CtaProps {
    t: (key: string) => string;
}

const CtaSection: React.FC<CtaProps> = ({ t }) => {
    return (
        <div 
            className="relative bg-black min-h-[424px] py-24 md:py-24 flex items-center justify-center text-center" 
            style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2070&auto=format&fit=crop')", 
                backgroundPosition: 'center', 
                backgroundSize: 'cover', 
                backgroundRepeat: 'no-repeat' 
            }}
        >
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-4xl sm:text-3xl font-orbitron font-bold mb-6 md:mb-8">{t('ctaTitle')}</h2>
                <p className="text-gray-300 mb-10 md:mb-8 max-w-xl mx-auto">
                    {t('ctaDesc')}
                </p>
                <Link
                    to="/games"
                    className="bg-theme-gradient text-white text-lg font-bold rounded-lg px-8 py-4 hover-glow transition-all transform hover:scale-105"
                >
                    {t('ctaBtn')}
                </Link>
            </div>
        </div>
    );
};

export default CtaSection;
