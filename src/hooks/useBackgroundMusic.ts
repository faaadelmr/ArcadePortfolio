
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

    const handleError = (e: ErrorEvent) => {
      console.error("Audio loading error:", e);
      setIsReady(false);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('error', handleError);

      // Set src only if it's not set, to avoid re-triggering load
      if (audioRef.current.src !== window.location.origin + MUSIC_SRC) {
        audioRef.current.src = MUSIC_SRC;
        audioRef.current.load();
      }

      // Check if already ready
      if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or more
        handleCanPlay();
      }
    }

    const storedMusicPref = localStorage.getItem(MUSIC_STORAGE_KEY);
    const initialMusicState = storedMusicPref !== null ? JSON.parse(storedMusicPref) : true;
    setIsMusicEnabled(initialMusicState);

    const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
    const initialVolume = storedVolume ? parseFloat(storedVolume) : 0.3;
    setVolumeState(initialVolume);

    if (audioRef.current) {
      audioRef.current.volume = initialVolume;
      audioRef.current.loop = true;
    }

    setIsInitialized(true);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplay', handleCanPlay);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, []);

  const playMusic = useCallback(() => {
    if (isReady && audioRef.current && audioRef.current.paused && isMusicEnabled) {
      audioRef.current.play().catch(() => {
        // Silently ignore autoplay errors - this is expected browser behavior
        // Music will play once user interacts with the page
      });
    }
  }, [isMusicEnabled, isReady]);

  const pauseMusic = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      try {
        audioRef.current.pause();
      } catch (error) {
        console.error("Error pausing music:", error);
      }
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (!isInitialized || !audioRef.current) return;
    try {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolumeState(clampedVolume);
      audioRef.current.volume = clampedVolume;
      localStorage.setItem(VOLUME_STORAGE_KEY, clampedVolume.toString());
    } catch (error) {
      console.error("Error setting volume:", error);
    }
  }, [isInitialized]);

  const toggleMusic = useCallback(() => {
    if (!isInitialized) return;
    try {
      const newState = !isMusicEnabled;
      setIsMusicEnabled(newState);
      localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify(newState));
      if (newState) {
        playMusic();
      } else {
        pauseMusic();
      }
    } catch (error) {
      console.error("Error toggling music:", error);
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
