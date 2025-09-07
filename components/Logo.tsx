import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 L0 100 L50 50 Z" fill="#FFFFFF" />
                <path d="M50 50 L100 0 L100 100 Z" fill="#FFFFFF" />
            </svg>
            <div className="flex flex-col items-start">
                <div className="text-lg tracking-wider font-audiowide">X.O.N</div>
                <div className="text-xs text-theme-gradient tracking-widest font-orbitron font-light translate-y-[-1px]">Cloud Gaming</div>
            </div>
        </div>
    );
};

export default Logo;