
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MainMenu from '@/components/pixelplay/MainMenu';
import ProjectList from '@/components/pixelplay/ProjectList';
import Certified from '@/components/pixelplay/Certified';
import SettingsPage from '@/components/pixelplay/SettingsPage';
import AboutMePage from '@/components/pixelplay/AboutMePage';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import useBackgroundMusic from '@/hooks/useBackgroundMusic';
import { useLocalization } from '@/hooks/useLocalization';
import { cn } from '@/lib/utils';
import { Gamepad2, Trophy, Settings as SettingsIcon, User, ArrowUp, ArrowDown } from 'lucide-react';
import BootScreen from '@/components/pixelplay/BootScreen';
import LoadingScreen from '@/components/pixelplay/LoadingScreen';
import { useVisualSettings } from '@/hooks/useVisualSettings.tsx';
import useSoundSettings from '@/hooks/useSoundSettings';

type Page = 'main' | 'games' | 'scores' | 'settings' | 'about';
type GameState = 'loading' | 'booting' | 'active';

export default function PixelPlayHub() {
  const [gameState, setGameState] = useState<GameState>('loading');
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [selectedItem, setSelectedItem] = useState(0);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { t, isLocalizationReady } = useLocalization();
  const { isScanlinesEnabled } = useVisualSettings();
  const { isSoundEnabled } = useSoundSettings();

  const menuItems = useMemo(() => [
    { id: 'games', label: t('mainMenu.projectList'), icon: Gamepad2, target: 'games' as Page },
    { id: 'scores', label: t('mainMenu.certified'), icon: Trophy, target: 'scores' as Page },
    { id: 'about', label: t('mainMenu.aboutMe'), icon: User, target: 'about' as Page },
    { id: 'settings', label: t('mainMenu.settings'), icon: SettingsIcon, target: 'settings' as Page },
  ], [t]);
  
  const { isReady: musicReady, isMusicEnabled, playMusic, pauseMusic, volume } = useBackgroundMusic();
  const { isReady: soundsReady, playNavigate, playSelect, playBack, playStart } = useArcadeSounds({ isSoundEnabled });

  useEffect(() => {
    if (gameState === 'booting' || gameState === 'active') {
      if (isMusicEnabled) {
        playMusic();
      } else {
        pauseMusic();
      }
    }
  }, [gameState, isMusicEnabled, playMusic, pauseMusic]);

  useEffect(() => {
    if (gameState === 'loading' && soundsReady && musicReady && isLocalizationReady) {
        setGameState('booting');
    }
  }, [gameState, soundsReady, musicReady, isLocalizationReady]);


  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    if (isTransitioning || gameState !== 'active') return;
    playNavigate();
    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });

    if (direction === 'up') {
        window.dispatchEvent(upEvent);
    } else {
        window.dispatchEvent(downEvent);
    }
  }, [isTransitioning, playNavigate, gameState]);

  const handleSelect = useCallback(() => {
    if (isTransitioning || gameState !== 'active') return;
    
    if (currentPage === 'main') {
      playSelect();
      setActiveButton('a');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage(menuItems[selectedItem].target);
        setIsTransitioning(false);
      }, 500); // match animation duration
    } else {
      // Forward the select action to the current component
      const selectEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
      window.dispatchEvent(selectEvent);
    }
  }, [currentPage, isTransitioning, playSelect, selectedItem, gameState, menuItems]);

  const handleBack = useCallback(() => {
    if (isTransitioning || gameState !== 'active' || currentPage === 'main') return;
    playBack();
    setActiveButton('b');
    
    // Forward the back action to the current component instead of handling it here
    const backEvent = new KeyboardEvent('keydown', { key: 'b', bubbles: true });
    window.dispatchEvent(backEvent);

  }, [currentPage, isTransitioning, playBack, gameState]);

  const handleStartButton = useCallback(() => {
    if (isTransitioning || gameState === 'loading') return;
    playStart();
    setActiveButton('start');

    if (gameState === 'booting') {
        setGameState('active');
        playMusic();
    } else if (gameState === 'active') {
        if (currentPage === 'main') {
            handleSelect();
        } else {
           // Forward the start action to the current component
          const startEvent = new KeyboardEvent('keydown', { key: 's', bubbles: true });
          window.dispatchEvent(startEvent);
        }
    }
  }, [isTransitioning, gameState, currentPage, handleSelect, playStart, playMusic]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let keyHandled = false;

      if (gameState === 'booting') {
          if (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'enter') {
              handleStartButton();
              keyHandled = true;
          }
          return;
      }
      
      if (gameState !== 'active') return;

      if (currentPage === 'main') {
        switch (e.key.toLowerCase()) {
          case 'arrowup':
            setSelectedItem(prev => (prev - 1 + menuItems.length) % menuItems.length);
            playNavigate();
            keyHandled = true;
            break;
          case 'arrowdown':
            setSelectedItem(prev => (prev + 1) % menuItems.length);
            playNavigate();
            keyHandled = true;
            break;
          case 'a':
          case 'enter':
            handleSelect();
            keyHandled = true;
            break;
          case 's':
            handleStartButton();
            keyHandled = true;
            break;
        }
      } else {
         // Other pages handle their own key events
         switch (e.key.toLowerCase()) {
            case 'b':
            case 'escape':
              handleBack();
              keyHandled = true;
              break;
         }
      }
      
      if(keyHandled) e.preventDefault();
    };
    
    window.addEventListener('keydown', handleKeyDown);

    const onBackFromComponent = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentPage('main');
            setSelectedItem(0);
            setIsTransitioning(false);
        }, 500);
    }

    // Custom event listener
    window.addEventListener('backToMain', onBackFromComponent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('backToMain', onBackFromComponent);
    };
  }, [handleNavigation, handleSelect, handleBack, handleStartButton, currentPage, playNavigate, isTransitioning, gameState, menuItems.length]);

  useEffect(() => {
    if (activeButton) {
      const timer = setTimeout(() => setActiveButton(null), 200);
      return () => clearTimeout(timer);
    }
  }, [activeButton]);

  const CurrentPageComponent = useMemo(() => {
    if (gameState === 'loading' || !isLocalizationReady) {
      return <LoadingScreen />;
    }
    if (gameState === 'booting') {
      return <BootScreen />;
    }

    switch (currentPage) {
      case 'games':
        return <ProjectList />;
      case 'scores':
        return <Certified />;
      case 'about':
        return <AboutMePage />;
      case 'settings':
        return <SettingsPage />;
      case 'main':
      default:
        return <MainMenu menuItems={menuItems} selectedItem={selectedItem} />;
    }
  }, [currentPage, selectedItem, gameState, menuItems, isLocalizationReady]);

  const handleButtonPress = (action: 'a' | 'b' | 'start') => {
    switch(action) {
      case 'a': 
        handleSelect();
        break;
      case 'b': 
        handleBack();
        break;
      case 'start':
        handleStartButton();
        break;
    }
  };

  return (
    <div className="bg-transparent text-foreground h-screen flex items-center justify-center overflow-hidden p-2 sm:p-4">
      <main className="w-full max-w-4xl h-full max-h-[1024px] flex flex-col items-center justify-center">
        <div className="w-full h-full bg-[#1a1a1a] rounded-2xl shadow-2xl p-2 sm:p-4 flex flex-col border-4 border-yellow-600 shadow-[inset_0_0_20px_black]">
          
          <div className="bg-black flex-grow rounded-lg p-2 border-2 border-yellow-700 relative overflow-hidden flex flex-col">
            <div className="absolute top-2 right-4 flex items-center gap-2 z-10">
              <span className="text-accent font-headline text-sm">P1</span>
              <div className={cn(
                "w-3 h-3 rounded-full",
                gameState === 'loading'
                  ? 'bg-red-600 shadow-[0_0_8px_red]'
                  : 'bg-green-600 shadow-[0_0_8px_green]'
              )}></div>
            </div>
            
            <div className={cn(
              "w-full h-full flex-grow",
              isTransitioning ? 'animate-pixel-out' : 'animate-pixel-in'
            )}>
              {CurrentPageComponent}
            </div>
            
            {isScanlinesEnabled && (
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 50%)',
                backgroundSize: '100% 4px',
              }}></div>
            )}
          </div>
  
          <div className="flex-shrink-0 pt-4 px-2 sm:px-8 flex flex-wrap sm:flex-nowrap justify-around items-center gap-4 sm:gap-2">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative w-24 h-24 select-none">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      <div
                          onMouseDown={(e) => { e.preventDefault(); handleNavigation('up'); }}
                          className="col-start-2 row-start-1 bg-gray-700 rounded-t-md border-2 border-b-0 border-gray-800 active:bg-gray-600 cursor-pointer flex items-center justify-center"
                      >
                         <ArrowUp className="w-6 h-6 text-gray-400"/>
                      </div>
                      <div className="col-start-2 row-start-2 bg-gray-700 border-x-2 border-gray-800"></div>
                      <div className="col-start-1 row-start-2 bg-gray-700 rounded-l-md border-2 border-r-0 border-gray-800"></div>
                      <div className="col-start-3 row-start-2 bg-gray-700 rounded-r-md border-2 border-l-0 border-gray-800"></div>
                      <div
                          onMouseDown={(e) => { e.preventDefault(); handleNavigation('down'); }}
                          className="col-start-2 row-start-3 bg-gray-700 rounded-b-md border-2 border-t-0 border-gray-800 active:bg-gray-600 cursor-pointer flex items-center justify-center"
                      >
                         <ArrowDown className="w-6 h-6 text-gray-400"/>
                      </div>
                  </div>
              </div>
              <div className="font-headline text-center text-xs sm:text-sm text-gray-400">
                <p>{t('controls.dpad')}</p>
                <p>{t('controls.upDown')}</p>
              </div>
            </div>
            
            <div className="flex items-end gap-2 sm:gap-4">
               <div className="text-center">
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleButtonPress('start'); }}
                  data-internal-key="start"
                  className={cn(
                    'w-16 h-7 sm:w-20 sm:h-8 rounded-lg bg-gray-500 border-b-4 border-gray-700 transition-all duration-100 active:translate-y-1 active:border-b-0',
                    activeButton === 'start' ? 'translate-y-1 border-b-0' : ''
                  )}
                ></button>
                <p className="mt-2 font-headline text-xs sm:text-sm text-gray-400">{t('controls.start')}</p>
              </div>
              <div className="text-center">
                <button 
                  onMouseDown={(e) => { e.preventDefault(); handleButtonPress('b'); }}
                  data-internal-key="b"
                  className={cn(
                    'w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary border-b-8 border-blue-800 transition-all duration-100 active:translate-y-1 active:border-b-2',
                    activeButton === 'b' ? 'translate-y-1 border-b-2' : ''
                  )}
                ></button>
                <p className="mt-2 font-headline text-xs sm:text-sm text-primary">{t('controls.bBack')}</p>
              </div>
              <div className="text-center">
                <button 
                  onMouseDown={(e) => { e.preventDefault(); handleButtonPress('a'); }}
                  data-internal-key="a"
                  className={cn(
                    'w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-accent border-b-8 border-green-800 transition-all duration-100 active:translate-y-1 active:border-b-2',
                    activeButton === 'a' ? 'translate-y-1 border-b-2' : ''
                  )}
                ></button>
                <p className="mt-2 font-headline text-xs sm:text-sm text-accent">{t('controls.aSelect')}</p>
              </div>
            </div>
          </div>
  
          <div className="text-center pt-2 sm:pt-4">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-headline text-primary tracking-widest">{t('mainTitle')}</h1>
          </div>
        </div>
      </main>
    </div>
  );
}
