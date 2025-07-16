
'use client';

import { useState, useEffect, useCallback } from 'react';

const SCANLINES_STORAGE_KEY = 'pixelplay-scanlines-enabled';

export default function useVisualSettings() {
  const [isScanlinesEnabled, setIsScanlinesEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedPref = localStorage.getItem(SCANLINES_STORAGE_KEY);
      const initialScanlineState = storedPref ? JSON.parse(storedPref) : true;
      setIsScanlinesEnabled(initialScanlineState);
    } catch (error) {
      console.error('Failed to read scanline settings from localStorage', error);
      setIsScanlinesEnabled(true);
    }
    setIsInitialized(true);
  }, []);

  const toggleScanlines = useCallback(() => {
    if (!isInitialized) return;
    
    const newState = !isScanlinesEnabled;
    setIsScanlinesEnabled(newState);

    try {
      localStorage.setItem(SCANLINES_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save scanline settings to localStorage', error);
    }
  }, [isScanlinesEnabled, isInitialized]);
  
  return {
    isScanlinesEnabled: isInitialized ? isScanlinesEnabled : true,
    isInitialized,
    toggleScanlines,
  };
}
