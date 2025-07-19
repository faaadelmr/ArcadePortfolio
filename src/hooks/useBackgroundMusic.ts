
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const MUSIC_STORAGE_KEY = 'pixelplay-music-enabled';
const VOLUME_STORAGE_KEY = 'pixelplay-music-volume';
const MUSIC_SRC = '/HyperOlympic.mp3';

let audioInstance: HTMLAudioElement | null = null;
const getAudioInstance = () => {
    if (typeof window === 'undefined') return null;
    if (!audioInstance) {
        audioInstance = new Audio();
    }
    return audioInstance;
}

export default function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    audioRef.current = getAudioInstance();
    
    const handleCanPlay = () => {
        setIsReady(true);
    };

    if (audioRef.current) {
        if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or more
            handleCanPlay();
        } else {
            audioRef.current.addEventListener('canplay', handleCanPlay);
            // Set src only if it's not set, to avoid re-triggering load
            if (audioRef.current.src !== window.location.origin + MUSIC_SRC) {
                 audioRef.current.src = MUSIC_SRC;
                 audioRef.current.load();
            }
        }
    }

    const storedMusicPref = localStorage.getItem(MUSIC_STORAGE_KEY);
    const initialMusicState = storedMusicPref ? JSON.parse(storedMusicPref) : true;
    setIsMusicEnabled(initialMusicState);

    const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    const initialVolume = storedVolume ? parseFloat(storedVolume) : 0.3;
    setVolumeState(initialVolume);
    
    if(audioRef.current) {
        audioRef.current.volume = initialVolume;
        audioRef.current.loop = true;
    }

    setIsInitialized(true);
    
    return () => {
        if (audioRef.current) {
            audioRef.current.removeEventListener('canplay', handleCanPlay);
        }
    };
  }, []);

  const playMusic = useCallback(() => {
    if (isReady && audioRef.current && audioRef.current.paused && isMusicEnabled) {
      audioRef.current.play().catch(error => {
        console.error("Music autoplay was prevented:", error);
      });
    }
  }, [isMusicEnabled, isReady]);

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

  return {
    isReady,
    isMusicEnabled: isInitialized ? isMusicEnabled : false,
    volume: isInitialized ? volume : 0.3,
    isInitialized,
    toggleMusic,
    setVolume,
    playMusic,
    pauseMusic,
  };
}
