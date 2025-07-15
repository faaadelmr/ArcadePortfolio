
'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/hooks/useLocalization';

const backToMainEvent = new Event('backToMain', { bubbles: true });

export default function AboutMePage() {
  const { playBack, playNavigate } = useArcadeSounds();
  const { t } = useLocalization();
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
      <h1 className="text-3xl sm:text-5xl font-headline text-primary mb-4 sm:mb-8 text-center">{t('aboutMe.title')}</h1>
      <ScrollArea viewportRef={scrollViewportRef} className="flex-grow pr-4">
        <div className="space-y-4 text-base sm:text-lg text-gray-300">
            <p>
                {t('aboutMe.intro')}
            </p>
            <p>
                {t('aboutMe.journey')}
            </p>
            <h2 className="text-2xl font-headline text-accent pt-4">{t('aboutMe.philosophyTitle')}</h2>
            <p>
                {t('aboutMe.philosophy')}
            </p>
            <h2 className="text-2xl font-headline text-accent pt-4">{t('aboutMe.skillsTitle')}</h2>
            <ul className="list-disc list-inside space-y-2 pl-2 font-code">
                <li>{t('aboutMe.skills.frontend')}</li>
                <li>{t('aboutMe.skills.backend')}</li>
                <li>{t('aboutMe.skills.databases')}</li>
                <li>{t('aboutMe.skills.ai')}</li>
                <li>{t('aboutMe.skills.devops')}</li>
            </ul>
             <p className="pt-4">
                {t('aboutMe.thanks')}
            </p>
        </div>
      </ScrollArea>
      <div className="mt-4 sm:mt-8 text-center text-sm sm:text-lg text-gray-400 font-code">
        <p>{t('aboutMe.controls.scroll')}</p>
        <p>{t('aboutMe.controls.back')}</p>
      </div>
    </div>
  );
}
