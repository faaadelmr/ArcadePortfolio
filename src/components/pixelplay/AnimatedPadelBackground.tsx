
import React from 'react';

export const AnimatedPadelBackground = () => {
  return (
    <div className="w-full h-full relative bg-[#004225] overflow-hidden">
      {/* 8-bit Court Texture */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
        backgroundSize: '8px 8px'
      }} />

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 256 240"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ imageRendering: 'pixelated' }}
      >
        <defs>
          <filter id="pixel-shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="0" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Court Lines */}
        <rect x="10" y="40" width="236" height="160" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
        <line x1="128" y1="40" x2="128" y2="200" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        
        {/* Ball */}
        <rect className="animate-padel-ball" width="6" height="6" fill="#ccff00" filter="url(#pixel-shadow)" />

        {/* Player 1 (Left) */}
        <g className="animate-player-left">
          {/* Head */}
          <rect x="20" y="0" width="10" height="10" fill="#ffdbac" />
          {/* Shirt */}
          <rect x="18" y="10" width="14" height="16" fill="hsl(var(--primary))" />
          {/* Shorts */}
          <rect x="18" y="26" width="14" height="8" fill="#333" />
          {/* Racket */}
          <rect x="32" y="12" width="12" height="12" fill="#fff" rx="2" />
          <rect x="30" y="16" width="4" height="4" fill="#666" />
        </g>

        {/* Player 2 (Right) */}
        <g className="animate-player-right">
          {/* Head */}
          <rect x="226" y="0" width="10" height="10" fill="#8d5524" />
          {/* Shirt */}
          <rect x="224" y="10" width="14" height="16" fill="hsl(var(--accent))" />
          {/* Shorts */}
          <rect x="224" y="26" width="14" height="8" fill="#eee" />
          {/* Racket */}
          <rect x="212" y="12" width="12" height="12" fill="#fff" rx="2" />
          <rect x="222" y="16" width="4" height="4" fill="#666" />
        </g>
      </svg>

      <style jsx>{`
        @keyframes ball-move {
          0%, 100% { transform: translate(44px, 110px); }
          50% { transform: translate(206px, 130px); }
        }
        @keyframes player-left-move {
          0%, 100% { transform: translateY(100px); }
          50% { transform: translateY(120px); }
        }
        @keyframes player-right-move {
          0%, 100% { transform: translateY(120px); }
          50% { transform: translateY(100px); }
        }
        .animate-padel-ball {
          animation: ball-move 3s infinite ease-in-out;
        }
        .animate-player-left {
          animation: player-left-move 3s infinite ease-in-out;
        }
        .animate-player-right {
          animation: player-right-move 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
