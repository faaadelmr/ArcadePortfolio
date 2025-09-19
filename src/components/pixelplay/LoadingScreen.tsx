import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';

export default function LoadingScreen() {
  const { t } = useLocalization();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 text-white animate-pixel-in">
        <div className="text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-headline text-accent animate-blink">{t('loading')}</p>
        </div>
    </div>
  );
}

    