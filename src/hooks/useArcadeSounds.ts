
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { Synth } from 'tone';
import useSoundSettings from './useSoundSettings';

interface UseArcadeSoundsProps {
  isSoundEnabled?: boolean;
}

let Tone: typeof import('tone') | null = null;
let synth: Synth | null = null;

const loadTone = async () => {
  if (typeof window === 'undefined') return { Tone: null, synth: null };
  if (!Tone) {
    try {
      Tone = await import('tone');
      if (!synth) {
        synth = new Tone.Synth().toDestination();
      }
    } catch (error) {
      console.error("Failed to load Tone.js:", error);
      return { Tone: null, synth: null };
    }
  }
  return { Tone, synth };
};

// This hook safely handles Tone.js which is a client-side library.
export default function useArcadeSounds(props?: UseArcadeSoundsProps) {
  const isSoundPlaying = useRef(false);
  const soundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { isSoundEnabled: globalSoundEnabled } = useSoundSettings();

  const isSoundEnabled = props?.isSoundEnabled ?? globalSoundEnabled;

  useEffect(() => {
    loadTone().then(() => {
      setIsReady(true);
    });
    // Cleanup timeout on unmount
    return () => {
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
      }
    };
  }, []);

  const playSound = useCallback((note: string, duration: string) => {
    if (!Tone || !synth || !isReady || isSoundPlaying.current || !isSoundEnabled) return;

    const T = Tone;

    // Check if audio context is running, if not, just return silently
    // This handles the autoplay policy without logging errors
    if (T.context.state !== 'running') {
      T.context.resume().catch(() => {
        // Silently ignore - will work on next user interaction
      });
      return;
    }

    isSoundPlaying.current = true;

    try {
      // Get current time from Tone.js context
      const now = T.now();
      // Schedule attack slightly in the future to avoid timing conflicts
      synth.triggerAttackRelease(note, duration, now + 0.01);
    } catch (e) {
      // Silently handle errors to avoid console spam
      isSoundPlaying.current = false;
      return;
    }

    // Use a numeric duration for the timeout
    try {
      const durationMs = T.Time(duration).toMilliseconds();
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
      }
      soundTimeoutRef.current = setTimeout(() => {
        isSoundPlaying.current = false;
      }, durationMs + 50); // Add small buffer
    } catch (e) {
      isSoundPlaying.current = false;
    }
  }, [isReady, isSoundEnabled]);

  const playNavigate = useCallback(() => playSound('C3', '16n'), [playSound]);
  const playSelect = useCallback(() => playSound('G4', '8n'), [playSound]);
  const playBack = useCallback(() => playSound('C4', '8n'), [playSound]);
  const playStart = useCallback(() => playSound('C5', '8n'), [playSound]);

  return { isReady, playNavigate, playSelect, playBack, playStart };
}
