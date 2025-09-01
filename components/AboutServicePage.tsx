
import React from 'react';

interface AboutServicePageProps {
  t: (key: string) => string;
}

const AboutServicePage: React.FC<AboutServicePageProps> = ({ t }) => {
  return (
    <div className="bg-[#111] py-16 sm:py-10 text-gray-300 min-h-[calc(100vh-128px)]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 border-b border-gray-700 pb-4">{t('aboutServiceTitle')}</h1>
          <div className="space-y-6 text-lg leading-relaxed">
            <p>{t('aboutServiceP1')}</p>
            <p>{t('aboutServiceP2')}</p>
            <p>{t('aboutServiceP3')}</p>
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-4">{t('projectFounderTitle')}</h2>
            <div className="text-lg leading-relaxed space-y-4">
                <p>
                    Khan Umirzakoff
                </p>
                {/* <p>{t('projectFounderLinks')}</p>
                <div className="flex flex-wrap gap-4">
                    <SocialLink href="https://www.instagram.com/adept.tech">{t('instagram')}</SocialLink>
                    <SocialLink href="https://t.me/adept_tech">{t('telegram')}</SocialLink>
                    <SocialLink href="https://www.youtube.com/@UZGAMER">{t('youtube')}</SocialLink>
                </div> */}
            </div>
          </div>
          
          <div className="mt-12">
            <details className="text-sm">
              <summary className="text-lg font-medium text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                {t('developerInfoTitle')}
              </summary>
              <div className="mt-2 pl-4 text-sm text-gray-400 border-l border-gray-700">
                <p>
                  {t('developerInfo')}{' '}
                  <a href="https://t.me/Khan_Umirzakoff" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    {t('telegram')}
                  </a>.
                </p>
              </div>
            </details>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutServicePage;
