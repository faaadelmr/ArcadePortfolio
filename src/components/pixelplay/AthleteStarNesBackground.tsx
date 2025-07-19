import React from 'react';

export const AthleteStarNesBackground = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 256 240"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
    style={{ imageRendering: 'pixelated', backgroundColor: 'hsl(var(--background))' }}
  >
    <defs>
      <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Background stars */}
    <g fill="hsl(var(--foreground) / 0.5)">
      <rect x="30" y="40" width="2" height="2" />
      <rect x="200" y="60" width="2" height="2" />
      <rect x="80" y="20" width="2" height="2" />
      <rect x="150" y="150" width="2" height="2" />
      <rect x="50" y="180" width="2" height="2" />
      <rect x="220" y="120" width="2" height="2" />
    </g>

    {/* Podium */}
    <g fill="hsl(var(--primary) / 0.6)" stroke="hsl(var(--primary))" strokeWidth="1">
      {/* 2nd place */}
      <rect x="40" y="180" width="60" height="60" />
      {/* 1st place */}
      <rect x="100" y="150" width="56" height="90" />
      {/* 3rd place */}
      <rect x="156" y="190" width="60" height="50" />
    </g>

    {/* Athlete */}
    <g transform="translate(118, 100)">
      {/* Head */}
      <rect x="0" y="0" width="8" height="8" fill="hsl(var(--accent))" />
      {/* Body */}
      <rect x="-2" y="8" width="12" height="14" fill="hsl(var(--accent))" />
      {/* Legs */}
      <rect x="0" y="22" width="4" height="10" fill="hsl(var(--accent) / 0.8)" />
      <rect x="4" y="22" width="4" height="10" fill="hsl(var(--accent) / 0.8)" />
      {/* Arm and Racket */}
      <g transform="rotate(20 4 10)">
         <rect x="10" y="8" width="18" height="4" fill="hsl(var(--foreground))" />
         <rect x="26" y="6" width="6" height="8" fill="hsl(var(--foreground) / 0.8)" />
      </g>
    </g>

    {/* Big Star */}
    <g transform="translate(122 50)" fill="yellow" filter="url(#star-glow)">
      <path d="M10 0 L13 6 L19 7 L14.5 11.5 L16 18 L10 15 L4 18 L5.5 11.5 L1 7 L7 6 Z" />
    </g>
  </svg>
);
