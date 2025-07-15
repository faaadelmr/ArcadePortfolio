
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { Synth } from 'tone';

interface UseArcadeSoundsProps {
  volume?: number;
}

// This hook safely handles Tone.js which is a client-side library.
export default function useArcadeSounds({ volume = 0.5 }: UseArcadeSoundsProps) {
  const Tone = useRef<typeof import('tone') | null>(null);
  const synth = useRef<Synth | null>(null);
  const isSoundPlaying = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Dynamically import Tone.js only on the client side
    import('tone').then(T => {
      Tone.current = T;
      if (!synth.current) {
        // Create a synth and connect it to the main output
        synth.current = new T.Synth().toDestination();
        setIsReady(true);
      }
    });

    return () => {
      // Clean up synth on unmount
      if (synth.current) {
        synth.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (Tone.current && Tone.current.Destination) {
      // Convert linear volume (0-1) to dB. 0 is -Infinity, 1 is 0.
      const dbVolume = volume > 0 ? Tone.current.gainToDb(volume) : -Infinity;
      Tone.current.Destination.volume.value = dbVolume;
    }
  }, [volume]);

  const playSound = useCallback((note: string, duration: string) => {
    if (!Tone.current || !synth.current || !isReady || isSoundPlaying.current) return;
    
    const T = Tone.current;
    
    // Ensure the audio context is running
    if (T.context.state !== 'running') {
      T.context.resume().catch(e => console.error("Could not resume audio context", e));
    }
    
    isSoundPlaying.current = true;
    
    try {
        // Play the sound
        synth.current.triggerAttackRelease(note, duration, T.now());
    } catch(e) {
        console.error("Failed to play sound", e);
    }
    

    // Use a short timeout to unlock sound playing
    setTimeout(() => {
        isSoundPlaying.current = false;
    }, 50); // A 50ms buffer should be enough to prevent race conditions
  }, [isReady]);

  const playNavigate = useCallback(() => playSound('C3', '16n'), [playSound]);
  const playSelect = useCallback(() => playSound('G4', '8n'), [playSound]);
  const playBack = useCallback(() => playSound('C4', '8n'), [playSound]);
  const playStart = useCallback(() => playSound('C5', '8n'), [playSound]);

  return { isReady, playNavigate, playSelect, playBack, playStart };
}
