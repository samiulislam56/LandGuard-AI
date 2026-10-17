import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import bn from './locales/bn.json';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('landguard_language') || 'bn' : 'bn';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    lng: savedLanguage,
    fallbackLng: 'bn',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    parseMissingKeyHandler: (key: string, defaultValue?: string) => {
      if (defaultValue) return defaultValue;
      const lastPart = key.split('.').pop() || key;
      // Convert camelCase or dot notations to readable title
      return lastPart
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export function setLanguage(lang: 'en' | 'bn') {
  i18n.changeLanguage(lang);
  if (typeof window !== 'undefined') {
    localStorage.setItem('landguard_language', lang);
    document.documentElement.lang = lang;
  }
}

export default i18n;
