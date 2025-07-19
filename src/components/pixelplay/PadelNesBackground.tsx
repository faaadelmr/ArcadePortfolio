import React from 'react';

export const PadelNesBackground = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 256 240"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
    style={{ imageRendering: 'pixelated', backgroundColor: 'hsl(var(--background))' }}
  >
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Court */}
    <rect x="10" y="50" width="236" height="140" fill="hsl(var(--primary) / 0.3)" />
    <rect x="10" y="50" width="236" height="140" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
    
    {/* Net */}
    <rect x="127" y="50" width="2" height="140" fill="hsl(var(--foreground) / 0.5)" />
    <rect x="127" y="50" width="2" height="8" fill="hsl(var(--foreground))" />
     <rect x="127" y="182" width="2" height="8" fill="hsl(var(--foreground))" />

    {/* Court Lines */}
    <line x1="10" y1="120" x2="127" y2="120" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4 2"/>
    <line x1="129" y1="120" x2="246" y2="120" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4 2"/>


    {/* Player 1 (Left) */}
    <g transform="translate(60, 110)">
      {/* Head */}
      <rect x="0" y="0" width="8" height="8" fill="hsl(var(--accent))" />
      {/* Body */}
      <rect x="-2" y="8" width="12" height="14" fill="hsl(var(--accent))" />
      {/* Legs */}
      <rect x="0" y="22" width="4" height="10" fill="hsl(var(--accent) / 0.8)" />
      <rect x="4" y="22" width="4" height="10" fill="hsl(var(--accent) / 0.8)" />
      {/* Racket */}
      <rect x="10" y="10" width="12" height="4" fill="hsl(var(--foreground))" />
       <rect x="20" y="8" width="6" height="8" fill="hsl(var(--foreground))" />
    </g>

    {/* Player 2 (Right) */}
     <g transform="translate(180, 90)">
      {/* Head */}
      <rect x="0" y="0" width="8" height="8" fill="hsl(var(--destructive))" />
      {/* Body */}
      <rect x="-2" y="8" width="12" height="14" fill="hsl(var(--destructive))" />
      {/* Legs */}
      <rect x="0" y="22" width="4" height="10" fill="hsl(var(--destructive) / 0.8)" />
      <rect x="4" y="22" width="4" height="10" fill="hsl(var(--destructive) / 0.8)" />
      {/* Racket */}
      <rect x="-14" y="10" width="12" height="4" fill="hsl(var(--foreground))" />
       <rect x="-18" y="8" width="6" height="8" fill="hsl(var(--foreground))" />
    </g>
    
    {/* Ball */}
    <rect x="140" y="70" width="5" height="5" fill="hsl(var(--accent-foreground))" stroke="yellow" strokeWidth="1" filter="url(#glow)" />

  </svg>
);
