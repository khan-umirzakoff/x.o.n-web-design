
import React from 'react';

interface LogoProps {
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Logo: React.FC<LogoProps> = ({ className = 'text-3xl', onClick }) => {
    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if(onClick) {
            e.preventDefault();
            onClick(e);
        }
    }
    
    return (
        <a href="/" onClick={handleLogoClick} className={`font-orbitron font-bold tracking-wider ${className}`}>
            <span>CLOUD</span>
            <span className="text-theme-gradient">PLAY</span>
        </a>
    );
};

export default Logo;
