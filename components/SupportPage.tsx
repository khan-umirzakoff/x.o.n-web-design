
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SupportPageProps {
  t: (key: string) => string;
}

const SupportCard: React.FC<{title: string, children: React.ReactNode, icon: string, action?: React.ReactNode}> = ({ title, children, icon, action }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-lg flex flex-col md:flex-row items-start md:items-center gap-6">
        <img src={icon} alt="" className="w-12 h-12 flex-shrink-0"/>
        <div className="flex-grow">
            <h2 className="text-2xl font-semibold text-white mb-2">{title}</h2>
            <p className="text-gray-400">{children}</p>
        </div>
        {action && <div className="md:ml-auto mt-4 md:mt-0 flex-shrink-0 w-full md:w-auto">{action}</div>}
    </div>
);


const SupportPage: React.FC<SupportPageProps> = ({ t }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#111] py-16 sm:py-10 text-gray-300 min-h-[calc(100vh-128px)]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-orbitron font-bold text-white mb-8 border-b border-gray-700 pb-4">{t('supportTitle')}</h1>
          <div className="space-y-8">
            <SupportCard 
              title={t('supportFaqTitle')} 
              icon="/assets/images/icons/support/faq.svg"
              action={
                <button onClick={() => navigate('/guides')} className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full md:w-auto">
                    {t('viewGuides')}
                </button>
              }
            >
                {t('supportFaqText')}
            </SupportCard>
            <SupportCard 
              title={t('supportContactTitle')} 
              icon="/assets/images/icons/support/contact.svg"
              action={
                <a href="https://t.me/XON_Cloud_Gaming_Chat" target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors block text-center w-full md:w-auto">
                    {t('openTelegram')}
                </a>
              }
            >
                {t('supportContactText')}
            </SupportCard>
             <SupportCard 
                title={t('supportStatusTitle')} 
                icon="/assets/images/icons/support/status.svg"
                action={
                    <div className="flex items-center justify-center gap-2 bg-green-500/10 text-green-400 font-medium py-2 px-4 rounded-lg w-full md:w-auto">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span>{t('statusOperational')}</span>
                    </div>
                }
             >
                {t('supportStatusText')}
            </SupportCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;