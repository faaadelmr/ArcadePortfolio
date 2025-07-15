
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const MUSIC_STORAGE_KEY = 'pixelplay-music-enabled';
const VOLUME_STORAGE_KEY = 'pixelplay-music-volume';
const MUSIC_SRC = '/Hyper Olympic (NES) Music.m4a'; // Path from public folder

// This global instance ensures we don't create multiple audio elements
let audioInstance: HTMLAudioElement | null = null;
const getAudioInstance = () => {
    if (typeof window === 'undefined') return null;
    if (!audioInstance) {
        audioInstance = new Audio(MUSIC_SRC);
        audioInstance.loop = true;
    }
    return audioInstance;
}

export default function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side after the component mounts
    audioRef.current = getAudioInstance();
    
    // On initial load, get preferences from localStorage
    const storedMusicPref = localStorage.getItem(MUSIC_STORAGE_KEY);
    const initialMusicState = storedMusicPref ? JSON.parse(storedMusicPref) : true;
    setIsMusicEnabled(initialMusicState);

    const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    const initialVolume = storedVolume ? parseFloat(storedVolume) : 0.3;
    setVolumeState(initialVolume);
    
    if(audioRef.current) {
        audioRef.current.volume = initialVolume;
    }

    setIsInitialized(true);
  }, []);

  const playMusic = useCallback(() => {
    if (audioRef.current && audioRef.current.paused && isMusicEnabled) {
      audioRef.current.play().catch(error => {
        // Autoplay was prevented. User interaction is needed.
        console.error("Music autoplay was prevented:", error);
      });
    }
  }, [isMusicEnabled]);

  const pauseMusic = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (!isInitialized || !audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    audioRef.current.volume = clampedVolume;
    localStorage.setItem(VOLUME_STORAGE_KEY, clampedVolume.toString());
  }, [isInitialized]);
  
  const toggleMusic = useCallback(() => {
    if (!isInitialized) return;
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify(newState));
    if (newState) {
      playMusic();
    } else {
      pauseMusic();
    }
  }, [isMusicEnabled, isInitialized, playMusic, pauseMusic]);
  
  useEffect(() => {
    if (isInitialized) {
        if (isMusicEnabled) {
            playMusic();
        } else {
            pauseMusic();
        }
    }
  }, [isMusicEnabled, isInitialized, playMusic, pauseMusic]);

  // This component will be rendered once in the app to provide the audio element
  const MusicPlayer = useCallback(() => {
    return null;
  }, []);

  return {
    isMusicEnabled: isInitialized ? isMusicEnabled : false,
    volume: isInitialized ? volume : 0.3,
    isInitialized,
    toggleMusic,
    setVolume,
    playMusic,
    pauseMusic,
    MusicPlayer
  };
}
