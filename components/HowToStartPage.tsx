
import React from 'react';
import { useNavigate } from 'react-router-dom';
import GuideSidebar from './guides/GuideSidebar';

const Step: React.FC<{
  step: number;
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
}> = ({ step, title, description, buttonText, onClick }) => (
  <div className="flex gap-6 items-start relative">
    <div className="flex-shrink-0 flex flex-col items-center z-10">
      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-white mb-2 border-4 border-[#111]">
        {step}
      </div>
    </div>
    <div className="pt-2 pb-12">
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="mb-4 text-gray-400">{description}</p>
      {buttonText && onClick && (
        <button
          onClick={onClick}
          className="bg-[#76b900] text-white font-medium text-sm rounded-lg px-6 py-2 hover:bg-[#82c90d] transition-colors shadow-lg"
        >
          {buttonText}
        </button>
      )}
    </div>
    {step < 5 && <div className="absolute top-12 left-6 w-px h-full bg-gray-700"></div>}
  </div>
);

interface HowToStartPageProps {
    t: (key: string) => string;
    onLoginClick?: () => void;
    onTopUpClick?: () => void;
    isLoggedIn?: boolean;
}

const HowToStartPage: React.FC<HowToStartPageProps> = ({ t, onLoginClick, onTopUpClick, isLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#111]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 w-full flex-shrink-0">
            <GuideSidebar t={t} />
          </div>
          <div className="lg:w-3/4 w-full text-gray-300">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-orbitron font-bold text-white border-b border-gray-700 pb-4 mb-8">{t('howToStartTitle')}</h1>

              {/* <div className="relative h-0 pb-[56.25%] mb-12 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/vs0omriW7PI?si=jMDaOls5PF1G3Dn0"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div> */}

              <div className="flex flex-col">
                <Step
                  step={1}
                  title={t('step1Title')}
                  description={t('step1Desc')}
                  buttonText={t('step1Btn')}
                  onClick={() => onLoginClick && onLoginClick()}
                />
                <Step
                  step={2}
                  title={t('step2Title')}
                  description={t('step2Desc')}
                  buttonText={t('step2Btn')}
                  onClick={() => isLoggedIn && onTopUpClick ? onTopUpClick() : onLoginClick && onLoginClick()}
                />
                 <Step 
                  step={3}
                  title={t('step3Title')}
                  description={t('step3Desc')}
                  buttonText={t('step3Btn')}
                  onClick={() => navigate('/download')}
                />
                 <Step 
                  step={4}
                  title={t('step4Title')}
                  description={t('step4Desc')}
                />
                 <Step 
                  step={5}
                  title={t('step5Title')}
                  description={t('step5Desc')}
                  buttonText={t('step5Btn')}
                  onClick={() => navigate('/games')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToStartPage;
