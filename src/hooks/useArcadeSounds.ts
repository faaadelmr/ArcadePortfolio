'use client';

import { useEffect, useRef } from 'react';
import type { Synth } from 'tone';

// This hook safely handles Tone.js which is a client-side library.
export default function useArcadeSounds() {
  const Tone = useRef<typeof import('tone') | null>(null);
  const synth = useRef<Synth | null>(null);

  useEffect(() => {
    // Dynamically import Tone.js only on the client side
    import('tone').then(T => {
      Tone.current = T;
      if (!synth.current) {
        // Create a synth and connect it to the main output
        synth.current = new T.Synth().toDestination();
      }
    });

    return () => {
      // Clean up synth on unmount
      if (synth.current) {
        synth.current.dispose();
      }
    };
  }, []);

  const playSound = (note: string, duration: string) => {
    // Ensure the audio context is running
    if (Tone.current && Tone.current.context.state !== 'running') {
      Tone.current.context.resume().catch(e => console.error("Could not resume audio context", e));
    }
    // Play the sound
    synth.current?.triggerAttackRelease(note, duration);
  };

  const playNavigate = () => playSound('C3', '16n');
  const playSelect = () => playSound('G4', '8n');
  const playBack = () => playSound('C4', '8n');
  const playStart = () => playSound('C5', '8n');

  return { playNavigate, playSelect, playBack, playStart };
}
