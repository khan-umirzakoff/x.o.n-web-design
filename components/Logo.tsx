import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = 'text-3xl' }) => {
    return (
        <div className={`font-orbitron font-bold tracking-wider ${className}`}>
            <span>CLOUD</span>
            <span className="text-theme-gradient">PLAY</span>
        </div>
    );
};

export default Logo;
