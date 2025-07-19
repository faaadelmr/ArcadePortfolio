
import React from 'react';

export const TrophyRoomNesBackground = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 256 240"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
    style={{ imageRendering: 'pixelated', backgroundColor: 'hsl(var(--background))' }}
  >
    {/* Wall */}
    <rect x="0" y="0" width="256" height="240" fill="hsl(var(--secondary) / 0.5)" />

    {/* Spotlight effect */}
    <defs>
        <radialGradient id="spotlight" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor="hsl(var(--accent) / 0.2)" />
            <stop offset="100%" stopColor="hsl(var(--accent) / 0)" />
        </radialGradient>
    </defs>
    <rect x="0" y="0" width="256" height="240" fill="url(#spotlight)" />

    {/* Big Trophy */}
    <g transform="translate(88, 40)">
        {/* Base */}
        <rect x="4" y="150" width="64" height="10" fill="hsl(var(--primary) / 0.8)" />
        <rect x="12" y="140" width="48" height="10" fill="hsl(var(--primary) / 0.9)" />
        
        {/* Stem */}
        <rect x="32" y="110" width="16" height="30" fill="hsl(var(--accent))" />
        <rect x="28" y="100" width="24" height="10" fill="hsl(var(--accent) / 0.9)" />

        {/* Cup Body */}
        <path d="M 12 100 L 12 40 Q 40 30 68 40 L 68 100 Z" fill="hsl(var(--accent))" />
        
        {/* Cup Rim */}
        <path d="M 8 40 Q 40 25 72 40 L 68 45 Q 40 35 12 45 Z" fill="hsl(var(--accent-foreground) / 0.3)" />

        {/* Handles */}
        <path d="M 4 70 Q -10 50 12 50 L 12 60 Q -2 55 4 65 Z" fill="hsl(var(--accent))" />
        <path d="M 76 70 Q 90 50 68 50 L 68 60 Q 82 55 76 65 Z" fill="hsl(var(--accent))" />

        {/* Shine/Highlight */}
        <rect x="18" y="48" width="4" height="40" fill="hsl(var(--accent-foreground) / 0.2)" />
    </g>
  </svg>
);
