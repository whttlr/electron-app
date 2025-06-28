import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './locales/en/translation.json';
import enUI from './locales/en/ui.json';
import enMachine from './locales/en/machine.json';
import enMessages from './locales/en/messages.json';

import esTranslation from './locales/es/translation.json';
import esUI from './locales/es/ui.json';
import esMachine from './locales/es/machine.json';
import esMessages from './locales/es/messages.json';

import deTranslation from './locales/de/translation.json';
import deUI from './locales/de/ui.json';
import deMachine from './locales/de/machine.json';
import deMessages from './locales/de/messages.json';

// Define resources
const resources = {
  en: {
    translation: enTranslation,
    ui: enUI,
    machine: enMachine,
    messages: enMessages
  },
  es: {
    translation: esTranslation,
    ui: esUI,
    machine: esMachine,
    messages: esMessages
  },
  de: {
    translation: deTranslation,
    ui: deUI,
    machine: deMachine,
    messages: deMessages
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'translation',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
      formatSeparator: ',',
      format: function(value, format, lng) {
        if (format === 'number') return new Intl.NumberFormat(lng).format(value);
        if (format === 'currency') return new Intl.NumberFormat(lng, { style: 'currency', currency: 'USD' }).format(value);
        if (format === 'date') return new Intl.DateTimeFormat(lng).format(value);
        if (format === 'time') return new Intl.DateTimeFormat(lng, { timeStyle: 'short' }).format(value);
        return value;
      }
    },

    // Debugging in development
    debug: process.env.NODE_ENV === 'development',

    // React options
    react: {
      useSuspense: false,
    },
  });

export default i18n;