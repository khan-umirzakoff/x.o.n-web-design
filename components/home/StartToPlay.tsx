
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '../icons';

interface StartToPlayProps {
    t: (key: string) => string;
}

const StartToPlay: React.FC<StartToPlayProps> = ({ t }) => {
    return (
        <div className="bg-theme-gradient">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between sm:flex-col">
                     <Link to="/how-to-start" className="text-white flex items-center gap-2 text-xl font-medium py-5 pr-6 sm:justify-center sm:w-full sm:py-5 sm:pr-0 group">
                        {t('howToStartPlaying')}
                        <ChevronRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <p className="border-l border-white/30 text-lg text-white/80 pl-6 py-1 sm:hidden">
                        {t('ultraGamingExperience')}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default StartToPlay;
