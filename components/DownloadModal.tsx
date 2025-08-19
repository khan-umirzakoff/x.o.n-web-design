
import React from 'react';

interface DownloadModalProps {
  t: (key: string) => string;
}

const TechCard: React.FC<{ title: string; children: React.ReactNode; icon: string; }> = ({ title, children, icon }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-lg flex items-start gap-6">
        <img src={icon} alt="" className="w-12 h-12 flex-shrink-0 mt-1"/>
        <div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{children}</p>
        </div>
    </div>
);

const DownloadModal: React.FC<DownloadModalProps> = ({ t }) => {
  return (
    <div className="bg-[#111] py-16 sm:py-10 text-gray-300 min-h-[calc(100vh-128px)]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-orbitron font-bold text-white mb-4 border-b border-gray-700 pb-4">{t('nvidiaTechPageTitle')}</h1>
          <p className="text-lg text-gray-400 mb-12">{t('nvidiaTechIntro')}</p>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">{t('nvidiaServerTitle')}</h2>
              <p className="text-lg leading-relaxed">{t('nvidiaServerDesc')}</p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-6 mt-12">{t('nvidiaTechTitle')}</h2>
              <div className="space-y-6">
                <TechCard 
                  title={t('nvidiaRTXTitle')}
                  icon="https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/ada/rtx-io/geforce-rtx-40-series-rtx-on-logo.png"
                >
                  {t('nvidiaRTXDesc')}
                </TechCard>
                <TechCard 
                  title={t('nvidiaDLSSTitle')}
                  icon="https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/ada/dlss/geforce-rtx-40-series-dlss-3-logo.png"
                >
                  {t('nvidiaDLSSDesc')}
                </TechCard>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
