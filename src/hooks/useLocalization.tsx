
'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

type Language = 'en' | 'id';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: <T = string>(key: string) => T;
  isLocalizationReady: boolean;
  isLoading: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const getNestedValue = (obj: Record<string, unknown>, key: string): unknown => {
  return key.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<{ en: Record<string, unknown> | null, id: Record<string, unknown> | null }>({ en: null, id: null });
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
            setTranslations((prev) => ({ ...prev, en: enTranslations.default as Record<string, unknown> }));
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


  const t = useCallback(<T = string>(key: string): T => {
    if (!isLocalizationReady || isLoading) return '...' as unknown as T;

    const source = translations[language] || translations.en;
    if (!source) return key as unknown as T;
    
    const translation = getNestedValue(source, key);

    if (typeof translation === 'string' && translation.trim().startsWith('[')) {
        try {
            return JSON.parse(translation) as T;
        } catch {
            // fallback to string if parsing fails
        }
    }

    return (translation !== undefined ? translation : key) as unknown as T;
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
