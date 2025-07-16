import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigateOptions } from '../../types';
import { api } from '../../services/api';
import { translations } from '../../translations';

const sliderGameData = [
  {
    gameTitle: 'S.T.A.L.K.E.R. 2: Heart of Chornobyl',
    key: 'stalker',
    image: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-stalker-xxl-xl.jpg',
    mobileImage: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-stalker-xs.jpg'
  },
  {
    gameTitle: 'Forza Horizon 5',
    key: 'forza',
    image: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-forza-xxl-xl.jpg',
    mobileImage: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-forza-xs.jpg'
  },
  {
    gameTitle: 'Warhammer 40,000: Space Marine 2',
    key: 'warhammer',
    image: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-space-marine-xxl-xl.jpg',
    mobileImage: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-space-marine-xs.jpg'
  },
  {
    gameTitle: 'World of Warcraft',
    key: 'wow',
    image: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-wow-xxl-xl.jpg',
    mobileImage: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-wow-xs.jpg'
  },
  {
    gameTitle: "Baldur's Gate 3",
    key: 'baldursgate',
    image: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-baldursgate-xxl-xl.jpg',
    mobileImage: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/dashboard-banner-baldursgate-xs.jpg'
  },
  {
    gameTitle: 'Counter-Strike 2',
    key: 'cs2',
    image: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/banner-cs2-xxl-xl.jpg',
    mobileImage: 'https://gfn.am/games/wp-content/themes/gfngames/img/home/slider/banner-cs2-xs.jpg'
  }
];

interface GamesSliderProps {
    navigate: (page: string, options?: NavigateOptions) => void;
    t: (key: string) => string;
}

const GamesSlider: React.FC<GamesSliderProps> = ({ navigate, t }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const sliderSlides = useMemo(() => sliderGameData.map(slide => ({
        ...slide,
        label: t(String('slider_' + slide.key + '_label') as keyof typeof translations.ENG),
        title: t(String('slider_' + slide.key + '_title') as keyof typeof translations.ENG),
        text: t(String('slider_' + slide.key + '_text') as keyof typeof translations.ENG),
    })), [t]);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev + 1) % sliderSlides.length);
    }, [sliderSlides.length]);

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + sliderSlides.length) % sliderSlides.length);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);
    
    const handlePlayClick = async (e: React.MouseEvent<HTMLAnchorElement>, slide: typeof sliderSlides[0]) => {
      e.preventDefault();
      const game = await api.getGameByTitle(slide.gameTitle);
      if (game) {
        navigate('game-details', { game });
      } else {
        console.warn(`Game "${slide.gameTitle}" not found for slider.`);
        navigate('all-games', { search: slide.gameTitle });
      }
    };

    return (
        <section className="catalogSlider relative w-full overflow-hidden">
            <div className="relative h-96 md:h-[504px] lg:h-[432px]">
                {sliderSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'}`}
                    >
                        <picture>
                            <source media="(max-width: 575.98px)" srcSet={slide.mobileImage} />
                            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover fade-in-on-load" />
                        </picture>
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute inset-0 p-4 sm:p-8 flex items-end">
                            <div className="catalogSliderItem__overlay glass p-4 sm:p-6 rounded-lg max-w-lg">
                                <div className="catalogSliderItem__content text-white">
                                    {slide.label && <span className="catalogSliderItem__label text-xs sm:text-sm font-bold bg-green-500/80 px-2 py-1 rounded-md mb-2 inline-block">{slide.label}</span>}
                                    <h3 className="catalogSliderItem__title text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{slide.title}</h3>
                                    <p className="catalogSliderItem__text text-gray-200 text-sm sm:text-base mb-4 hidden sm:block">{slide.text}</p>
                                    <a href="#" onClick={(e) => handlePlayClick(e, slide)} className="catalogSliderItem__action btn bg-white text-black font-bold py-2 px-6 rounded-md hover:bg-gray-200 transition-colors text-sm sm:text-base">
                                        {t('play')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <button onClick={prevSlide} className="absolute top-1/2 left-4 -translate-y-1/2 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button onClick={nextSlide} className="absolute top-1/2 right-4 -translate-y-1/2 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {sliderSlides.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}></button>
                ))}
            </div>
        </section>
    );
};

export default GamesSlider;
