'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const MUSIC_STORAGE_KEY = 'pixelplay-music-enabled';
const MUSIC_SRC = '/Hyper Olympic (NES) Music.m4a'; // Path from public folder

// This global instance ensures we don't create multiple audio elements
let audioInstance: HTMLAudioElement | null = null;
const getAudioInstance = () => {
    if (typeof window === 'undefined') return null;
    if (!audioInstance) {
        audioInstance = new Audio(MUSIC_SRC);
        audioInstance.loop = true;
        audioInstance.volume = 0.3; // Set a reasonable volume
    }
    return audioInstance;
}

export default function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(getAudioInstance());
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // On initial load, get preference from localStorage
    const storedPreference = localStorage.getItem(MUSIC_STORAGE_KEY);
    // Default to true if no preference is stored
    const initialMusicState = storedPreference ? JSON.parse(storedPreference) : true;
    setIsMusicEnabled(initialMusicState);
    setIsInitialized(true);
  }, []);

  const playMusic = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(error => {
        // Autoplay was prevented. User interaction is needed.
        console.error("Music autoplay was prevented:", error);
      });
    }
  }, []);

  const pauseMusic = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);
  
  const toggleMusic = useCallback(() => {
    if (!isInitialized) return; // Don't toggle until initial state is loaded
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify(newState));
    if (newState) {
      playMusic();
    } else {
      pauseMusic();
    }
  }, [isMusicEnabled, isInitialized, playMusic, pauseMusic]);
  
  // This component will be rendered once in the app to provide the audio element
  const MusicPlayer = useCallback(() => {
    // The ref handles the audio element creation and persistence
    return null;
  }, []);

  return {
    isMusicEnabled: isInitialized ? isMusicEnabled : false,
    toggleMusic,
    playMusic,
    pauseMusic,
    MusicPlayer
  };
}
