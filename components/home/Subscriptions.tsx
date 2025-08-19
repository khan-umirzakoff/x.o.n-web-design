

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon } from '../icons';
import { translations } from '../../i18n';
import { User } from '../../types';

interface SubscriptionsProps {
    t: (key: string) => string;
    onTopUpClick: () => void;
    currentUser: User | null;
    isLoggedIn: boolean;
    onLoginClick: () => void;
}

const tiers = [
  {
    name: 'standard',
    features: [
      'feat_1080p_60fps',
      'feat_standard_priority',
      'feat_play_any_game',
    ],
    hourlyRates: {
      day: 5000,
      evening: 6000,
      night: 4000,
    },
  },
  {
    name: 'premium',
    features: [
      'feat_4k_120fps',
      'feat_rtx_on',
      'feat_highest_priority',
      'feat_play_any_game',
    ],
    hourlyRates: {
      day: 8000,
      evening: 10000,
      night: 7000,
    },
  }
];

const Subscriptions: React.FC<SubscriptionsProps> = ({ t, onTopUpClick, currentUser, isLoggedIn, onLoginClick }) => {
    const navigate = useNavigate();
    const balance = currentUser?.balance ?? 0;

    const timeSlots = useMemo(() => ([
        { key: 'day', name: t('dayTime'), time: '06:00 - 18:00' },
        { key: 'evening', name: t('eveningTime'), time: '18:00 - 00:00' },
        { key: 'night', name: t('nightTime'), time: '00:00 - 06:00' },
    ]), [t]);
    
    const handlePlayClick = () => {
        if (!isLoggedIn) {
            onLoginClick();
            return;
        }
        if (currentUser && currentUser.balance > 0) {
            navigate('/games');
        } else {
            onTopUpClick();
        }
    };

    return (
        <section className="py-24 md:py-16 bg-[#0A0A10]">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl sm:text-3xl font-orbitron font-bold text-center mb-6 md:mb-8 sm:mb-6">
                    {t('choosePlan')}
                </h2>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 glass p-4 rounded-lg max-w-lg mx-auto mb-12">
                    <div className="text-center sm:text-left">
                        <p className="text-gray-400 text-sm">{t('yourBalance')}</p>
                        <p className="text-white text-2xl font-bold">{balance.toLocaleString('uz-UZ')} so&apos;m</p>
                    </div>
                    <button onClick={isLoggedIn ? onTopUpClick : onLoginClick} className="bg-theme-gradient text-white font-bold py-2 px-6 rounded-lg hover-glow transition-all w-full sm:w-auto sm:ml-auto">
                        {t('topUp')}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {tiers.map(tier => (
                         <div key={tier.name} className="glass rounded-2xl flex flex-col p-8 transition-all duration-300 hover:border-white/20 hover:scale-[1.02] hover-glow">
                            <h3 className={`font-orbitron text-3xl tracking-wider uppercase mb-4 ${tier.name === 'premium' ? 'text-theme-gradient' : 'text-blue-400'}`}>
                                {t(tier.name)}
                            </h3>
                            
                            <ul className="space-y-3 mb-8 text-gray-300">
                                {tier.features.map(featureKey => (
                                    <li key={featureKey} className="flex items-center gap-3">
                                        <CheckIcon className={`w-5 h-5 ${tier.name === 'premium' ? 'text-purple-400' : 'text-blue-400'}`} /> 
                                        {t(String(featureKey) as keyof typeof translations.ENG)}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto space-y-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-3">{t('hourlyRatesTitle')}</h4>
                                    <div className="space-y-2 text-sm">
                                        {timeSlots.map(slot => (
                                            <div key={slot.key} className="flex justify-between items-baseline p-2 bg-black/20 rounded-md">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{slot.name}</span>
                                                    <span className="text-gray-500 text-xs">{slot.time}</span>
                                                </div>
                                                <span className="font-semibold text-gray-200">
                                                    {tier.hourlyRates[slot.key as 'day' | 'evening' | 'night'].toLocaleString('uz-UZ')} so&apos;m/soat
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                               
                                <button onClick={handlePlayClick} className={`w-full text-center text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 hover-glow
                                    ${tier.name === 'premium' ? 'bg-theme-gradient' : 'bg-blue-600 hover:bg-blue-500'}`}>
                                    {t('startPlaying')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Subscriptions;