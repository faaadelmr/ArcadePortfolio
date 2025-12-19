
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Share2, RotateCcw, Bug, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { useLocalization } from '@/hooks/useLocalization';
import html2canvas from 'html2canvas';

interface BugDodgeGameProps {
    onExit: () => void;
}

interface BugItem {
    id: number;
    lane: number;
    x: number;
}

interface GitItem {
    id: number;
    lane: number;
    x: number;
}

const LANES = 3;
const PLAYER_SIZE = 40;
const BUG_SIZE = 30;
const GIT_SIZE = 28;
const INITIAL_SPEED = 1.2; // Slower initial speed
const SPEED_INCREMENT = 0.15;
const SPEED_INTERVAL = 12000; // 12 seconds
const DOUBLE_POINTS_DURATION = 5000; // 5 seconds

export default function BugDodgeGame({ onExit }: BugDodgeGameProps) {
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
    const [playerLane, setPlayerLane] = useState(1);
    const [bugs, setBugs] = useState<BugItem[]>([]);
    const [gitItems, setGitItems] = useState<GitItem[]>([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const [showScreenshot, setShowScreenshot] = useState(false);
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [hasDoublePoints, setHasDoublePoints] = useState(false);
    const [doublePointsTimer, setDoublePointsTimer] = useState(0);

    const gameRef = useRef<HTMLDivElement>(null);
    const gameLoopRef = useRef<number | null>(null);
    const bugSpawnRef = useRef<NodeJS.Timeout | null>(null);
    const gitSpawnRef = useRef<NodeJS.Timeout | null>(null);
    const speedIncreaseRef = useRef<NodeJS.Timeout | null>(null);
    const doublePointsRef = useRef<NodeJS.Timeout | null>(null);
    const itemIdRef = useRef(0);
    const scoreMultiplier = useRef(1);
    const { playNavigate, playSelect, playBack } = useArcadeSounds();
    const { t } = useLocalization();

    // Load high score
    useEffect(() => {
        const saved = localStorage.getItem('endlesscode-highscore');
        if (saved) setHighScore(parseInt(saved, 10));
    }, []);

    // Save high score
    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('endlesscode-highscore', score.toString());
        }
    }, [score, highScore]);

    // Double points timer display
    useEffect(() => {
        if (!hasDoublePoints) {
            setDoublePointsTimer(0);
            return;
        }

        const startTime = Date.now();
        const interval = setInterval(() => {
            const remaining = Math.max(0, DOUBLE_POINTS_DURATION - (Date.now() - startTime));
            setDoublePointsTimer(Math.ceil(remaining / 1000));
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [hasDoublePoints]);

    // Move player
    const movePlayer = useCallback((direction: 'up' | 'down') => {
        if (gameState !== 'playing') return;
        playNavigate();
        setPlayerLane(prev => {
            if (direction === 'up' && prev > 0) return prev - 1;
            if (direction === 'down' && prev < LANES - 1) return prev + 1;
            return prev;
        });
    }, [gameState, playNavigate]);

    // Start game
    const startGame = useCallback(() => {
        playSelect();
        setGameState('playing');
        setScore(0);
        setBugs([]);
        setGitItems([]);
        setSpeed(INITIAL_SPEED);
        setPlayerLane(1);
        setHasDoublePoints(false);
        scoreMultiplier.current = 1;
        itemIdRef.current = 0;
    }, [playSelect]);

    // Activate double points
    const activateDoublePoints = useCallback(() => {
        if (doublePointsRef.current) clearTimeout(doublePointsRef.current);

        setHasDoublePoints(true);
        scoreMultiplier.current = 2;
        playSelect();

        doublePointsRef.current = setTimeout(() => {
            setHasDoublePoints(false);
            scoreMultiplier.current = 1;
        }, DOUBLE_POINTS_DURATION);
    }, [playSelect]);

    // Game over
    const endGame = useCallback(() => {
        playBack();
        setGameState('gameover');
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        if (bugSpawnRef.current) clearInterval(bugSpawnRef.current);
        if (gitSpawnRef.current) clearInterval(gitSpawnRef.current);
        if (speedIncreaseRef.current) clearInterval(speedIncreaseRef.current);
        if (doublePointsRef.current) clearTimeout(doublePointsRef.current);
    }, [playBack]);

    // Screenshot function
    const takeScreenshot = useCallback(async () => {
        if (!gameRef.current) return;

        try {
            const canvas = await html2canvas(gameRef.current, {
                backgroundColor: '#1a1a2e',
                scale: 2,
            });
            const url = canvas.toDataURL('image/png');
            setScreenshotUrl(url);
            setShowScreenshot(true);
        } catch (error) {
            console.error('Screenshot failed:', error);
        }
    }, []);

    // Share/Download screenshot
    const shareScreenshot = useCallback(async () => {
        if (!screenshotUrl) return;

        if (navigator.share && navigator.canShare) {
            try {
                const blob = await (await fetch(screenshotUrl)).blob();
                const file = new File([blob], 'bugdodge-score.png', { type: 'image/png' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'Bug Dodge Score',
                        text: `I scored ${score} points in Bug Dodge! Can you beat my score?`,
                        files: [file],
                    });
                    return;
                }
            } catch (e) {
                console.log('Share failed, falling back to download');
            }
        }

        const link = document.createElement('a');
        link.href = screenshotUrl;
        link.download = `endlesscode-score-${score}.png`;
        link.click();
    }, [screenshotUrl, score]);

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const loop = () => {
            // Update bugs
            setBugs(prev => {
                const updated = prev
                    .map(bug => ({ ...bug, x: bug.x - speed }))
                    .filter(bug => bug.x > -10);

                // Check collision with bugs
                const playerY = playerLane;
                for (const bug of updated) {
                    if (bug.x <= 18 && bug.x >= 8 && bug.lane === playerY) {
                        endGame();
                        return prev;
                    }
                }

                // Count passed bugs for score and update speed
                const passedBugs = prev.filter(b => b.x > 5).length - updated.filter(b => b.x > 5).length;
                if (passedBugs > 0) {
                    setScore(currentScore => {
                        const newScore = currentScore + (passedBugs * scoreMultiplier.current);

                        // Increase speed every 10 points
                        const prevMilestone = Math.floor(currentScore / 10);
                        const newMilestone = Math.floor(newScore / 10);
                        if (newMilestone > prevMilestone) {
                            setSpeed(s => s + 0.2);
                        }

                        return newScore;
                    });
                }

                return updated;
            });

            // Update git items
            setGitItems(prev => {
                const updated = prev
                    .map(git => ({ ...git, x: git.x - speed }))
                    .filter(git => git.x > -10);

                // Check collision with git items (pickup)
                const playerY = playerLane;
                const collected: number[] = [];
                for (const git of updated) {
                    if (git.x <= 18 && git.x >= 8 && git.lane === playerY) {
                        collected.push(git.id);
                        activateDoublePoints();
                    }
                }

                return updated.filter(g => !collected.includes(g.id));
            });

            gameLoopRef.current = requestAnimationFrame(loop);
        };

        gameLoopRef.current = requestAnimationFrame(loop);

        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState, speed, playerLane, endGame, activateDoublePoints]);

    // Spawn bugs
    useEffect(() => {
        if (gameState !== 'playing') return;

        const spawnBug = () => {
            const lane = Math.floor(Math.random() * LANES);
            setBugs(prev => [...prev, { id: itemIdRef.current++, lane, x: 105 }]);
        };

        // Spawn rate increases after 50 points
        let spawnInterval;
        if (score >= 50) {
            // After 50 points: spawn 2 bugs at once sometimes, faster interval
            spawnInterval = Math.max(1000 - (speed * 60), 400);
            const rapidSpawn = () => {
                spawnBug();
                // 50% chance to spawn a second bug
                if (Math.random() < 0.5) {
                    setTimeout(spawnBug, 100);
                }
            };
            bugSpawnRef.current = setInterval(rapidSpawn, spawnInterval);
        } else {
            // Before 50 points: normal spawn rate
            spawnInterval = Math.max(1800 - (speed * 80), 600);
            bugSpawnRef.current = setInterval(spawnBug, spawnInterval);
        }

        return () => {
            if (bugSpawnRef.current) clearInterval(bugSpawnRef.current);
        };
    }, [gameState, speed, score]);

    // Spawn git items (less frequent)
    useEffect(() => {
        if (gameState !== 'playing') return;

        const spawnGit = () => {
            if (Math.random() < 0.4) { // 40% chance to spawn
                const lane = Math.floor(Math.random() * LANES);
                setGitItems(prev => [...prev, { id: itemIdRef.current++, lane, x: 105 }]);
            }
        };

        gitSpawnRef.current = setInterval(spawnGit, 4000); // Every 4 seconds

        return () => {
            if (gitSpawnRef.current) clearInterval(gitSpawnRef.current);
        };
    }, [gameState]);

    // Note: Speed now increases based on score (every 10 points) in the game loop

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    e.preventDefault();
                    movePlayer('up');
                    break;
                case 'arrowdown':
                case 's':
                    e.preventDefault();
                    movePlayer('down');
                    break;
                case ' ':
                case 'enter':
                case 'a':
                    e.preventDefault();
                    if (gameState === 'ready' || gameState === 'gameover') {
                        startGame();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer, startGame, gameState]);

    const laneHeight = 100 / LANES;

    return (
        <div className="w-full h-full flex flex-col text-white relative overflow-hidden">
            {/* Screenshot Modal */}
            {showScreenshot && screenshotUrl && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-2">
                    <img
                        src={screenshotUrl}
                        alt="Screenshot"
                        className="max-w-full max-h-[50%] rounded-lg border-2 border-accent"
                    />
                    <div className="flex gap-2 mt-3">
                        <Button
                            onClick={shareScreenshot}
                            className="bg-accent hover:bg-accent/80 text-black font-headline text-xs px-3 py-1"
                        >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowScreenshot(false)}
                            className="border-gray-500 text-gray-300 text-xs px-3 py-1"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {/* Game Container */}
            <div
                ref={gameRef}
                className="flex-1 flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#16213e] relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-2 py-1 flex-shrink-0 bg-black/30">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-accent h-5 w-5"
                        onClick={onExit}
                    >
                        <ArrowLeft className="w-3 h-3" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="text-center">
                            <p className="text-[8px] text-gray-400">SCORE</p>
                            <p className={cn(
                                "text-base font-headline",
                                hasDoublePoints ? "text-yellow-400 animate-pulse" : "text-accent"
                            )}>
                                {score}
                                {hasDoublePoints && <span className="text-[10px] ml-1">x2</span>}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] text-gray-400">BEST</p>
                            <p className="text-xs font-headline text-primary">{highScore}</p>
                        </div>
                    </div>
                    {hasDoublePoints && (
                        <div className="text-xs text-yellow-400 font-headline">
                            {doublePointsTimer}s
                        </div>
                    )}
                </div>

                {/* Game Area */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Lanes */}
                    {[0, 1, 2].map(lane => (
                        <div
                            key={lane}
                            className={cn(
                                "absolute w-full border-b border-dashed border-gray-700/50",
                                "flex items-center"
                            )}
                            style={{
                                top: `${lane * laneHeight}%`,
                                height: `${laneHeight}%`,
                            }}
                        >
                            <div className="absolute inset-0 opacity-20">
                                <div className="h-full w-full" style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 22px)',
                                    animation: 'scroll 0.8s linear infinite',
                                }} />
                            </div>
                        </div>
                    ))}

                    {/* Player */}
                    <div
                        className="absolute left-4 transition-all duration-150 ease-out flex items-center justify-center"
                        style={{
                            top: `${playerLane * laneHeight + laneHeight / 2}%`,
                            transform: 'translateY(-50%)',
                            width: PLAYER_SIZE,
                            height: PLAYER_SIZE,
                        }}
                    >
                        <div className="relative">
                            <div className={cn(
                                "w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center border-2 border-blue-300 shadow-lg",
                                hasDoublePoints && "shadow-yellow-500/50 border-yellow-400"
                            )}>
                                <span className="text-lg">👨‍💻</span>
                            </div>
                            <div className={cn(
                                "absolute inset-0 rounded-lg blur-md -z-10",
                                hasDoublePoints ? "bg-yellow-400/30" : "bg-blue-400/20"
                            )} />
                        </div>
                    </div>

                    {/* Bugs */}
                    {bugs.map(bug => (
                        <div
                            key={bug.id}
                            className="absolute transition-none flex items-center justify-center"
                            style={{
                                left: `${bug.x}%`,
                                top: `${bug.lane * laneHeight + laneHeight / 2}%`,
                                transform: 'translateY(-50%) translateX(-50%)',
                                width: BUG_SIZE,
                                height: BUG_SIZE,
                            }}
                        >
                            <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border-2 border-red-400">
                                <Bug className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    ))}

                    {/* Git Items */}
                    {gitItems.map(git => (
                        <div
                            key={git.id}
                            className="absolute transition-none flex items-center justify-center"
                            style={{
                                left: `${git.x}%`,
                                top: `${git.lane * laneHeight + laneHeight / 2}%`,
                                transform: 'translateY(-50%) translateX(-50%)',
                                width: GIT_SIZE,
                                height: GIT_SIZE,
                            }}
                        >
                            <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center border-2 border-orange-300 animate-bounce">
                                <GitBranch className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    ))}

                    {/* Ready/GameOver Overlay */}
                    {gameState !== 'playing' && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2">
                            {gameState === 'ready' && (
                                <>
                                    <h2 className="text-xl font-headline text-accent mb-1">{t('endlessCode.title')}</h2>
                                    <p className="text-[10px] text-gray-400 mb-1">{t('endlessCode.description')}</p>
                                    <p className="text-[10px] text-gray-500 mb-3">{t('endlessCode.controls')}</p>
                                    <Button
                                        onClick={startGame}
                                        className="bg-accent hover:bg-accent/80 text-black font-headline text-sm px-4 py-1"
                                    >
                                        {t('endlessCode.start')}
                                    </Button>
                                </>
                            )}
                            {gameState === 'gameover' && (
                                <>
                                    <h2 className="text-xl font-headline text-red-400 mb-1">{t('endlessCode.gameOver')}</h2>
                                    <p className="text-lg font-headline text-white">{t('endlessCode.score')}: {score}</p>
                                    {score >= highScore && score > 0 && (
                                        <p className="text-xs text-accent mb-1">{t('endlessCode.newHighScore')}</p>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            onClick={startGame}
                                            className="bg-accent hover:bg-accent/80 text-black font-headline text-xs px-3"
                                        >
                                            <RotateCcw className="w-3 h-3 mr-1" />
                                            {t('endlessCode.retry')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={takeScreenshot}
                                            className="border-primary text-primary hover:bg-primary/20 text-xs px-3"
                                        >
                                            <Camera className="w-3 h-3 mr-1" />
                                            {t('endlessCode.share')}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Control hint - no buttons */}
                <div className="flex-shrink-0 py-1 bg-black/30 text-center">
                    <p className="text-[9px] text-gray-500">{t('endlessCode.controls')}</p>
                </div>
            </div>

            <style jsx>{`
        @keyframes scroll {
          from { background-position-x: 0; }
          to { background-position-x: -22px; }
        }
      `}</style>
        </div>
    );
}
