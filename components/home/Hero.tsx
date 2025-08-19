
import React from 'react';
import { Link } from 'react-router-dom';

interface HeroProps {
    t: (key: string) => string;
}

const Hero: React.FC<HeroProps> = ({ t }) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center text-center -mt-[72px] pt-[72px] overflow-hidden">
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A10] via-[#0A0A10]/50 to-transparent"></div>
            <div className="absolute inset-0 bg-black/30"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <h1 className="font-orbitron text-5xl md:text-7xl font-bold uppercase mb-4 tracking-wider">
                    <span className="text-white">CLOUD</span><span className="text-theme-gradient">PLAY</span>
                </h1>
                <p className="text-lg md:text-2xl text-gray-300 tracking-widest uppercase">
                    {t('heroSubtitle')}
                </p>
                <div className="mt-12 flex justify-center">
                     <Link to="/games" className="bg-theme-gradient text-white font-bold text-lg rounded-lg px-10 py-4 hover-glow transition-all shadow-lg transform hover:scale-105">
                        {t('registerAndPlay')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
