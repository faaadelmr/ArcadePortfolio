
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import useArcadeSounds from '@/hooks/useArcadeSounds';

const backToMainEvent = new Event('backToMain', { bubbles: true });

const certifications = [
  {
    title: 'CS50’s Introduction to Computer Science',
    issuer: 'Harvard University',
    date: '2022-12-31',
    imageUrl: 'https://placehold.co/800x600',
    imageHint: 'certificate document',
  },
  {
    title: 'CS50’s Web Programming with Python and JavaScript',
    issuer: 'Harvard University',
    date: '2023-01-20',
    imageUrl: 'https://placehold.co/800x600',
    imageHint: 'certificate document',
  },
  {
    title: 'CS50’s Introduction to Artificial Intelligence with Python',
    issuer: 'Harvard University',
    date: '2023-01-20',
    imageUrl: 'https://placehold.co/800x600',
    imageHint: 'certificate document',
  },
  {
    title: 'CS50’s Introduction to Game Development',
    issuer: 'Harvard University',
    date: '2023-01-20',
    imageUrl: 'https://placehold.co/800x600',
    imageHint: 'certificate document',
  },
  {
    title: 'CS50’s Introduction to Programming with Python',
    issuer: 'Harvard University',
    date: '2023-01-20',
    imageUrl: 'https://placehold.co/800x600',
    imageHint: 'certificate document',
  },
  {
    title: 'Software Engineer',
    issuer: 'Hacktiv8 Indonesia',
    date: '2023-01-20',
    imageUrl: 'https://placehold.co/800x600',
    imageHint: 'certificate document',
  },
];

export default function Certified() {
  const [selectedItem, setSelectedItem] = useState(0);
  const [viewingCertIndex, setViewingCertIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const { playNavigate, playSelect, playBack } = useArcadeSounds();

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, certifications.length);
  }, []);

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
  }, [playNavigate, viewingCertIndex]);

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
  
  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (viewingCertIndex !== null && scrollViewportRef.current) {
        playNavigate();
        const scrollAmount = direction === 'up' ? -100 : 100;
        scrollViewportRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  }, [viewingCertIndex, playNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        let keyHandled = false;
        if (viewingCertIndex !== null) {
            switch (e.key.toLowerCase()) {
                case 'b':
                case 'escape':
                    handleBackToList();
                    keyHandled = true;
                    break;
                case 'arrowup':
                    handleScroll('up');
                    keyHandled = true;
                    break;
                case 'arrowdown':
                    handleScroll('down');
                    keyHandled = true;
                    break;
            }
        } else {
            switch (e.key.toLowerCase()) {
                case 'arrowup':
                    handleNavigation('up');
                    keyHandled = true;
                    break;
                case 'arrowdown':
                    handleNavigation('down');
                    keyHandled = true;
                    break;
                case 'a':
                case 'enter':
                    handleSelectCert();
                    keyHandled = true;
                    break;
                case 'b':
                case 'escape':
                    handleBackToMain();
                    keyHandled = true;
                    break;
            }
        }
        if (keyHandled) {
          e.preventDefault();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigation, handleSelectCert, handleBackToMain, handleBackToList, handleScroll, viewingCertIndex]);

  const cert = viewingCertIndex !== null ? certifications[viewingCertIndex] : null;

  if (cert) {
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-6 text-white animate-pixel-in">
        <div className="flex items-center mb-4 flex-shrink-0">
          <Button variant="ghost" size="icon" className="mr-4 text-accent ring-2 ring-accent bg-accent/20" onClick={handleBackToList}>
            <ArrowLeft />
          </Button>
          <div className='truncate'>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-headline text-primary truncate">{cert.title}</h1>
            <p className="text-sm sm:text-base text-gray-300 truncate">{cert.issuer}</p>
          </div>
        </div>
        <ScrollArea viewportRef={scrollViewportRef} className="flex-grow pr-2">
            <Image 
                src={cert.imageUrl}
                alt={`Certificate for ${cert.title}`}
                width={800}
                height={600}
                className="rounded-lg border-2 border-primary/50 object-contain w-full h-auto"
                data-ai-hint={cert.imageHint}
            />
        </ScrollArea>
        <div className="mt-4 text-center text-sm sm:text-lg text-gray-400 font-code flex-shrink-0">
          <p>Use [JOYSTICK] or [ARROW KEYS] to scroll.</p>
          <p>[B] or [ESC] to go back to list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8 text-white">
      <h1 className="text-3xl sm:text-5xl font-headline text-primary mb-4 sm:mb-8 text-center">CERTIFICATIONS</h1>
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
        <p>Use [ARROW KEYS] or [JOYSTICK] to navigate. [A] to view.</p>
        <p>[B] or [ESC] to go back to Main Menu.</p>
      </div>
    </div>
  );
}
