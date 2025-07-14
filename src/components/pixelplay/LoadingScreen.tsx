import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white animate-pixel-in">
        <div className="text-center">
            <p className="text-3xl font-headline text-accent animate-pulse">LOADING...</p>
        </div>
    </div>
  );
}

    