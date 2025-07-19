import React from 'react';

export const LockerRoomNesBackground = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 256 240"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
    style={{ imageRendering: 'pixelated', backgroundColor: 'hsl(var(--background))' }}
  >
    {/* Floor tiles */}
    <defs>
      <pattern id="floor-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="hsl(var(--secondary) / 0.8)" />
        <path d="M 0 0 L 16 0 M 0 0 L 0 16" stroke="hsl(var(--background))" strokeWidth="1" />
      </pattern>
    </defs>
    <rect x="0" y="160" width="256" height="80" fill="url(#floor-pattern)" />

    {/* Back wall */}
    <rect x="0" y="0" width="256" height="160" fill="hsl(var(--secondary) / 0.5)" />

    {/* Lockers */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
      <g key={i} transform={`translate(${20 + i * 28}, 40)`}>
        {/* Locker body */}
        <rect x="0" y="0" width="24" height="110" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
        {/* Vents */}
        <rect x="4" y="8" width="16" height="4" fill="hsl(var(--background))" />
        <rect x="4" y="16" width="16" height="4" fill="hsl(var(--background))" />
        {/* Handle */}
        <rect x="9" y="50" width="6" height="10" fill="hsl(var(--background))" />
      </g>
    ))}

    {/* Bench */}
    <rect x="30" y="140" width="196" height="12" fill="hsl(var(--primary) / 0.6)" stroke="hsl(var(--primary))" strokeWidth="2" />
    {/* Bench legs */}
    <rect x="40" y="152" width="10" height="18" fill="hsl(var(--primary) / 0.6)" />
    <rect x="206" y="152" width="10" height="18" fill="hsl(var(--primary) / 0.6)" />

    {/* Padel Racket */}
    <g transform="translate(100, 110) rotate(15)">
      {/* Handle */}
      <rect x="0" y="0" width="20" height="6" fill="hsl(var(--accent) / 0.9)" />
      {/* Head */}
      <ellipse cx="28" cy="3" rx="10" ry="12" fill="hsl(var(--accent))" />
      {/* Strings */}
      <circle cx="28" cy="3" r="8" fill="none" stroke="hsl(var(--accent-foreground))" strokeWidth="1" strokeDasharray="2 2"/>
    </g>
  </svg>
);
