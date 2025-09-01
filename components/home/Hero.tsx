
import React from 'react';
import { Link } from 'react-router-dom';
import ThreeScene from './ThreeScene';

interface HeroProps {
    t: (key: string) => string;
}

const Hero: React.FC<HeroProps> = ({ t }) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center text-center -mt-[72px] pt-[72px] overflow-hidden">
            <ThreeScene className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A10] via-[#0A0A10]/50 to-transparent"></div>
            <div className="absolute inset-0 bg-black/30"></div>
            
            <div className="container mx-auto px-4 relative z-10 mt-60">
                <h1 className="font-orbitron text-3xl md:text-5xl font-bold uppercase tracking-normal flex flex-col items-center">
                    <span className="text-white" style={{ letterSpacing: '0.25em', paddingLeft: '0.25em' }}>X.O.N</span>
                    <span className="text-theme-gradient text-lg md:text-2xl mt-1 tracking-wider">X.O.N Cloud Gaming</span>
                </h1>
                <div className="mt-8 flex justify-center">
                     <Link to="/games" className="bg-theme-gradient text-white font-bold text-lg rounded-lg px-10 py-4 hover-glow transition-all shadow-lg transform hover:scale-105">
                        {t('registerAndPlay')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;
