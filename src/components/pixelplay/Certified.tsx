
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
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

// 3D Card Component with hover effect
function CertCard({
  cert,
  index,
  isSelected,
  onClick,
  onHover,
  cardRef
}: {
  cert: Certification;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onHover: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!innerRef.current) return;

    const rect = innerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    onHover();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative cursor-pointer select-none transition-all duration-300",
        "group perspective-[1000px]",
        isSelected && "z-10"
      )}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative rounded-lg overflow-hidden border-2 transition-all duration-200",
          "transform-gpu",
          isSelected
            ? "border-accent shadow-[0_0_20px_rgba(74,222,128,0.5)] scale-105"
            : "border-primary/30 hover:border-primary/60",
          isHovering && "shadow-xl"
        )}
        style={{
          transform: isHovering
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.02)`
            : 'rotateX(0) rotateY(0) scale(1)',
          transformStyle: 'preserve-3d',
          transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
        }}
      >
        {/* Card Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-black/50">
          <Image
            src={cert.imageUrl}
            alt={cert.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            quality={75}
            sizes="(max-width: 400px) 45vw, (max-width: 600px) 30vw, 25vw"
          />
          {/* Shine effect on hover */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "pointer-events-none"
            )}
            style={{
              transform: `translateX(${rotation.y * 10}%) translateY(${rotation.x * 10}%)`,
            }}
          />
        </div>

        {/* Card Footer */}
        <div className="p-1.5 sm:p-2 bg-gradient-to-t from-black/90 to-black/60">
          <h3 className={cn(
            "text-[10px] sm:text-xs font-headline truncate transition-colors",
            isSelected ? "text-accent" : "text-white"
          )}>
            {cert.title}
          </h3>
          <p className="text-[8px] sm:text-[10px] text-gray-400 truncate">{cert.issuer}</p>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-1 right-1 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
        )}
      </div>
    </div>
  );
}

export default function Certified() {
  const [selectedItem, setSelectedItem] = useState(0);
  const [viewingCertIndex, setViewingCertIndex] = useState<number | null>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    } catch (e) {
      console.error("Could not parse certifications data from localization file.", e);
      return [];
    }

    return parsedCerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [t]);

  // Initialize card refs array
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, certifications.length);
  }, [certifications.length]);

  // Grid navigation - calculate columns based on container width
  const getColumnsCount = useCallback(() => {
    if (!cardContainerRef.current) return 2;
    const width = cardContainerRef.current.offsetWidth;
    if (width < 300) return 2;
    return 3; // Always 3 columns for sm and above (matching grid-cols-2 sm:grid-cols-3)
  }, []);

  const handleNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (viewingCertIndex !== null) return;
    playNavigate();

    const cols = getColumnsCount();

    setSelectedItem(prev => {
      let newIndex = prev;
      switch (direction) {
        case 'up':
          newIndex = prev - cols;
          if (newIndex < 0) newIndex = prev; // Stay in place if at top
          break;
        case 'down':
          newIndex = prev + cols;
          if (newIndex >= certifications.length) newIndex = prev; // Stay if at bottom
          break;
        case 'left':
          newIndex = prev - 1;
          if (newIndex < 0) newIndex = certifications.length - 1;
          break;
        case 'right':
          newIndex = prev + 1;
          if (newIndex >= certifications.length) newIndex = 0;
          break;
      }
      return newIndex;
    });
  }, [viewingCertIndex, playNavigate, certifications.length, getColumnsCount]);

  // Scroll selected card into view
  useEffect(() => {
    if (viewingCertIndex === null && cardRefs.current[selectedItem]) {
      cardRefs.current[selectedItem]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [selectedItem, viewingCertIndex]);

  const handleSelectCert = useCallback((index?: number) => {
    const targetIndex = index !== undefined ? index : selectedItem;
    if (viewingCertIndex !== null) return;
    playSelect();
    setViewingCertIndex(targetIndex);
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

  const handleCertClick = useCallback((index: number) => {
    setSelectedItem(index);
    handleSelectCert(index);
  }, [handleSelectCert]);

  const handleCertHover = useCallback((index: number) => {
    if (index !== selectedItem) {
      playNavigate();
      setSelectedItem(index);
    }
  }, [selectedItem, playNavigate]);

  const startScrolling = useCallback((direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) return;
    if (viewingCertIndex === null) return;
    playNavigate();

    const scroll = () => {
      if (scrollViewportRef.current) {
        const scrollAmount = direction === 'up' ? -15 : 15;
        scrollViewportRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      }
    };

    scroll();
    scrollIntervalRef.current = setInterval(scroll, 50);
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
          case 'arrowleft':
            e.preventDefault();
            handleNavigation('left');
            break;
          case 'arrowright':
            e.preventDefault();
            handleNavigation('right');
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

  // Full view modal
  if (cert) {
    const title = cert.title;
    return (
      <div className="w-full h-full flex flex-col p-1 sm:p-2 text-white animate-pixel-in relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <TrophyRoomNesBackground />
        </div>
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center mb-1 sm:mb-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="mr-1 sm:mr-2 text-accent ring-2 ring-accent bg-accent/20 focus:outline-none cursor-pointer h-6 w-6 sm:h-8 sm:w-8"
              onClick={handleBackToList}
              aria-label={t('controls.bBack')}
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <div className='flex-1 truncate'>
              <h1 className="text-sm sm:text-base font-headline text-primary truncate">{title}</h1>
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">{cert.issuer} • {cert.date}</p>
            </div>
          </div>

          {/* Full Certificate Image */}
          <ScrollArea viewportRef={scrollViewportRef} className="flex-1 min-h-0">
            <div className="flex items-center justify-center p-1">
              <Image
                src={cert.imageUrl}
                alt={`${t('certifications.alt')} ${title}`}
                width={800}
                height={600}
                className="rounded-md border-2 border-accent/50 object-contain max-w-full h-auto shadow-lg"
                loading="eager"
                quality={90}
              />
            </div>
          </ScrollArea>

          {/* Controls hint */}
          <div className="mt-1 text-center text-[10px] text-gray-500 font-code flex-shrink-0">
            <p>{t('certifications.controls.scroll')} • {t('certifications.controls.backToList')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Card Gallery View
  return (
    <div className="w-full h-full flex flex-col p-1 sm:p-2 text-white relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <TrophyRoomNesBackground />
      </div>
      <div className="relative z-10 flex flex-col h-full">
        {/* Title */}
        <h1 className="text-sm sm:text-base font-headline text-primary mb-2 text-center flex-shrink-0">
          {t('certifications.title')}
        </h1>

        {/* Card Grid Gallery */}
        <ScrollArea className="flex-1 min-h-0">
          <div
            ref={cardContainerRef}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 p-1"
          >
            {certifications.map((cert, index) => {
              // Create a ref for this card
              if (!cardRefs.current[index]) {
                cardRefs.current[index] = null;
              }
              const cardRef = {
                current: cardRefs.current[index]
              } as React.RefObject<HTMLDivElement>;

              return (
                <div
                  key={index}
                  ref={(el) => { cardRefs.current[index] = el; }}
                >
                  <CertCard
                    cert={cert}
                    index={index}
                    isSelected={selectedItem === index}
                    onClick={() => handleCertClick(index)}
                    onHover={() => handleCertHover(index)}
                    cardRef={cardRef}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Controls hint */}
        <div className="mt-1 text-center text-[10px] text-gray-500 font-code flex-shrink-0">
          <p>↑↓←→ {t('certifications.controls.navigate')} • A {t('certifications.controls.backToMain')}</p>
        </div>
      </div>
    </div>
  );
}
