import React, { useMemo } from 'react';

// Static image URLs for decorative purposes. These load instantly without API calls.
const wallImages = [
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/genshin_impact_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/fortnite_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/counter_strike_4_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/dota_2_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/zenless_zone_zero_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/honkai:_star_rail_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/wuthering_waves_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/rust_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/war_thunder_s_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/path_of_exile_01_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/dead_by_daylight_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/cyberpunk_2077_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/marvel_rivals_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/s.t.a.l.k.e.r._2:_heart_of_chornobyl_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/dayz_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/baldurs_gate_3_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/alan_wake_2_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/the_witcher_3_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/apex_legends_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/league_of_legends_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/world_of_warcraft_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/overwatch_2_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/destiny_2_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/rocket_league_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/minecraft_dungeons_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/phasmophobia_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/valheim_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/among_us_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/stardew_valley_art.jpg',
  'https://storage.googleapis.com/gfn-am-games-catalogue-assets/forza_horizon_5_art.jpg',
];

interface WallProps {
    navigate: (page: string) => void;
    t: (key: string) => string;
}

const Wall: React.FC<WallProps> = ({ navigate, t }) => {
    // Shuffle images once on component mount for variety, but keep it stable on re-renders.
    const { row1, row2, row3 } = useMemo(() => {
        const shuffled = [...wallImages].sort(() => 0.5 - Math.random());
        return {
            row1: shuffled.slice(0, 10),
            row2: shuffled.slice(10, 20),
            row3: shuffled.slice(20, 30),
        }
    }, []);

    const handleWallClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigate('games');
    };

    const renderRow = (images: string[], animationClass: string) => (
        <div className="flex">
            <div className={`scrolling-wrapper ${animationClass}`}>
                {[...images, ...images].map((imageUrl, i) => (
                    <div key={`${imageUrl}-${i}`} className="w-48 h-48 shrink-0 mx-2">
                        <img src={imageUrl} alt="" className="rounded-lg w-full h-full object-cover fade-in-on-load" loading="lazy" />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="py-24 md:py-20 sm:py-16 bg-[#0A0A10] text-center">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl sm:text-3xl font-orbitron font-bold mb-4">{t('wallTitle')}</h2>
                <p className="text-lg text-gray-400 mb-14 md:mb-10 sm:mb-8">
                    {t('wallDesc')}
                </p>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('games'); }} className="bg-theme-gradient text-white text-lg font-bold rounded-lg px-8 py-4 hover-glow transition-all">
                    {t('wallBtn')}
                </a>
            </div>

             <a href="#" onClick={handleWallClick} className="block cursor-pointer group relative mt-14">
                <div className="space-y-4 overflow-hidden -mx-4">
                    {renderRow(row1, 'animate-marquee-right')}
                    {renderRow(row2, 'animate-marquee-left')}
                    {renderRow(row3, 'animate-marquee-right')}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xl font-bold glass px-6 py-3 rounded-lg">{t('viewAllGames')}</span>
                </div>
            </a>
        </div>
    );
};

export default Wall;