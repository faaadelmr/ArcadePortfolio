
'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { ScrollArea } from '@/components/ui/scroll-area';

const backToMainEvent = new Event('backToMain', { bubbles: true });

export default function AboutMePage() {
  const { playBack, playNavigate } = useArcadeSounds();
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scrollingDirection, setScrollingDirection] = useState<'up' | 'down' | null>(null);

  const handleBack = useCallback(() => {
    playBack();
    window.dispatchEvent(backToMainEvent);
  }, [playBack]);

  const startScrolling = useCallback((direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) return;
    playNavigate();

    const scroll = () => {
      if (scrollViewportRef.current) {
        const scrollAmount = direction === 'up' ? -10 : 10;
        scrollViewportRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    };
    
    scroll(); // a single scroll on press
    scrollIntervalRef.current = setInterval(scroll, 50); // continuous scroll
  }, [playNavigate]);

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Prevent multiple triggers for held keys
      
      switch (e.key.toLowerCase()) {
        case 'b':
        case 'backspace':
        case 'escape':
          e.preventDefault();
          handleBack();
          break;
        case 'arrowup':
          e.preventDefault();
          setScrollingDirection('up');
          startScrolling('up');
          break;
        case 'arrowdown':
          e.preventDefault();
          setScrollingDirection('down');
          startScrolling('down');
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
          if (scrollingDirection === 'up') {
            e.preventDefault();
            stopScrolling();
            setScrollingDirection(null);
          }
          break;
        case 'arrowdown':
          if (scrollingDirection === 'down') {
            e.preventDefault();
            stopScrolling();
            setScrollingDirection(null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopScrolling(); // Cleanup on unmount
    };
  }, [handleBack, startScrolling, stopScrolling, scrollingDirection]);

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8 text-white animate-pixel-in">
      <h1 className="text-3xl sm:text-5xl font-headline text-primary mb-4 sm:mb-8 text-center">ABOUT ME</h1>
      <ScrollArea viewportRef={scrollViewportRef} className="flex-grow pr-4">
        <div className="space-y-4 text-base sm:text-lg text-gray-300">
            <p>
                Hello! I'm Fadel Muhamad Rifai, a passionate software engineer with a love for creating innovative and engaging digital experiences. 
                This retro arcade portfolio is a testament to my dedication to blending creative design with robust technical implementation.
            </p>
            <p>
                My journey into the world of programming started with a fascination for video games and evolved into a deep interest in web development, AI, and system architecture. I thrive on challenges and am constantly exploring new technologies to push the boundaries of what's possible.
            </p>
            <h2 className="text-2xl font-headline text-accent pt-4">My Philosophy</h2>
            <p>
                I believe that the best products are born from a combination of user-centric design, clean and efficient code, and a collaborative spirit. I strive to write code that is not only functional but also maintainable and scalable.
            </p>
            <h2 className="text-2xl font-headline text-accent pt-4">Skills & Expertise</h2>
            <ul className="list-disc list-inside space-y-2 pl-2 font-code">
                <li>Frontend: React, Next.js, TypeScript, TailwindCSS</li>
                <li>Backend: Node.js, Python, Go</li>
                <li>Databases: PostgreSQL, MongoDB, Firebase</li>
                <li>AI/ML: Genkit, TensorFlow, PyTorch</li>
                <li>DevOps: Docker, Kubernetes, CI/CD</li>
            </ul>
             <p className="pt-4">
                Thank you for visiting my arcade hub. Feel free to explore my projects and don't hesitate to reach out!
            </p>
        </div>
      </ScrollArea>
      <div className="mt-4 sm:mt-8 text-center text-sm sm:text-lg text-gray-400 font-code">
        <p>Hold [JOYSTICK] or [ARROW KEYS] to scroll.</p>
        <p>[B] or [ESC] to go back to Main Menu.</p>
      </div>
    </div>
  );
}
