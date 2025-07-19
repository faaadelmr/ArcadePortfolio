
'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/hooks/useLocalization';
import { AthleteStarNesBackground } from './AthleteStarNesBackground';
import ContactForm from './ContactForm';
import { cn } from '@/lib/utils';

const backToMainEvent = new Event('backToMain', { bubbles: true });

type AboutTab = 'bio' | 'contact';

export default function AboutMePage() {
  const { playBack, playNavigate, playSelect, playStart } = useArcadeSounds();
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<AboutTab>('bio');
  const [selectedItem, setSelectedItem] = useState(0); // 0 for bio, 1 for contact
  
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scrollingDirection, setScrollingDirection] = useState<'up' | 'down' | null>(null);

  const handleBack = useCallback(() => {
    if (activeTab === 'bio') {
      playBack();
      window.dispatchEvent(backToMainEvent);
    }
    // If on contact tab, do nothing to allow backspace in form fields
  }, [playBack, activeTab]);

  const handleTabSwitch = useCallback(() => {
      playStart();
      setSelectedItem(prev => (prev + 1) % 2);
      setActiveTab(prev => prev === 'bio' ? 'contact' : 'bio');
  }, [playStart]);

  const startScrolling = useCallback((direction: 'up' | 'down') => {
    if (activeTab !== 'bio') return;
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
  }, [playNavigate, activeTab]);

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === 'contact' && ['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.repeat) return;
      
      switch (e.key.toLowerCase()) {
        case 'b':
        case 'backspace':
        case 'escape':
          if (activeTab === 'bio') {
            e.preventDefault();
            handleBack();
          }
          break;
        case 'arrowup':
           if (activeTab === 'bio') {
             e.preventDefault();
             setScrollingDirection('up');
             startScrolling('up');
           }
           break;
        case 'arrowdown':
           if (activeTab === 'bio') {
             e.preventDefault();
             setScrollingDirection('down');
             startScrolling('down');
           }
           break;
        case 's':
        case 'enter': // Also allow enter to switch tabs
            e.preventDefault();
            handleTabSwitch();
            break;
        case 'a':
          if (activeTab === 'bio') {
             playSelect();
             // Maybe do something on select in bio later?
          }
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (activeTab === 'bio') {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopScrolling();
    };
  }, [handleBack, startScrolling, stopScrolling, scrollingDirection, activeTab, handleTabSwitch, playSelect]);

  const tabs = [
    { id: 'bio', label: t('aboutMe.tabs.bio') },
    { id: 'contact', label: t('aboutMe.tabs.contact') }
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8 text-white animate-pixel-in relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <AthleteStarNesBackground />
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <h1 className="text-3xl sm:text-5xl font-headline text-primary mb-4 text-center">{t('aboutMe.title')}</h1>
        
        <div className="flex justify-center mb-4 border-b-2 border-primary/30">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => {
                playNavigate();
                setSelectedItem(index);
                setActiveTab(tab.id as AboutTab);
              }}
              className={cn(
                "px-4 py-2 font-headline text-lg transition-colors",
                selectedItem === index ? "text-accent border-b-2 border-accent" : "text-gray-500"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-grow overflow-hidden">
          {activeTab === 'bio' && (
             <ScrollArea viewportRef={scrollViewportRef} className="h-full pr-4">
              <div className="space-y-4 text-base sm:text-lg text-gray-300">
                  <p>
                      {t('aboutMe.intro')}
                  </p>
                  <p>
                      {t('aboutMe.journey')}
                  </p>
                  <p className='font-italic font-code'>
                      "{t('aboutMe.philosophy')}"
                  </p>
                  <p className="pt-4">
                      {t('aboutMe.thanks')}
                  </p>
              </div>
            </ScrollArea>
          )}
          {activeTab === 'contact' && (
            <ContactForm />
          )}
        </div>
        
        <div className="mt-4 sm:mt-6 text-center text-sm sm:text-base text-gray-400 font-code">
          <p>{t('aboutMe.controls.navigateTabs')}</p>
          {activeTab === 'bio' ? (
              <p>{t('aboutMe.controls.scroll')}</p>
          ) : (
             <p>{t('aboutMe.controls.form')}</p>
          )}
          <p>{t('aboutMe.controls.back')}</p>
        </div>
      </div>
    </div>
  );
}
