import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

// Static image URLs for decorative purposes. These load instantly without API calls.
const wallImages = [
  '/assets/images/wall/among_us_art.jpg',
  '/assets/images/wall/apex_legends_art.jpg',
  '/assets/images/wall/assassins_creed_04_art.jpg',
  '/assets/images/wall/assetto_corsa_art.jpg',
  '/assets/images/wall/black_myth__wukong_art.jpg',
  '/assets/images/wall/blood_strike_art.jpg',
  '/assets/images/wall/bodycam_art.jpg',
  '/assets/images/wall/bright_memory__infinite_art.jpg',
  '/assets/images/wall/counter_strike_3_art.jpg',
  '/assets/images/wall/counter_strike_4_art.jpg',
  '/assets/images/wall/crysis_1_remastered_art.jpg',
  '/assets/images/wall/cyberpunk_2077_art.jpg',
  '/assets/images/wall/dayz_art.jpg',
  '/assets/images/wall/dead_by_daylight_art.jpg',
  '/assets/images/wall/destiny_2_art.jpg',
  '/assets/images/wall/dota_2_art.jpg',
  '/assets/images/wall/fortnite_art.jpg',
  '/assets/images/wall/forza_horizon_5_art.jpg',
  '/assets/images/wall/genshin_impact_art.jpg',
  '/assets/images/wall/marvel_rivals_art.jpg',
  '/assets/images/wall/minecraft_dungeons_art.jpg',
  '/assets/images/wall/overwatch_2_art.jpg',
  '/assets/images/wall/path_of_exile_01_art.jpg',
  '/assets/images/wall/phasmophobia_art.jpg',
  '/assets/images/wall/rocket_league_art.jpg',
  '/assets/images/wall/rust_art.jpg',
  '/assets/images/wall/stardew_valley_art.jpg',
  "/assets/images/wall/tom_clancy's_ghost_recon_future_soldier_art.jpg",
  '/assets/images/wall/valheim_art.jpg',
  '/assets/images/wall/war_thunder_s_art.jpg',
  '/assets/images/wall/wuthering_waves_art.jpg',
  '/assets/images/wall/zenless_zone_zero_art.jpg',
];

interface WallProps {
    t: (key: string) => string;
}

const Wall: React.FC<WallProps> = ({ t }) => {
    // Shuffle images once on component mount for variety, but keep it stable on re-renders.
    const { row1, row2, row3 } = useMemo(() => {
        const shuffled = [...wallImages].sort(() => 0.5 - Math.random());
        return {
            row1: shuffled.slice(0, 11),
            row2: shuffled.slice(11, 22),
            row3: shuffled.slice(22, 32),
        }
    }, []);

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
        <div className="py-24 md:py-20 sm:py-16 bg-[#0A0A10] text-center overflow-hidden">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl sm:text-3xl font-orbitron font-bold mb-4">{t('wallTitle')}</h2>
                <p className="text-lg text-gray-400 mb-14 md:mb-10 sm:mb-8">
                    {t('wallDesc')}
                </p>
            </div>

             <Link to="/games" className="block cursor-pointer group relative mt-14">
                <div className="space-y-4 overflow-hidden">
                    {renderRow(row1, 'animate-marquee-right')}
                    {renderRow(row2, 'animate-marquee-left')}
                    {renderRow(row3, 'animate-marquee-right')}
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                </div>
            </Link>
        </div>
    );
};

export default Wall;