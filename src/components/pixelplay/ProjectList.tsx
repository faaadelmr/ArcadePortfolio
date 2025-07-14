import React from 'react';

interface PageProps {
  onBack: () => void;
}

export default function ProjectList({ onBack }: PageProps) {
  const games = [
    { title: 'Galaxy Invaders', year: 1983 },
    { title: 'Pixel Racer', year: 1985 },
    { title: 'Block Breaker DX', year: 1988 },
    { title: 'Dungeon Crawler', year: 1991 },
    { title: 'Neon Striker', year: 1992 },
  ];

  return (
    <div className="w-full h-full flex flex-col p-8 text-white">
      <h1 className="text-5xl font-headline text-primary mb-8 text-center">PROJECT LIST</h1>
      <ul className="flex-grow space-y-2 text-2xl font-headline">
        {games.map(game => (
          <li key={game.title} className="flex justify-between items-center p-2 border-b-2 border-dashed border-gray-700 hover:bg-primary/20">
            <span>{game.title}</span>
            <span className="font-code text-accent">{game.year}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center text-lg text-gray-400 font-code">
        <p>[B] or [ESC] to go back.</p>
      </div>
    </div>
  );
}
