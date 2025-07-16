
'use client';

import { useState, useEffect, useCallback } from 'react';

const SOUND_STORAGE_KEY = 'pixelplay-sound-enabled';

export default function useSoundSettings() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedPref = localStorage.getItem(SOUND_STORAGE_KEY);
      const initialSoundState = storedPref ? JSON.parse(storedPref) : true;
      setIsSoundEnabled(initialSoundState);
    } catch (error) {
      console.error('Failed to read sound settings from localStorage', error);
      setIsSoundEnabled(true);
    }
    setIsInitialized(true);
  }, []);

  const toggleSound = useCallback(() => {
    if (!isInitialized) return;
    
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);

    try {
      localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save sound settings to localStorage', error);
    }
  }, [isSoundEnabled, isInitialized]);
  
  return {
    isSoundEnabled: isInitialized ? isSoundEnabled : true,
    isInitialized,
    toggleSound,
  };
}
