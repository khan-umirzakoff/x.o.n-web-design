
import React from 'react';
import { Link } from 'react-router-dom';
import ThreeScene from './ThreeScene';
import ErrorBoundary from '../debug/ErrorBoundary';
import PerformanceMonitor from '../debug/PerformanceMonitor';

interface HeroProps {
    t: (key: string) => string;
}

const Hero: React.FC<HeroProps> = ({ t }) => {
    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
        <div className="relative min-h-screen flex items-center justify-center text-center -mt-[72px] pt-[72px] overflow-hidden">
            <ErrorBoundary
                onError={(error, errorInfo) => {
                    console.error('Hero component error:', error, errorInfo);
                }}
            >
                <ThreeScene 
                    className="absolute inset-0 w-full h-full" 
                    debugMode={isDevelopment} 
                />
            </ErrorBoundary>
            
            {/* Performance Monitor - only in development */}
            {isDevelopment && <PerformanceMonitor enabled={true} />}
            
            <div className="container mx-auto px-4 relative z-10 mt-60">
                <h1 className="font-orbitron text-3xl md:text-5xl font-bold uppercase tracking-normal flex flex-col items-center">
                    <span className="text-white" style={{ letterSpacing: '0.25em', paddingLeft: '0.25em' }}>X.O.N</span>
                    <span className="text-theme-gradient text-lg md:text-2xl mt-1 tracking-wider">Cloud Gaming</span>
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
