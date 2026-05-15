import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('de');

  const t = (key: TranslationKey): string => {
    try {
      const currentTranslations = translations[language];
      if (currentTranslations && currentTranslations[key]) {
        return currentTranslations[key];
      }
      const fallback = translations.de[key];
      return fallback || key;
    } catch (error) {
      return key;
    }
  };

  const contextValue = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}