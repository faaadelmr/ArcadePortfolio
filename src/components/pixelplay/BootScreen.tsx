
'use client';

import React, { useState, useEffect } from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { PadelNesBackground } from './PadelNesBackground';

export default function BootScreen() {
  const { t } = useLocalization();
  const [typedText, setTypedText] = useState('#Coba');
  const words = ['AjaDulu', 'Lagi', 'AjaDulu', 'Mulai', 'AjaDulu', 'Berani', 'AjaDulu', 'Gagal', 'AjaDulu', 'in Nakama'];

  useEffect(() => {
    let wordIndex = 0;
    let isDeleting = false;
    let currentWord = '';
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      const fullWord = words[wordIndex];
      
      if (isDeleting) {
        currentWord = fullWord.substring(0, currentWord.length - 1);
      } else {
        currentWord = fullWord.substring(0, currentWord.length + 1);
      }
      
      setTypedText(`#Coba${currentWord}`);
      
      let typeSpeed = isDeleting ? 100 : 150;

      if (!isDeleting && currentWord === fullWord) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && currentWord === '') {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500; // Pause before new word
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    type();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 text-white animate-pixel-in relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <PadelNesBackground />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-headline text-primary mb-4 sm:mb-6" style={{textShadow: '0 0 10px hsl(var(--primary))'}}>{t('bootScreen.title')}</h1>
            <div className="text-center">
                <p className="text-lg sm:text-xl md:text-2xl font-headline text-accent animate-blink">{t('bootScreen.pressStart')}</p>
            </div>
            <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-400 font-code">
                <p>&copy; {new Date().getFullYear()} faaadelmr <br />
                  <span className="animated-highlight-text text-white">{typedText}</span>
                </p>
            </div>
        </div>
    </div>
  );
}
