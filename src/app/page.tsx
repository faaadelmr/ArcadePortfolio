
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MainMenu from '@/components/pixelplay/MainMenu';
import ProjectList from '@/components/pixelplay/ProjectList';
import Certified from '@/components/pixelplay/Certified';
import SettingsPage from '@/components/pixelplay/SettingsPage';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { cn } from '@/lib/utils';
import { Gamepad2, Trophy, Settings as SettingsIcon } from 'lucide-react';

type Page = 'main' | 'games' | 'scores' | 'settings';

const menuItems = [
  { id: 'games', label: 'Project List', icon: Gamepad2, target: 'games' as Page },
  { id: 'scores', label: 'Certified', icon: Trophy, target: 'scores' as Page },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, target: 'settings' as Page },
];

const DRAG_THRESHOLD = 20; // pixels

export default function PixelPlayHub() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [selectedItem, setSelectedItem] = useState(0);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<number | null>(null);
  const [joystickTranslateY, setJoystickTranslateY] = useState(0);

  const { playNavigate, playSelect, playBack } = useArcadeSounds();

  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    if (isTransitioning) return;
    playNavigate();
    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });

    if (direction === 'up') {
        window.dispatchEvent(upEvent);
    } else {
        window.dispatchEvent(downEvent);
    }
  }, [isTransitioning, playNavigate]);

  const handleSelect = useCallback(() => {
    if (isTransitioning) return;
    
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
  }, [currentPage, isTransitioning, playSelect, selectedItem]);

  const handleBack = useCallback(() => {
    if (isTransitioning || currentPage === 'main') return;
    playBack();
    setActiveButton('b');
    
    // Forward the back action to the current component instead of handling it here
    const backEvent = new KeyboardEvent('keydown', { key: 'b', bubbles: true });
    window.dispatchEvent(backEvent);

  }, [currentPage, isTransitioning, playBack]);

  const handleStart = useCallback(() => {
    if (isTransitioning) return;
    setActiveButton('start');
    if (currentPage === 'main') {
      handleSelect();
    } else {
       // Forward the start action to the current component
      const startEvent = new KeyboardEvent('keydown', { key: 's', bubbles: true });
      window.dispatchEvent(startEvent);
    }
  }, [isTransitioning, currentPage, handleSelect]);

  const getClientY = (e: React.MouseEvent | React.TouchEvent) => {
    return 'touches' in e ? e.touches[0].clientY : e.clientY;
  };
  
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragStartPos(getClientY(e));
  };
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || dragStartPos === null) return;
    e.stopPropagation();
    e.preventDefault();
    const clientY = getClientY(e);
    const deltaY = clientY - dragStartPos;
    setJoystickTranslateY(Math.max(-32, Math.min(32, deltaY))); // Clamp translation
  };
  
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isDragging || dragStartPos === null) return;
    
    if (joystickTranslateY < -DRAG_THRESHOLD) {
      handleNavigation('up');
    } else if (joystickTranslateY > DRAG_THRESHOLD) {
      handleNavigation('down');
    }
    setIsDragging(false);
    setDragStartPos(null);
    setJoystickTranslateY(0);
  };

  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
        if(isDragging) handleDragEnd(e as any);
    }
    const handleGlobalMouseMove = (e: MouseEvent) => {
        if(isDragging) handleDragMove(e as any);
    }
    const handleGlobalTouchMove = (e: TouchEvent) => {
        if(isDragging) handleDragMove(e as any);
    }
    const handleGlobalTouchEnd = (e: TouchEvent) => {
        if(isDragging) handleDragEnd(e as any);
    }
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let keyHandled = false;
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
          case 's':
            handleSelect();
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
  }, [handleNavigation, handleSelect, handleBack, handleStart, currentPage, playNavigate, isTransitioning]);

  useEffect(() => {
    if (activeButton) {
      const timer = setTimeout(() => setActiveButton(null), 200);
      return () => clearTimeout(timer);
    }
  }, [activeButton]);

  const CurrentPageComponent = useMemo(() => {
    switch (currentPage) {
      case 'games':
        return <ProjectList />;
      case 'scores':
        return <Certified />;
      case 'settings':
        return <SettingsPage />;
      case 'main':
      default:
        return <MainMenu menuItems={menuItems} selectedItem={selectedItem} />;
    }
  }, [currentPage, selectedItem]);

  const handleButtonPress = (action: 'a' | 'b' | 'start') => {
    switch(action) {
      case 'a': 
        handleSelect();
        break;
      case 'b': 
        handleBack();
        break;
      case 'start':
        handleStart();
        break;
    }
  };

  return (
    <div className="bg-background text-foreground h-screen flex flex-col font-body overflow-hidden">
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl aspect-[4/3] max-h-[90vh] bg-[#1a1a1a] rounded-2xl shadow-2xl p-4 flex flex-col border-4 border-gray-600 shadow-[inset_0_0_20px_black]">
          
          <div className="bg-black flex-grow rounded-lg p-2 border-2 border-gray-700 relative overflow-hidden">
            <div className="absolute top-2 right-4 flex items-center gap-2 z-10">
              <span className="text-accent font-headline text-sm">P1</span>
              <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_8px_red]"></div>
            </div>
            
            <div className={cn(
              "w-full h-full",
              isTransitioning ? 'animate-pixel-out' : 'animate-pixel-in'
            )}>
              {CurrentPageComponent}
            </div>
            
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 50%)',
              backgroundSize: '100% 4px',
            }}></div>
          </div>
  
          <div className="flex-shrink-0 pt-6 px-2 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-4">
            <div className="flex items-center gap-6">
              <div 
                className="relative select-none"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
              >
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-800">
                  <div 
                    className="w-8 h-8 bg-red-600 rounded-full border-2 border-red-800 shadow-lg transition-transform duration-75"
                    style={{ transform: `translateY(${joystickTranslateY}px)` }}
                  ></div>
                </div>
              </div>
              <div className="font-headline text-center text-sm text-gray-400">
                <p>JOYSTICK</p>
                <p>UP/DOWN</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-center">
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleButtonPress('start'); }}
                  data-internal-key="start"
                  className={cn(
                    'w-20 h-8 rounded-lg bg-gray-500 border-b-4 border-gray-700 transition-all duration-100 active:translate-y-1 active:border-b-0',
                    activeButton === 'start' ? 'translate-y-1 border-b-0' : ''
                  )}
                ></button>
                <p className="mt-2 font-headline text-sm text-gray-400">START</p>
              </div>
              <div className="text-center">
                <button 
                  onMouseDown={(e) => { e.preventDefault(); handleButtonPress('b'); }}
                  data-internal-key="b"
                  className={cn(
                    'w-16 h-16 rounded-full bg-primary border-b-8 border-blue-800 transition-all duration-100 active:translate-y-1 active:border-b-2',
                    activeButton === 'b' ? 'translate-y-1 border-b-2' : ''
                  )}
                ></button>
                <p className="mt-2 font-headline text-primary">B (Back)</p>
              </div>
              <div className="text-center">
                <button 
                  onMouseDown={(e) => { e.preventDefault(); handleButtonPress('a'); }}
                  data-internal-key="a"
                  className={cn(
                    'w-16 h-16 rounded-full bg-accent border-b-8 border-green-800 transition-all duration-100 active:translate-y-1 active:border-b-2',
                    activeButton === 'a' ? 'translate-y-1 border-b-2' : ''
                  )}
                ></button>
                <p className="mt-2 font-headline text-accent">A (Select)</p>
              </div>
            </div>
          </div>
  
          <div className="text-center pt-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-headline text-primary tracking-widest">FADEL MUHAMAD RIFAI</h1>
          </div>
        </div>
      </main>
    </div>
  );
}
