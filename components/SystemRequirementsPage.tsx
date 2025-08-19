
import React from 'react';
import { useParams } from 'react-router-dom';
import GuideSidebar from './guides/GuideSidebar';

interface SystemRequirementsPageProps {
    t: (key: string) => string;
}

const RequirementSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
        <div className="list-disc list-inside space-y-1 pl-2">
            {children}
        </div>
    </div>
);

const WindowsRequirements: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <>
        <h1 className="text-3xl font-orbitron font-bold text-white border-b border-gray-700 pb-4 mb-8">{t('sysReqWindowsTitle')}</h1>
        <RequirementSection title={t('sysReqOsTitle')}>
            <li>{t('sysReqWindowsOsDesc')}</li>
        </RequirementSection>
        <RequirementSection title={t('sysReqHardwareTitle')}>
            <li>{t('sysReqWindowsCpu')}</li>
            <li>{t('sysReqWindowsRam')}</li>
            <li>{t('sysReqWindowsGpu')}:
                <ul className="list-[circle] list-inside pl-6 mt-1 space-y-1">
                    <li>{t('sysReqWindowsGpuNvidia')}</li>
                    <li>{t('sysReqWindowsGpuAmd')}</li>
                    <li>{t('sysReqWindowsGpuIntel')}</li>
                </ul>
            </li>
        </RequirementSection>
    </>
);

const MacOSRequirements: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <>
        <h1 className="text-3xl font-orbitron font-bold text-white border-b border-gray-700 pb-4 mb-8">{t('sysReqMacOS_Title')}</h1>
        <RequirementSection title={t('sysReqOsTitle')}>
            <li>{t('sysReqMacOS_OsDesc')}</li>
        </RequirementSection>
        <RequirementSection title={t('sysReqHardwareTitle')}>
            <li>{t('sysReqMacOS_HardwareDesc')}</li>
        </RequirementSection>
    </>
);

const AndroidRequirements: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <>
        <h1 className="text-3xl font-orbitron font-bold text-white border-b border-gray-700 pb-4 mb-8">{t('sysReqAndroid_Title')}</h1>
        <RequirementSection title={t('sysReqOsTitle')}>
            <li>{t('sysReqAndroid_OsDesc')}</li>
        </RequirementSection>
        <RequirementSection title={t('sysReqHardwareTitle')}>
           <li>{t('sysReqAndroid_HardwareDesc')}</li>
        </RequirementSection>
    </>
);

const IOSRequirements: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <>
        <h1 className="text-3xl font-orbitron font-bold text-white border-b border-gray-700 pb-4 mb-8">{t('sysReqIOS_Title')}</h1>
        <RequirementSection title={t('sysReqOsTitle')}>
            <li>{t('sysReqIOS_OsDesc')}</li>
        </RequirementSection>
    </>
);

const LinuxRequirements: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <>
        <h1 className="text-3xl font-orbitron font-bold text-white border-b border-gray-700 pb-4 mb-8">{t('sysReqLinux_Title')}</h1>
        <RequirementSection title={t('sysReqSoftwareTitle')}>
            <li>{t('sysReqLinux_SoftwareDesc1')}</li>
            <li>{t('sysReqLinux_SoftwareDesc2')}</li>
        </RequirementSection>
        <RequirementSection title={t('sysReqHardwareTitle')}>
            <li>{t('sysReqLinux_HardwareDesc')}</li>
        </RequirementSection>
    </>
);

const ChromeRequirements: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <>
        <h1 className="text-3xl font-orbitron font-bold text-white border-b border-gray-700 pb-4 mb-8">{t('sysReqChrome_Title')}</h1>
        <RequirementSection title={t('sysReqSoftwareTitle')}>
            <li>{t('sysReqChrome_SoftwareDesc')}</li>
        </RequirementSection>
        <RequirementSection title={t('sysReqHardwareTitle')}>
            <li>{t('sysReqChrome_HardwareDesc')}</li>
        </RequirementSection>
    </>
);

const TVRequirements: React.FC<{ t: (key: string) => string }> = ({ t }) => (
    <>
        <h1 className="text-3xl font-orbitron font-bold text-white border-b border-gray-700 pb-4 mb-8">{t('sysReqTV_Title')}</h1>
        <RequirementSection title={t('sysReqSoftwareTitle')}>
            <li>{t('sysReqTV_LgDesc')}</li>
            <li>{t('sysReqTV_SamsungDesc')}</li>
        </RequirementSection>
    </>
);

const platformComponents: {[key:string]: React.FC<{t: (key: string) => string}>} = {
    windows: WindowsRequirements,
    macos: MacOSRequirements,
    android: AndroidRequirements,
    ios: IOSRequirements,
    linux: LinuxRequirements,
    chrome: ChromeRequirements,
    tv: TVRequirements,
};

const SystemRequirementsPage: React.FC<SystemRequirementsPageProps> = ({ t }) => {
    const { platform = 'windows' } = useParams<{ platform: string }>();
    const PlatformComponent = platformComponents[platform] || WindowsRequirements;

    return (
        <div className="bg-[#111]">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/4 w-full flex-shrink-0">
                        <GuideSidebar t={t} />
                    </div>
                    <div className="lg:w-3/4 w-full text-gray-300 space-y-8">
                        <PlatformComponent t={t} />

                        <RequirementSection title={t('sysReqInternetTitle')}>
                            <li>{t('sysReqInternetSpeed1')}</li>
                            <li>{t('sysReqInternetSpeed2')}</li>
                            <li>{t('sysReqInternetSpeed3')}</li>
                            <li>{t('sysReqInternetSpeed4')}</li>
                            <li>{t('sysReqInternetConnection')}</li>
                        </RequirementSection>

                        <RequirementSection title={t('sysReqPeripheralsTitle')}>
                            <li>{t('sysReqPeripheralsDesc')}</li>
                        </RequirementSection>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemRequirementsPage;
