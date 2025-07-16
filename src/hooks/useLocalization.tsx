
'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

type Language = 'en' | 'id';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => any; 
  isLocalizationReady: boolean;
  isLoading: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const getNestedValue = (obj: any, key: string): any | undefined => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<any>({ en: null, id: null });
  const [isLocalizationReady, setIsLocalizationReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTranslations = useCallback(async () => {
    setIsLoading(true);
    try {
        const enPromise = import('@/locales/en.json');
        const idPromise = import('@/locales/id.json');
        
        const [enTranslations, idTranslations] = await Promise.all([enPromise, idPromise]);
        
        setTranslations({
            en: enTranslations.default,
            id: idTranslations.default
        });
    } catch (error) {
        console.error("Failed to load translations:", error);
        // Fallback to English if something goes wrong
        if (!translations.en) {
            const enTranslations = await import('@/locales/en.json');
            setTranslations(prev => ({ ...prev, en: enTranslations.default }));
        }
    }
    setIsLoading(false);
    setIsLocalizationReady(true);
  }, []);
  
  useEffect(() => {
    fetchTranslations();
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && (storedLang === 'en' || storedLang === 'id')) {
        setLanguageState(storedLang);
    }
  }, [fetchTranslations]);
  
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);


  const t = useCallback((key: string): any => {
    if (!isLocalizationReady || isLoading) return '...';

    const source = translations[language] || translations.en;
    if (!source) return key;
    
    const translation = getNestedValue(source, key);

    if (typeof translation === 'string' && translation.trim().startsWith('[')) {
        try {
            return JSON.parse(translation);
        } catch {
            // fallback to string if parsing fails
        }
    }

    return translation !== undefined ? translation : key;
  }, [language, translations, isLocalizationReady, isLoading]);

  const value = {
    language,
    setLanguage,
    t,
    isLocalizationReady,
    isLoading
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
