import React from 'react';

interface PageProps {
  onBack: () => void;
}

export default function HighScores({ onBack }: PageProps) {
  const scores = [
    { rank: 1, name: 'ACE', score: 999990 },
    { rank: 2, name: 'PXL', score: 850100 },
    { rank: 3, name: 'GAM', score: 725340 },
    { rank: 4, name: 'DEV', score: 610000 },
    { rank: 5, name: 'BIT', score: 555550 },
  ];

  return (
    <div className="w-full h-full flex flex-col p-8 text-white">
      <h1 className="text-5xl font-headline text-primary mb-8 text-center">HIGH SCORES</h1>
      <ul className="flex-grow space-y-2 text-2xl font-headline">
         <li className="flex justify-between items-center p-2 text-primary">
            <span className="w-1/4">RANK</span>
            <span className="w-1/2 text-center">NAME</span>
            <span className="w-1/4 text-right">SCORE</span>
          </li>
        {scores.map(score => (
          <li key={score.rank} className="flex justify-between items-center p-2 border-b-2 border-dashed border-gray-700 hover:bg-primary/20">
            <span className="w-1/4 text-accent">{score.rank}</span>
            <span className="w-1/2 text-center">{score.name}</span>
            <span className="w-1/4 text-right font-code">{score.score.toLocaleString()}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center text-lg text-gray-400 font-code">
        <p>[B] or [ESC] to go back.</p>
      </div>
    </div>
  );
}
