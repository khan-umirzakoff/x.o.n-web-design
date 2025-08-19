import React from 'react';
import { Language } from '../types';
import { translations, Translation } from '../i18n';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  language?: Language;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  count = 1,
  language = 'ENG'
}) => {
  const getAriaLabel = () => {
    const key = 'loadingContent' as keyof Translation;
    return (translations[language] as Translation)[key] || translations.ENG[key] || 'Loading content';
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-700 rounded ${className}`}
          aria-label={getAriaLabel()}
        />
      ))}
    </>
  );
};

// Game card skeleton
export const GameCardSkeleton: React.FC<{language?: Language}> = ({language = 'ENG'}) => (
  <div 
    className="aspect-square rounded-lg overflow-hidden bg-gray-800 animate-pulse"
    aria-label={(translations[language] as Translation)['loadingGame'] || 'Loading game'}
  >
    <div className="w-full h-full bg-gray-700" />
  </div>
);

// Game slider skeleton
export const GameSliderSkeleton: React.FC<{language?: Language}> = ({language = 'ENG'}) => (
  <div 
    className="relative h-96 bg-gray-800 rounded-lg overflow-hidden animate-pulse"
    aria-label={(translations[language] as Translation)['loadingFeaturedGame'] || 'Loading featured game'}
  >
    <div className="absolute inset-0 bg-gray-700" />
    <div className="absolute bottom-0 left-0 right-0 p-8">
      <div className="h-4 bg-gray-600 rounded w-24 mb-2" />
      <div className="h-8 bg-gray-600 rounded w-64 mb-4" />
      <div className="h-4 bg-gray-600 rounded w-96" />
    </div>
  </div>
);

export default SkeletonLoader;
