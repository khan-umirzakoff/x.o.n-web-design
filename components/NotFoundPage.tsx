import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC<{ t: (key: string) => string }> = ({ t }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center text-white">
      <h1 className="text-6xl font-orbitron font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">{t('notFoundTitle')}</h2>
      <p className="text-gray-400 mb-8">{t('notFoundDesc')}</p>
      <Link
        to="/"
        className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-dark transition-colors"
      >
        {t('goHome')}
      </Link>
    </div>
  );
};

export default NotFoundPage;
