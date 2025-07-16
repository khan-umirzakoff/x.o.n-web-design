
import React from 'react';

const GenreCard: React.FC<{ genre: { title: string; icon: string; slug: string; }, onClick: () => void; }> = ({ genre, onClick }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="genresSliderItem flex flex-col items-center justify-center p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors text-center">
        <img className="genresSliderItem__icon w-20 h-20 mb-2 fade-in-on-load" src={genre.icon} alt={genre.title} />
        <div className="genresSliderItem__title text-white font-medium">{genre.title}</div>
    </a>
);

export default GenreCard;
