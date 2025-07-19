
import React from 'react';

export const AgendaNesBackground = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 256 240"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
    style={{ imageRendering: 'pixelated', backgroundColor: 'hsl(var(--background))' }}
  >
    {/* Calendar back */}
    <rect x="40" y="30" width="176" height="180" fill="hsl(var(--muted) / 0.7)" stroke="hsl(var(--border))" strokeWidth="2"/>
    
    {/* Calendar Header */}
    <rect x="40" y="30" width="176" height="30" fill="hsl(var(--destructive))" />
    
    {/* Month Text (placeholder) */}
    <g transform="translate(88 40)" fill="hsl(var(--primary-foreground))">
        {/* P */}
        <path d="M0 0h6v6h-2v-4h-2v10h-2z" />
        {/* R */}
        <path d="M8 0h6v6h-2v-4h-2v10h4v2h-6v-12h2z" />
        {/* O */}
        <path d="M18 0h6v12h-6z M20 2h2v8h-2z" />
        {/* J */}
        <path d="M26 0h6v10h-4v2h-4v-2h2z" />
        {/* E */}
        <path d="M36 0h6v2h-4v3h4v2h-4v3h6v2h-8v-12z" />
        {/* C */}
        <path d="M46 0h6v2h-4v8h4v2h-6v-10h4v-2z" />
        {/* T */}
        <path d="M56 0h8v2h-3v10h-2v-10h-3z" />
        {/* S */}
        <path d="M68 0h6v5h-4v2h4v5h-6v-5h4v-2h-4z" />
    </g>

    {/* Calendar Grid Lines */}
    <g stroke="hsl(var(--border))" strokeWidth="1">
      {[1, 2, 3, 4].map(i => (
        <line key={`h-${i}`} x1="40" y1={60 + i * 30} x2="216" y2={60 + i * 30} />
      ))}
      {[1, 2, 3, 4, 5, 6].map(i => (
        <line key={`v-${i}`} x1={40 + i * 29.3} y1="60" x2={40 + i * 29.3} y2="210" />
      ))}
    </g>

    {/* Marked Days */}
    <g fill="hsl(var(--accent) / 0.5)">
      <rect x="71" y="65" width="25" height="20" />
      <rect x="129" y="95" width="25" height="20" />
      <rect x="188" y="125" width="25" height="20" />
      <rect x="42" y="155" width="25" height="20" />
    </g>
    
    {/* Padel racket icon */}
    <g transform="translate(180, 180) rotate(-30)">
        <rect x="0" y="0" width="15" height="4" fill="hsl(var(--accent))" />
        <ellipse cx="20" cy="2" rx="7" ry="8" fill="hsl(var(--accent) / 0.8)" />
        <circle cx="20" cy="2" r="5" fill="none" stroke="hsl(var(--accent-foreground))" strokeWidth="1" strokeDasharray="1 1"/>
    </g>
  </svg>
);
