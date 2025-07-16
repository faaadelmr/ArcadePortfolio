
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { Synth } from 'tone';

interface UseArcadeSoundsProps {
  isSoundEnabled: boolean;
}

let Tone: typeof import('tone') | null = null;
let synth: Synth | null = null;

const loadTone = async () => {
  if (!Tone) {
    Tone = await import('tone');
    if (!synth) {
      synth = new Tone.Synth().toDestination();
    }
  }
  return { Tone, synth };
};

// This hook safely handles Tone.js which is a client-side library.
export default function useArcadeSounds({ isSoundEnabled }: UseArcadeSoundsProps) {
  const isSoundPlaying = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadTone().then(() => {
      setIsReady(true);
    });

    return () => {
      // Synth is now shared, so we don't dispose it here.
      // It can be disposed if the entire app is unmounted, but that's unlikely.
    };
  }, []);

  const playSound = useCallback((note: string, duration: string) => {
    if (!Tone || !synth || !isReady || isSoundPlaying.current || !isSoundEnabled) return;
    
    const T = Tone;
    
    if (T.context.state !== 'running') {
      T.context.resume().catch(e => console.error("Could not resume audio context", e));
    }
    
    isSoundPlaying.current = true;
    
    try {
        synth.triggerAttackRelease(note, duration, T.now());
    } catch(e) {
        console.error("Failed to play sound", e);
    }
    
    setTimeout(() => {
        isSoundPlaying.current = false;
    }, 50);
  }, [isReady, isSoundEnabled]);

  const playNavigate = useCallback(() => playSound('C3', '16n'), [playSound]);
  const playSelect = useCallback(() => playSound('G4', '8n'), [playSound]);
  const playBack = useCallback(() => playSound('C4', '8n'), [playSound]);
  const playStart = useCallback(() => playSound('C5', '8n'), [playSound]);

  return { isReady, playNavigate, playSelect, playBack, playStart };
}
