import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';
import { PadelNesBackground } from './PadelNesBackground';

export default function BootScreen() {
  const { t } = useLocalization();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white animate-pixel-in relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <PadelNesBackground />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-headline text-primary mb-12" style={{textShadow: '0 0 10px hsl(var(--primary))'}}>{t('bootScreen.title')}</h1>
            <div className="text-center">
                <p className="text-3xl font-headline text-accent animate-pulse">{t('bootScreen.pressStart')}</p>
            </div>
            <div className="mt-16 text-center text-lg text-gray-400 font-code">
                <p>&copy; {new Date().getFullYear()} faaadelmr</p>
            </div>
        </div>
    </div>
  );
}
