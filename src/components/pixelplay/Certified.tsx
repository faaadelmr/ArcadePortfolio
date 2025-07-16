
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { useLocalization } from '@/hooks/useLocalization';

const backToMainEvent = new Event('backToMain', { bubbles: true });

export default function Certified() {
  const [selectedItem, setSelectedItem] = useState(0);
  const [viewingCertIndex, setViewingCertIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const { playNavigate, playSelect, playBack } = useArcadeSounds();
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scrollingDirection, setScrollingDirection] = useState<'up' | 'down' | null>(null);
  const { t } = useLocalization();
  
  // All certification data is now loaded from the localization file.
  const certifications = useMemo(() => {
    const certsData = t('certifications.list');
    // The translation key returns a string, so we parse it.
    // A bit of a hack, but it centralizes data management in the JSON file.
    try {
        if (typeof certsData === 'string' && certsData.startsWith('[')) {
             return JSON.parse(certsData);
        }
        return Array.isArray(certsData) ? certsData : [];
    } catch(e) {
        console.error("Could not parse certifications data from localization file.", e);
        return [];
    }
  }, [t]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, certifications.length);
  }, [certifications.length]);

  useEffect(() => {
    if (viewingCertIndex === null && itemRefs.current[selectedItem]) {
      itemRefs.current[selectedItem]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedItem, viewingCertIndex]);
  
  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    if (viewingCertIndex !== null) return;
    playNavigate();
    setSelectedItem(prev => {
      const newIndex = direction === 'up' ? prev - 1 : prev + 1;
      return (newIndex + certifications.length) % certifications.length;
    });
  }, [playNavigate, viewingCertIndex, certifications.length]);

  const handleSelectCert = useCallback(() => {
    if (viewingCertIndex !== null) return;
    playSelect();
    setViewingCertIndex(selectedItem);
  }, [playSelect, selectedItem, viewingCertIndex]);

  const handleBackToList = useCallback(() => {
    playBack();
    setViewingCertIndex(null);
  }, [playBack]);

  const handleBackToMain = useCallback(() => {
    if (viewingCertIndex !== null) {
        handleBackToList();
    } else {
        playBack();
        window.dispatchEvent(backToMainEvent);
    }
  }, [playBack, viewingCertIndex, handleBackToList]);
  
  const startScrolling = useCallback((direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) return;
    if (viewingCertIndex === null) return;
    playNavigate();
    
    const scroll = () => {
        if (scrollViewportRef.current) {
            const scrollAmount = direction === 'up' ? -10 : 10;
            scrollViewportRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
    };
    
    scroll(); // a single scroll on press
    scrollIntervalRef.current = setInterval(scroll, 50); // continuous scroll
  }, [playNavigate, viewingCertIndex]);

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;

        if (viewingCertIndex !== null) {
            switch (e.key.toLowerCase()) {
                case 'b':
                case 'escape':
                    e.preventDefault();
                    handleBackToList();
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
        } else {
            switch (e.key.toLowerCase()) {
                case 'arrowup':
                    e.preventDefault();
                    handleNavigation('up');
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    handleNavigation('down');
                    break;
                case 'a':
                case 'enter':
                    e.preventDefault();
                    handleSelectCert();
                    break;
                case 'b':
                case 'escape':
                    e.preventDefault();
                    handleBackToMain();
                    break;
            }
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (viewingCertIndex === null) return;
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
        stopScrolling();
    }
  }, [handleNavigation, handleSelectCert, handleBackToMain, handleBackToList, startScrolling, stopScrolling, viewingCertIndex, scrollingDirection]);

  const cert = viewingCertIndex !== null ? certifications[viewingCertIndex] : null;

  if (cert) {
    const title = cert.title;
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-6 text-white animate-pixel-in">
        <div className="flex items-center mb-4 flex-shrink-0">
          <Button variant="ghost" size="icon" className="mr-4 text-accent ring-2 ring-accent bg-accent/20" onClick={handleBackToList}>
            <ArrowLeft />
          </Button>
          <div className='truncate'>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-headline text-primary truncate">{title}</h1>
            <p className="text-sm sm:text-base text-gray-300 truncate">{cert.issuer}</p>
          </div>
        </div>
        <ScrollArea viewportRef={scrollViewportRef} className="flex-grow pr-2">
            <Image 
                src={cert.imageUrl}
                alt={`${t('certifications.alt')} ${title}`}
                width={800}
                height={600}
                className="rounded-lg border-2 border-primary/50 object-contain w-full h-auto"
            />
        </ScrollArea>
        <div className="mt-4 text-center text-sm sm:text-lg text-gray-400 font-code flex-shrink-0">
          <p>{t('certifications.controls.scroll')}</p>
          <p>{t('certifications.controls.backToList')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8 text-white">
      <h1 className="text-3xl sm:text-5xl font-headline text-primary mb-4 sm:mb-8 text-center">{t('certifications.title')}</h1>
      <ScrollArea className="flex-grow pr-4">
        <ul className="space-y-4">
          {certifications.map((cert, index) => (
            <li 
              key={index}
              ref={el => { if(el) itemRefs.current[index] = el; }}
              className={cn(
                "p-4 border-l-4 rounded-r-lg transition-all duration-200",
                selectedItem === index 
                  ? "border-accent bg-primary/20" 
                  : "border-gray-700"
              )}
            >
              <h2 className={cn(
                  "text-xl sm:text-2xl font-headline truncate",
                  selectedItem === index ? 'text-accent' : 'text-white'
              )}>
                {cert.title}
              </h2>
              <p className="text-base sm:text-lg text-gray-300">{cert.issuer}</p>
              <p className="text-sm font-code text-primary/80 mt-1">{cert.date}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="mt-4 sm:mt-8 text-center text-sm sm:text-lg text-gray-400 font-code">
        <p>{t('certifications.controls.navigate')}</p>
        <p>{t('certifications.controls.backToMain')}</p>
      </div>
    </div>
  );
}
