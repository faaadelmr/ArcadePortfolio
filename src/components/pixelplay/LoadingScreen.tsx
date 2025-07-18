import React from 'react';
import { useLocalization } from '@/hooks/useLocalization';

export default function LoadingScreen() {
  const { t } = useLocalization();
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white animate-pixel-in">
        <div className="text-center">
            <p className="text-3xl font-headline text-accent animate-pulse">Loading..</p>
        </div>
    </div>
  );
}

    