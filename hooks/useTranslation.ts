import { translations, Translation } from '../i18n';
import { Language } from '../types';

export const useTranslation = (language: Language) => {
  const t = (key: keyof Translation) => {
    return (translations[language] as Translation)[key] || translations.ENG[key] || key;
  };
  return { t };
};
