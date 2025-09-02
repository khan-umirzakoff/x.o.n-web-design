
import React, { useRef, useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThreeScene from './ThreeScene';
import ErrorBoundary from '../debug/ErrorBoundary';
import PerformanceMonitor from '../debug/PerformanceMonitor';

interface HeroProps {
    t: (key: string) => string;
}

const Hero: React.FC<HeroProps> = ({ t }) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const xonRef = useRef<HTMLSpanElement>(null);
    const subtitleRef = useRef<HTMLSpanElement>(null);
    const [subtitleScale, setSubtitleScale] = useState(1);

    useLayoutEffect(() => {
        const calculateScale = () => {
            if (xonRef.current && subtitleRef.current) {
                const xonWidth = xonRef.current.offsetWidth;
                const subtitleWidth = subtitleRef.current.offsetWidth;
                if (subtitleWidth > 0) {
                    setSubtitleScale(xonWidth / subtitleWidth);
                }
            }
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);

        return () => window.removeEventListener('resize', calculateScale);
    }, [t]); // Recalculate when language changes

    return (
        <>
            <style>{`
                .font-audiowide { font-family: 'Audiowide', cursive; }
                .font-poppins { font-family: 'Poppins', sans-serif; }
            `}</style>
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

                <div className="container mx-auto px-4 relative z-10 mt-96">
                    <h1 className="uppercase tracking-normal flex flex-col items-center">
                        <span ref={xonRef} className="text-white text-4xl md:text-6xl font-audiowide" style={{ letterSpacing: '0.25em', paddingLeft: '0.25em' }}>X.O.N</span>
                        <span
                            ref={subtitleRef}
                            className="text-theme-gradient text-lg md:text-2xl mt-1 tracking-wider font-poppins font-light"
                            style={{
                                transform: `scaleX(${subtitleScale})`,
                                transformOrigin: 'center'
                            }}
                        >
                            Cloud Gaming
                        </span>
                    </h1>
                    <div className="mt-8 flex justify-center">
                         <Link to="/games" className="bg-theme-gradient text-white font-bold text-lg rounded-lg px-10 py-4 hover-glow transition-all shadow-lg transform hover:scale-105">
                            {t('registerAndPlay')}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;
