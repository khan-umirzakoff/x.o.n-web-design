
import React from 'react';

export const GlobeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

export const LoginIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);


export const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export const WindowsIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3,12V6.75L9,5.42V11.25V12H3M10,5.21L21,3V11.25H10V5.21M3,13H9V18.58L3,17.25V13M10,18.79L21,21V12.75H10V18.79Z" /></svg>
);

export const AppleIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.3,12.23C19.3,13.2,20,14.24,20,15.28C20,17.81,18.39,19.25,17.15,20.06C16,20.8,15.11,21,14.39,21C13.5,21,13.23,20.76,12,20.76C10.77,20.76,10.5,21,9.61,21C8.89,21,7.91,20.73,6.85,20.06C5.61,19.25,4,17.81,4,15.28C4,12.75,5.69,11.38,6.86,10.5C7.93,9.73,8.91,9.5,9.79,9.5C10.68,9.5,10.95,9.75,12.18,9.75C13.41,9.75,13.6,9.5,14.5,9.5C15.27,9.5,16.17,9.76,17.15,10.38C17.07,10.46,16.22,10.96,16.22,12.3C16.22,14.24,17.59,15.14,17.87,15.25C17.91,15.27,17.95,15.28,18,15.28C18.18,15.28,18.35,15.11,18.35,14.93C18.35,14.33,18.04,13.5,18.04,12.5C18.04,11.54,18.5,10.61,18.68,10.33C17.85,9.81,17.13,9.5,16.5,9.24C16.5,9.23,16.5,9.22,16.5,9.21C16.88,8.5,17,7.72,17,6.93C17,5,15.76,3.72,14.95,3.44C13.9,3.08,12.8,3.5,12.18,3.5C11.56,3.5,10.5,3.08,9.5,3.44C8.65,3.76,7.18,5,7.18,6.93C7.18,7.88,7.41,8.68,7.82,9.27C6.38,10,5.61,10.83,5.1,11.5C4.5,12.3,4,13.18,4,14.07C4,14.18,4,14.28,4,14.38C4.09,14.38,4.18,14.37,4.27,14.36C4.79,14.21,5.5,14.07,6.33,14.07C7.15,14.07,7.87,14.21,8.37,14.35C8.45,14.38,8.54,14.39,8.62,14.39C8.8,14.39,8.96,14.22,8.96,14.04C8.96,13.3,9.3,12.5,9.3,11.63C9.3,10.63,8.71,9.8,8.5,9.57C9.3,9.11,10.2,9,11.12,9C11.38,9,12.2,9.08,12.92,9.44C13.06,9.17,13.18,8.91,13.27,8.64C13.72,7.26,14.93,6.5,15.54,6.2C15.73,6.12,15.93,6.08,16.12,6.08C16.23,6.08,16.33,6.09,16.43,6.11C16.05,5.3,15.5,4.69,14.63,4.35C14.06,4.14,13.5,4.06,12.95,4.06C12.79,4.06,12.64,4.08,12.48,4.11C12.44,4.2,12.4,4.29,12.38,4.38C12.38,4.41,12.38,4.45,12.4,4.48C12.5,4.89,12.88,5.43,12.88,6.2C12.88,6.86,12.5,7.74,11.81,8.19C11.75,8.23,11.69,8.27,11.63,8.3C11.3,8.5,10.95,8.5,10.74,8.5C10.5,8.5,9.91,8.35,9.45,8.13C9.07,7.96,8.7,7.78,8.32,7.6C8.19,7.54,8.07,7.48,7.95,7.42C7.94,7.41,7.93,7.41,7.92,7.4C7.81,7.31,7.72,7.21,7.63,7.12C7.55,7.03,7.47,6.93,7.41,6.83C7.38,6.77,7.35,6.72,7.33,6.66C8.04,6.16,8.61,5.64,8.93,5.06C9.17,4.61,9.26,4.27,9.26,4.07C9.26,3.95,9.15,3.8,9,3.8C8.85,3.8,8.74,3.95,8.74,4.07C8.74,4.21,8.66,4.5,8.45,4.89C8.15,5.43,7.63,5.92,6.96,6.4C6.88,6.46,6.8,6.53,6.72,6.59C6.67,6.63,6.63,6.67,6.58,6.72C6.52,6.78,6.45,6.85,6.38,6.92C6.29,7,6.2,7.1,6.1,7.2C6,7.3,5.89,7.4,5.79,7.51C5.7,7.6,5.63,7.69,5.55,7.78C5.53,7.8,5.5,7.83,5.48,7.85C6.18,8.5,6.93,9.3,8.37,10C8.59,10.15,9.18,10.5,10.12,10.5C10.84,10.5,11.05,10.25,12.28,10.25C13.5,10.25,13.73,10.5,14.39,10.5C15.17,10.5,15.82,10.18,16.32,9.94L16.5,9.85C16.41,9.81,16.32,9.78,16.23,9.74C15.63,9.5,15.11,9.24,15.11,8.37C15.11,7.69,15.5,7.2,15.82,7C16.04,6.89,16.28,6.89,16.5,7C17.07,7.33,17.5,7.88,17.7,8.27C17.13,8.71,16.88,9.39,16.88,10.14C16.88,11.13,17.59,11.83,18.43,12.16C19.3,12.5,19.3,12.23,19.3,12.23Z" /></svg>
);

export const ChromeIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M14,12L12.23,8.5L14,5H10L8,8.5L10,12H14M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,18.5C11.83,18.5 11.67,18.45 11.5,18.4L8,12L11.5,5.6C11.67,5.55 11.83,5.5 12,5.5C15.59,5.5 18.5,8.41 18.5,12C18.5,15.59 15.59,18.5 12,18.5Z" /></svg>
);

export const MacOsIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.5,13.2H20.7V14.9C20.7,15.7 20.3,16.1 19.6,16.1H18.8V7.8H19.6C20.3,7.8 20.7,8.2 20.7,8.9V10.6H21.5V8.9C21.5,7.5 20.8,6.8 19.6,6.8H18.8V6.1C18.8,5.4 18.4,5 17.7,5H6.2C5.5,5 5.1,5.4 5.1,6.1V6.8H4.3C3.1,6.8 2.4,7.5 2.4,8.9V10.6H3.2V8.9C3.2,8.2 3.6,7.8 4.3,7.8H5.1V16.1H4.3C3.6,16.1 3.2,15.7 3.2,14.9V13.2H2.4V14.9C2.4,16.4 3.1,17.1 4.3,17.1H5.1V17.8C5.1,18.5 5.5,18.9 6.2,18.9H17.7C18.4,18.9 18.8,18.5 18.8,17.8V17.1H19.6C20.8,17.1 21.5,16.4 21.5,14.9V13.2M17.8,16.1V7.8H6.1V16.1H17.8Z" />
    </svg>
);

export const AndroidIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16,18H8V9H16M15.5,5.8C15.5,5.8 15.4,5.8 15.4,5.8C15.2,5.5 14.8,5.3 14.4,5.3H9.6C9.2,5.3 8.8,5.5 8.6,5.8C8.6,5.8 8.5,5.8 8.5,5.8C8.3,5.9 8.2,6.1 8.1,6.3L7.8,7.8C7,8.2 6.4,8.8 6.1,9.5L5.8,11.3C5.8,11.3 5.8,11.3 5.8,11.3C5.6,11.7 5.4,12.1 5.3,12.5V13.4C5.3,14 5.5,14.5 5.8,14.9C5.8,14.9 5.8,14.9 5.8,15L6.1,16.7C6.4,17.4 7,18 7.8,18.4L8.1,18.6C8.2,18.8 8.3,19 8.5,19.1C8.5,19.1 8.6,19.1 8.6,19.1C8.8,19.4 9.2,19.6 9.6,19.6H14.4C14.8,19.6 15.2,19.4 15.4,19.1C15.4,19.1 15.5,19.1 15.5,19.1C15.7,19 15.8,18.8 15.9,18.6L16.2,18.4C17,18 17.6,17.4 17.9,16.7L18.2,15C18.2,14.9 18.2,14.9 18.2,14.9C18.5,14.5 18.7,14 18.7,13.4V12.5C18.6,12.1 18.4,11.7 18.2,11.3C18.2,11.3 18.2,11.3 18.2,11.3L17.9,9.5C17.6,8.8 17,8.2 16.2,7.8L15.9,6.3C15.8,6.1 15.7,5.9 15.5,5.8M10,12.4A1.1,1.1 0 0,0 9,13.5A1.1,1.1 0 0,0 10,14.6A1.1,1.1 0 0,0 11,13.5A1.1,1.1 0 0,0 10,12.4M14,12.4A1.1,1.1 0 0,0 13,13.5A1.1,1.1 0 0,0 14,14.6A1.1,1.1 0 0,0 15,13.5A1.1,1.1 0 0,0 14,12.4Z" />
    </svg>
);

export const LinuxIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-4.9-5.9l4.9-2.1 2.1 4.9L9.2 16l4.9-11.4-11.4 4.9 2.1 4.9z" />
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const PlayInBrowserIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
);

export const ShareIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export const LgIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12.75,17.69h-1.5v-7.5H9.69V9.38h4.69v0.81h-1.56V17.69z M16.5,12.38c0,2.07-1.4,3.19-3.31,3.19h-1.16v-1.31h1.12c1.24,0,1.88-0.62,1.88-1.88s-0.63-1.88-1.88-1.88h-1.12V9.38h1.16C15.1,9.38,16.5,10.31,16.5,12.38z" />
    </svg>
);



export const SafariIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (

    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-4.9-5.9l4.9-2.1 2.1 4.9L9.2 16l4.9-11.4-11.4 4.9 2.1 4.9z" />
    </svg>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48" className={className}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);
