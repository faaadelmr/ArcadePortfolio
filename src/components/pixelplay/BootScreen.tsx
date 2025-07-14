import React from 'react';

export default function BootScreen() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white animate-pixel-in">
        <h1 className="text-4xl font-headline text-primary mb-12" style={{textShadow: '0 0 10px hsl(var(--primary))'}}>FADEL MUHAMAD RIFAI</h1>
        <div className="text-center">
            <p className="text-3xl font-headline text-accent animate-pulse">PRESS START</p>
        </div>
        <div className="mt-16 text-center text-lg text-gray-400 font-code">
            <p>&copy; {new Date().getFullYear()} FADEL MUHAMAD RIFAI. ALL RIGHTS RESERVED.</p>
        </div>
    </div>
  );
}

    