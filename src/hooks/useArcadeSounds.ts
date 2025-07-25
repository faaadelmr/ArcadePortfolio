
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
    Tone = await import('tone');
    if (!synth) {
      synth = new Tone.Synth().toDestination();
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
    
    if (T.context.state !== 'running') {
      T.context.resume().catch(e => console.error("Could not resume audio context", e));
      return; // Resume and try on the next user interaction
    }
    
    isSoundPlaying.current = true;
    
    try {
        // Stop any previous sound to prevent timing conflicts
        synth.triggerRelease();
        // By not providing a time, we let Tone.js schedule it for "now" without conflicts.
        synth.triggerAttackRelease(note, duration);
    } catch(e) {
        console.error("Failed to play sound", e);
    }
    
    // Use a numeric duration for the timeout
    const durationMs = T.Time(duration).toMilliseconds();
    soundTimeoutRef.current = setTimeout(() => {
        isSoundPlaying.current = false;
    }, durationMs);
  }, [isReady, isSoundEnabled]);

  const playNavigate = useCallback(() => playSound('C3', '16n'), [playSound]);
  const playSelect = useCallback(() => playSound('G4', '8n'), [playSound]);
  const playBack = useCallback(() => playSound('C4', '8n'), [playSound]);
  const playStart = useCallback(() => playSound('C5', '8n'), [playSound]);

  return { isReady, playNavigate, playSelect, playBack, playStart };
}
