
'use client';

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

const SCANLINES_STORAGE_KEY = 'pixelplay-scanlines-enabled';

interface VisualSettingsContextType {
  isScanlinesEnabled: boolean;
  toggleScanlines: () => void;
  isInitialized: boolean;
}

const VisualSettingsContext = createContext<VisualSettingsContextType | undefined>(undefined);

export const VisualSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScanlinesEnabled, setIsScanlinesEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedPref = localStorage.getItem(SCANLINES_STORAGE_KEY);
      if (storedPref !== null) {
        setIsScanlinesEnabled(JSON.parse(storedPref));
      }
    } catch (error) {
      console.error('Failed to read scanline settings from localStorage', error);
      setIsScanlinesEnabled(true);
    }
    setIsInitialized(true);
  }, []);

  const toggleScanlines = useCallback(() => {
    if (!isInitialized) return;
    
    try {
      setIsScanlinesEnabled(prevState => {
          const newState = !prevState;
          try {
            localStorage.setItem(SCANLINES_STORAGE_KEY, JSON.stringify(newState));
          } catch (error) {
            console.error('Failed to save scanline settings to localStorage', error);
          }
          return newState;
      });
    } catch (error) {
      console.error('Failed to toggle scanlines', error);
    }

  }, [isInitialized]);

  const value = {
    isScanlinesEnabled: isInitialized ? isScanlinesEnabled : true,
    isInitialized,
    toggleScanlines,
  };

  return (
    <VisualSettingsContext.Provider value={value}>
      {children}
    </VisualSettingsContext.Provider>
  );
};

export const useVisualSettings = () => {
  const context = useContext(VisualSettingsContext);
  if (context === undefined) {
    throw new Error('useVisualSettings must be used within a VisualSettingsProvider');
  }
  return context;
};
