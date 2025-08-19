
import React from 'react';
import { Link } from 'react-router-dom';

interface DownloadPageProps {
  t: (key: string) => string;
}

const DownloadLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ href, children, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-[#2a2a2a] hover:bg-[#333] text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center text-left"
  >
    <div className="w-10 h-10 mr-4 flex items-center justify-center">{icon}</div>
    <span className="flex-1 text-sm">{children}</span>
  </a>
);

const DownloadPage: React.FC<DownloadPageProps> = ({ t }) => {
  return (
    <div className="bg-[#111] py-16 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="font-orbitron text-4xl sm:text-3xl uppercase mb-12 font-bold">
            {t('downloadTitle')}
          </h1>

          <div>
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DownloadLink
                  href="https://apps.microsoft.com/detail/9MW1BS08ZBTH?hl=en-us&gl=US&ocid=pdpshare"
                  icon={<img src="/assets/images/icons/os/windows.svg" alt="Windows" className="w-8 h-8 fade-in-on-load" />}
                >
                  {t('downloadForWindows')}
                </DownloadLink>
                <DownloadLink
                  href="https://apps.apple.com/us/app/moonlight-game-streaming/id1000551566"
                  icon={<img src="/assets/images/icons/os/macos.svg" alt="macOS" className="w-8 h-8 fade-in-on-load" />}
                >
                  {t('downloadForMacOS')}
                </DownloadLink>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DownloadLink
                  href="https://play.google.com/store/apps/details?id=com.limelight"
                  icon={<img src="/assets/images/icons/os/android.svg" alt="Android" className="w-8 h-8 fade-in-on-load" />}
                >
                  {t('downloadForAndroid')}
                </DownloadLink>
                <DownloadLink
                  href="https://apps.apple.com/us/app/moonlight-game-streaming/id1000551566"
                  icon={<img src="/assets/images/icons/os/apple.svg" alt="iOS / tvOS" className="w-8 h-8 fade-in-on-load" />}
                >
                  {t('downloadForIos')}
                </DownloadLink>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DownloadLink
                  href="https://flathub.org/apps/com.moonlight_stream.Moonlight"
                  icon={<img src="/assets/images/icons/os/steamdeck.svg" alt="Steam Deck" className="w-8 h-8 fade-in-on-load" />}
                >
                  {t('downloadForSteamDeck')}
                </DownloadLink>
                <DownloadLink
                  href="https://chromewebstore.google.com/detail/moonlight-game-streaming/gemamigbbenahjlfnmlfdjhdnkagmcna"
                  icon={<img src="/assets/images/icons/os/chrome.svg" alt="Chrome" className="w-8 h-8 fade-in-on-load" />}
                >
                  {t('downloadForChrome')}
                </DownloadLink>
              </div>
            </div>

            <div className="text-gray-400 mt-8 text-sm">
              <p>{t('downloadDesc')}</p>
            </div>
            <div className="mt-4 text-sm">
              <Link
                to="/system-requirements"
                className="text-gray-400 hover:text-white underline"
              >
                {t('sysReq')}
              </Link>
            </div>
          </div>
          
          <hr className="border-t border-gray-800 my-16" />

          <div className="text-left max-w-3xl mx-auto space-y-4 text-gray-300">
            <h2 className="text-2xl font-medium text-white mb-4">{t('downloadMoonlightTitle')}</h2>
            <p>{t('downloadMoonlightP1')}</p>
            <p>{t('downloadMoonlightP2')}</p>
            <p>{t('downloadMoonlightP3')}</p>
            <p>{t('downloadMoonlightP4')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
