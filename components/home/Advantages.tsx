import React from 'react';

const AdvantageCard = ({ title, description, actions, image, imageSide = 'right' }: { title: React.ReactNode, description: string, actions: React.ReactNode, image: React.ReactNode, imageSide?: 'left' | 'right' }) => (
    <div className={`flex flex-col md:flex-row items-center gap-8 lg:gap-12 md:gap-14 ${imageSide === 'left' ? 'md:flex-row-reverse' : ''}`}>
        <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl text-gray-100 font-orbitron font-bold leading-tight mb-6 sm:text-3xl">{title}</h2>
            <p className="text-gray-300 text-lg mb-14 max-w-lg mx-auto md:mx-0 md:mb-10 sm:mb-8">{description}</p>
            <div className="flex gap-8 justify-center md:justify-start sm:flex-col sm:items-center sm:gap-4">
                {actions}
            </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
            <div className="max-w-sm md:max-w-full w-full">
                {image}
            </div>
        </div>
    </div>
);

import { Link } from 'react-router-dom';

interface AdvantagesProps {
    t: (key: string) => string;
}

const Advantages: React.FC<AdvantagesProps> = ({ t }) => {

    const deviceIcons = [
      { src: '/assets/images/icons/os/windows.svg', name: 'Windows' },
      { src: '/assets/images/icons/os/apple.svg', name: 'iOS' },
      { src: '/assets/images/icons/os/chrome.svg', name: 'Chrome' },
      { src: '/assets/images/icons/os/macos.svg', name: 'macOS' },
      { src: '/assets/images/icons/os/android.svg', name: 'Android' },
      { src: '/assets/images/icons/os/linux.svg', name: 'Linux' }
    ];

    return (
        <div className="py-32 lg:py-24 md:py-20 sm:py-14 bg-[#0A0A10]">
            <div className="container mx-auto px-4 space-y-28 md:space-y-20 sm:space-y-14">
                <AdvantageCard
                    title={t('adv1Title')}
                    description={t('adv1Desc')}
                    actions={
                        <Link to="/system-requirements" className="bg-white/90 text-black text-lg font-semibold rounded-lg px-8 py-4 hover:bg-white transition-colors transform hover:scale-105 sm:w-full sm:max-w-xs">
                            {t('adv1Btn')}
                        </Link>
                    }
                    image={
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
                            {deviceIcons.map(({ src, name }) => (
                                <div key={name} className="glass rounded-lg p-6 shadow-lg flex justify-center items-center aspect-square transition-all duration-300 hover:border-white/20 hover:scale-105">
                                    <img src={src} alt={name} className="h-16 w-16 fade-in-on-load" />
                                </div>
                            ))}
                        </div>
                    }
                />

                <AdvantageCard
                    title={t('adv2Title')}
                    description={t('adv2Desc')}
                    actions={
                        <Link to="/download" className="bg-theme-gradient text-white text-lg font-semibold rounded-lg px-8 py-4 hover-glow transition-all transform hover:scale-105 sm:w-full sm:max-w-xs">
                            {t('adv2Btn2')}
                        </Link>
                    }
                    image={
                         <img src="/assets/images/misc/devices-xxl-xl.jpg" alt="Multiple devices" className="w-full h-auto rounded-lg shadow-2xl shadow-blue-500/10 fade-in-on-load" />
                    }
                    imageSide="left"
                />

                 <AdvantageCard
                    title={<>{t('adv3Title').split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}</>}
                    description={t('adv3Desc')}
                    actions={<></>}
                    image={
                        <div className="relative">
                            <img src="/assets/images/misc/hexogon-xxl-xl.png" alt="Hexagon background" className="w-full opacity-30 fade-in-on-load" />
                            <div className="absolute inset-0 flex items-center justify-center -translate-y-4">
                                <div className="relative w-[85%]">
                                     <img src="/assets/images/misc/laptop-xxl-xl.png" alt="Laptop" className="w-full fade-in-on-load" />
                                     <div className="absolute top-[2.1%] left-[16.8%] w-[67%] h-[79%] overflow-hidden rounded-t-md">
                                        <video className="absolute w-full h-full object-cover" autoPlay muted loop playsInline>
                                            <source src="/assets/videos/genshin-screen.webm" type="video/webm" />
                                            <source src="/assets/videos/genshin-screen.mp4" type="video/mp4" />
                                        </video>
                                     </div>
                                </div>
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default Advantages;