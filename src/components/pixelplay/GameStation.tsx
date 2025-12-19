
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Bug, Gamepad } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { useLocalization } from '@/hooks/useLocalization';
import BugDodgeGame from './BugDodgeGame';

const backToMainEvent = new Event('backToMain', { bubbles: true });

interface Game {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function GameStation() {
    const [selectedItem, setSelectedItem] = useState(0);
    const [playingGame, setPlayingGame] = useState<string | null>(null);
    const { playNavigate, playSelect, playBack } = useArcadeSounds();
    const { t } = useLocalization();
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const games: Game[] = [
        {
            id: 'bug-dodge',
            title: t('gameStation.games.endlessCode.title'),
            description: t('gameStation.games.endlessCode.description'),
            icon: <Bug className="w-8 h-8 text-red-400" />,
        },
    ];

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, games.length);
    }, [games.length]);

    const handleNavigation = useCallback((direction: 'up' | 'down') => {
        if (playingGame) return;
        playNavigate();
        setSelectedItem(prev => {
            const newIndex = direction === 'up' ? prev - 1 : prev + 1;
            return (newIndex + games.length) % games.length;
        });
    }, [playingGame, playNavigate, games.length]);

    const handleSelectGame = useCallback((index?: number) => {
        const targetIndex = index !== undefined ? index : selectedItem;
        if (playingGame) return;
        playSelect();
        setPlayingGame(games[targetIndex].id);
    }, [playSelect, selectedItem, playingGame, games]);

    const handleBackToList = useCallback(() => {
        playBack();
        setPlayingGame(null);
    }, [playBack]);

    const handleBackToMain = useCallback(() => {
        if (playingGame) {
            handleBackToList();
        } else {
            playBack();
            window.dispatchEvent(backToMainEvent);
        }
    }, [playBack, playingGame, handleBackToList]);

    const handleGameClick = useCallback((index: number) => {
        setSelectedItem(index);
        handleSelectGame(index);
    }, [handleSelectGame]);

    const handleGameHover = useCallback((index: number) => {
        if (index !== selectedItem) {
            playNavigate();
            setSelectedItem(index);
        }
    }, [selectedItem, playNavigate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (playingGame) {
                // Let the game handle its own keys, but catch escape
                if (e.key.toLowerCase() === 'escape') {
                    e.preventDefault();
                    handleBackToList();
                }
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'arrowup':
                    e.preventDefault();
                    handleNavigation('up');
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    handleNavigation('down');
                    break;
                case 'a':
                case 'enter':
                    e.preventDefault();
                    handleSelectGame();
                    break;
                case 'b':
                case 'escape':
                    e.preventDefault();
                    handleBackToMain();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNavigation, handleSelectGame, handleBackToMain, handleBackToList, playingGame]);

    // Render active game
    if (playingGame === 'bug-dodge') {
        return <BugDodgeGame onExit={handleBackToList} />;
    }

    // Game selection screen
    return (
        <div className="w-full h-full flex flex-col p-1 sm:p-2 text-white relative">
            <div className="absolute inset-0 z-0 opacity-10 bg-gradient-to-br from-purple-900 to-blue-900" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center mb-2 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 text-accent ring-2 ring-accent bg-accent/20 cursor-pointer h-6 w-6 sm:h-8 sm:w-8"
                        onClick={handleBackToMain}
                    >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Gamepad className="w-5 h-5 text-primary" />
                        <h1 className="text-sm sm:text-base font-headline text-primary">{t('gameStation.title')}</h1>
                    </div>
                </div>

                {/* Game List */}
                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-2 p-1">
                        {games.map((game, index) => (
                            <div
                                key={game.id}
                                ref={el => { if (el) itemRefs.current[index] = el; }}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
                                    selectedItem === index
                                        ? "border-accent bg-accent/20 scale-[1.02]"
                                        : "border-primary/30 hover:border-primary/60 hover:bg-primary/10"
                                )}
                                onClick={() => handleGameClick(index)}
                                onMouseEnter={() => handleGameHover(index)}
                            >
                                {/* Game Icon */}
                                <div className={cn(
                                    "w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center",
                                    "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
                                )}>
                                    {game.icon}
                                </div>

                                {/* Game Info */}
                                <div className="flex-1 min-w-0">
                                    <h2 className={cn(
                                        "text-sm sm:text-base font-headline",
                                        selectedItem === index ? "text-accent" : "text-white"
                                    )}>
                                        {game.title}
                                    </h2>
                                    <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-2">
                                        {game.description}
                                    </p>
                                </div>

                                {/* Play Button */}
                                <div className={cn(
                                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center",
                                    "bg-accent/20 border-2",
                                    selectedItem === index ? "border-accent" : "border-transparent"
                                )}>
                                    <Play className={cn(
                                        "w-4 h-4 sm:w-5 sm:h-5",
                                        selectedItem === index ? "text-accent" : "text-gray-500"
                                    )} />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Controls hint */}
                <div className="mt-1 text-center text-[10px] text-gray-500 font-code flex-shrink-0">
                    <p>{t('gameStation.controls.navigate')}</p>
                </div>
            </div>
        </div>
    );
}
