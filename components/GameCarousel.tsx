import React, { useState, useRef, useEffect, useCallback } from 'react';

const smoothScrollBy = (element: HTMLElement, distance: number, duration: number = 400) => {
    const start = element.scrollLeft;
    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = easeOutCubic(progress);
        element.scrollLeft = start + distance * easedProgress;
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    };
    requestAnimationFrame(animateScroll);
};

const PrevButton: React.FC<{ onClick: () => void; disabled: boolean }> = ({ onClick, disabled }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`absolute top-1/2 left-4 -translate-y-1/2 z-20 p-2 bg-black/60 rounded-full text-white hover:bg-black/90 transition-all duration-300 ${disabled ? 'opacity-0 scale-50 cursor-not-allowed' : 'opacity-100 scale-100'}`}
        aria-label="Previous slide"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    </button>
);

const NextButton: React.FC<{ onClick: () => void; disabled: boolean }> = ({ onClick, disabled }) => (
     <button 
        onClick={onClick}
        disabled={disabled}
        className={`absolute top-1/2 right-4 -translate-y-1/2 z-20 p-2 bg-black/60 rounded-full text-white hover:bg-black/90 transition-all duration-300 ${disabled ? 'opacity-0 scale-50 cursor-not-allowed' : 'opacity-100 scale-100'}`}
        aria-label="Next slide"
    >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

interface GameCarouselProps {
    children: React.ReactNode;
}

const GameCarousel: React.FC<GameCarouselProps> = ({ children }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);

    const checkScrollPosition = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            const scrollEndReached = Math.ceil(scrollLeft) >= scrollWidth - clientWidth;
            setIsAtStart(scrollLeft <= 0);
            setIsAtEnd(scrollEndReached);
        }
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const handleScroll = () => checkScrollPosition();
            container.addEventListener('scroll', handleScroll, { passive: true });
            const resizeObserver = new ResizeObserver(checkScrollPosition);
            resizeObserver.observe(container);
            checkScrollPosition(); // Initial check
            
            return () => {
                container.removeEventListener('scroll', handleScroll);
                resizeObserver.disconnect();
            };
        }
    }, [checkScrollPosition, children]);


    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8; // Scroll by 80% of visible width
            const distance = direction === 'left' ? -scrollAmount : scrollAmount;
            smoothScrollBy(container, distance, 400);
        }
    };
    
    return (
        <div className="relative">
            <div
                ref={scrollContainerRef}
                data-testid="scroll-container"
                className="flex space-x-4 pb-4 overflow-x-auto scroll-smooth no-scrollbar px-4"
            >
                {children}
            </div>
             <div className="hidden md:block">
                <PrevButton onClick={() => scroll('left')} disabled={isAtStart} />
                <NextButton onClick={() => scroll('right')} disabled={isAtEnd} />
            </div>
            <div className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent transition-opacity duration-300 ${!isAtStart ? 'opacity-100' : 'opacity-0'}`} />
            <div className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent transition-opacity duration-300 ${!isAtEnd ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
};

// Hide scrollbar utility style injected once
if (!document.querySelector('#no-scrollbar-style')) {
    const style = document.createElement('style');
    style.id = 'no-scrollbar-style';
    style.textContent = `
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `;
    document.head.appendChild(style);
}

export default GameCarousel;