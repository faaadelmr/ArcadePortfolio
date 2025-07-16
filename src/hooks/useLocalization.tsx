
'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { translate } from '@/ai/flows/translate-flow';

type Language = 'en' | 'id';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => any; // Allow returning non-string types for object/array data
  isLocalizationReady: boolean;
  isLoading: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Helper to get nested values from an object using a dot-notation key
const getNestedValue = (obj: any, key: string): any | undefined => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<any>({});
  const [isLocalizationReady, setIsLocalizationReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadInitialLanguage = async () => {
      const storedLang = localStorage.getItem('language') as Language;
      const initialLang = storedLang || 'en';
      
      const enTranslations = await import('@/locales/en.json');
      setTranslations({ en: enTranslations.default });

      setLanguage(initialLang); // This will trigger the translation logic if needed
      setIsLocalizationReady(true);
    };
    loadInitialLanguage();
  }, []);
  
  const setLanguage = useCallback(async (lang: Language) => {
    setIsLoading(true);
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    if (lang === 'id' && !translations.id) {
        const cachedTranslations = localStorage.getItem('translations_id');
        if (cachedTranslations) {
            setTranslations(prev => ({ ...prev, id: JSON.parse(cachedTranslations) }));
        } else {
            const enText = JSON.stringify(translations.en);
            try {
                const result = await translate({ text: enText });
                const idTranslations = JSON.parse(result.translation);
                setTranslations(prev => ({ ...prev, id: idTranslations }));
                localStorage.setItem('translations_id', JSON.stringify(idTranslations));
            } catch (error) {
                console.error("AI translation failed, falling back to English", error);
            }
        }
    }
    setIsLoading(false);
  }, [translations.en, translations.id]);


  const t = useCallback((key: string): any => {
    if (!isLocalizationReady) return '...';

    const source = translations[language] || translations.en;
    if (!source) return key; // Return key if no source is available
    
    const translation = getNestedValue(source, key);

    // If the translation for an array is a string, try to parse it.
    // This handles the case where the AI returns a stringified JSON array.
    if (typeof translation === 'string' && translation.trim().startsWith('[')) {
        try {
            return JSON.parse(translation);
        } catch {
            // If parsing fails, return the string as is.
        }
    }

    return translation || key;
  }, [language, translations, isLocalizationReady]);

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
