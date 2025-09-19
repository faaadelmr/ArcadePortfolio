
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { useLocalization } from '@/hooks/useLocalization';
import { TrophyRoomNesBackground } from './TrophyRoomNesBackground';

const backToMainEvent = new Event('backToMain', { bubbles: true });

interface Certification {
    title: string;
    issuer: string;
    date: string;
    imageUrl: string;
}

export default function Certified() {
  const [selectedItem, setSelectedItem] = useState(0);
  const [viewingCertIndex, setViewingCertIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const { playNavigate, playSelect, playBack } = useArcadeSounds();
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scrollingDirection, setScrollingDirection] = useState<'up' | 'down' | null>(null);
  const { t } = useLocalization();
  
  const certifications: Certification[] = useMemo(() => {
    const certsData = t('certifications.list');
    let parsedCerts: Certification[] = [];
    try {
        if (typeof certsData === 'string' && certsData.startsWith('[')) {
             parsedCerts = JSON.parse(certsData);
        } else if (Array.isArray(certsData)) {
            parsedCerts = certsData;
        }
    } catch(e) {
        console.error("Could not parse certifications data from localization file.", e);
        return [];
    }
    
    return parsedCerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
      <div className="w-full h-full flex flex-col p-1 sm:p-2 md:p-3 text-white animate-pixel-in relative">
        <div className="absolute inset-0 z-0 opacity-20">
            <TrophyRoomNesBackground />
        </div>
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center mb-1 sm:mb-2 md:mb-3 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-1 sm:mr-2 md:mr-3 text-accent ring-2 ring-accent bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent" 
              onClick={handleBackToList}
              aria-label={t('controls.bBack')}
            >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Button>
            <div className='truncate'>
                <h1 className="text-base sm:text-lg md:text-xl font-headline text-primary truncate">{title}</h1>
                <p className="text-xs sm:text-sm text-gray-300 truncate">{cert.issuer}</p>
            </div>
            </div>
            <ScrollArea viewportRef={scrollViewportRef} className="flex-grow pr-1 sm:pr-2">
                <Image 
                    src={cert.imageUrl}
                    alt={`${t('certifications.alt')} ${title}`}
                    width={800}
                    height={600}
                    className="rounded-md border border-primary/50 object-contain w-full h-auto"
                    loading="lazy"
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                />
            </ScrollArea>
            <div className="mt-1 sm:mt-2 text-center text-xs text-gray-400 font-code flex-shrink-0">
            <p>{t('certifications.controls.scroll')}</p>
            <p>{t('certifications.controls.backToList')}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-1 sm:p-2 md:p-3 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
            <TrophyRoomNesBackground />
        </div>
        <div className="relative z-10 flex flex-col h-full">
            <h1 className="text-lg sm:text-xl md:text-2xl font-headline text-primary mb-1 sm:mb-2 md:mb-3 text-center">{t('certifications.title')}</h1>
            <ScrollArea className="flex-grow pr-1 sm:pr-2">
                <ul className="space-y-1 sm:space-y-2">
                {certifications.map((cert, index) => (
                    <li 
                    key={index}
                    ref={el => { if(el) itemRefs.current[index] = el; }}
                    className={cn(
                        "p-1 sm:p-2 border-l-2 rounded-r transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent",
                        selectedItem === index 
                        ? "border-accent bg-primary/20" 
                        : "border-gray-700"
                    )}
                    role="option"
                    aria-selected={selectedItem === index}
                    tabIndex={-1}
                    >
                    <h2 className={cn(
                        "text-xs sm:text-sm md:text-base font-headline truncate",
                        selectedItem === index ? 'text-accent' : 'text-white'
                    )}>
                        {cert.title}
                    </h2>
                    <p className="text-xs text-gray-300">{cert.issuer}</p>
                    <p className="text-xs font-code text-primary/80 mt-1">{cert.date}</p>
                    </li>
                ))}
                </ul>
            </ScrollArea>
            <div className="mt-1 sm:mt-2 text-center text-xs text-gray-400 font-code">
                <p>{t('certifications.controls.navigate')}</p>
                <p>{t('certifications.controls.backToMain')}</p>
            </div>
        </div>
    </div>
  );
}
