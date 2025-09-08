
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
    const [letterSpacing, setLetterSpacing] = useState(0);

    useLayoutEffect(() => {
        const calculateSpacing = async () => {
            // Wait for fonts to be loaded and ready
            await document.fonts.ready;

            if (xonRef.current && subtitleRef.current) {
                const xonWidth = xonRef.current.offsetWidth;
                const subtitleWidth = subtitleRef.current.offsetWidth;
                const subtitleText = subtitleRef.current.innerText;

                if (subtitleWidth > 0 && subtitleText.length > 1) {
                    // Temporarily reset letter spacing to get the natural width
                    subtitleRef.current.style.letterSpacing = 'normal';
                    const naturalSubtitleWidth = subtitleRef.current.offsetWidth;

                    const widthDiff = xonWidth - naturalSubtitleWidth;
                    const newSpacing = widthDiff / (subtitleText.length - 1);
                    setLetterSpacing(newSpacing);
                }
            }
        };

        calculateSpacing();
        window.addEventListener('resize', calculateSpacing);

        return () => window.removeEventListener('resize', calculateSpacing);
    }, [t]);

    return (
        <>
            <style>{`
                .font-audiowide { font-family: 'Audiowide', cursive; }
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

                <div className="container mx-auto px-4 relative z-10 pt-64 md:pt-72">
                    <h1 className="uppercase tracking-normal flex flex-col items-center">
                        <span ref={xonRef} className="text-white text-4xl md:text-6xl font-audiowide" style={{ letterSpacing: '0.25em', paddingLeft: '0.25em' }}>X.O.N</span>
                        <span
                            ref={subtitleRef}
                            className="text-theme-gradient text-lg md:text-2xl mt-1 font-orbitron font-light"
                            style={{ letterSpacing: `${letterSpacing}px` }}
                        >
                            Cloud Gaming
                        </span>
                        <span className="text-white text-sm md:text-base mt-4 font-light tracking-widest">
                            Xpress Online Now
                        </span>
                    </h1>
                    <div className="mt-8 flex justify-center">
                     <Link to="/games" className="bg-theme-gradient text-white font-bold text-lg rounded-lg px-10 py-4 hover-glow transition-all transform hover:scale-105">
                            {t('registerAndPlay')}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;
