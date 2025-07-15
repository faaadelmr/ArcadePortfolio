'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import useBackgroundMusic from '@/hooks/useBackgroundMusic';

const backToMainEvent = new Event('backToMain', { bubbles: true });

export default function SettingsPage() {
  const [selectedItem, setSelectedItem] = useState(0);
  const { playNavigate, playSelect, playBack } = useArcadeSounds();
  const { isMusicEnabled, toggleMusic } = useBackgroundMusic();
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch by waiting for the client to mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const settings = [
    { id: 'sound', label: 'Sound FX', onToggle: () => {}, isEnabled: true }, // Placeholder for sound FX
    { id: 'music', label: 'Music', onToggle: toggleMusic, isEnabled: isMusicEnabled },
    { id: 'scanlines', label: 'Scanline Effect', onToggle: () => {}, isEnabled: true },
    { id: 'difficulty', label: 'Hard Mode', onToggle: () => {}, isEnabled: false },
  ];

  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    playNavigate();
    setSelectedItem(prev => {
      const newIndex = direction === 'up' ? prev - 1 : prev + 1;
      return (newIndex + settings.length) % settings.length;
    });
  }, [playNavigate, settings.length]);

  const handleToggle = useCallback(() => {
    playSelect();
    settings[selectedItem].onToggle();
  }, [selectedItem, playSelect, settings]);

  const handleBack = useCallback(() => {
    playBack();
    window.dispatchEvent(backToMainEvent);
  }, [playBack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key.toLowerCase()) {
        case 'arrowup':
          handleNavigation('up');
          break;
        case 'arrowdown':
          handleNavigation('down');
          break;
        case 'a':
        case 'enter':
        case 's':
          handleToggle();
          break;
        case 'b':
        case 'backspace':
        case 'escape':
          handleBack();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNavigation, handleToggle, handleBack]);

  if (!isMounted) {
    // Render nothing or a loading state until mounted to prevent hydration errors
    return null;
  }
  
  return (
    <div className="w-full h-full flex flex-col p-8 text-white">
      <h1 className="text-5xl font-headline text-primary mb-8 text-center">SETTINGS</h1>
      <ul className="flex-grow space-y-6 text-2xl font-headline max-w-md mx-auto w-full">
        {settings.map((setting, index) => (
          <li 
            key={setting.id} 
            className={cn(
                "flex justify-between items-center p-2 rounded-md transition-colors",
                selectedItem === index ? 'bg-primary/20' : ''
            )}
          >
            <Label 
                htmlFor={setting.id} 
                className={cn(
                    "text-2xl font-headline cursor-pointer",
                    selectedItem === index ? 'text-accent' : 'text-white'
                )}
            >
                {setting.label}
            </Label>
            <Switch 
              id={setting.id} 
              checked={setting.isEnabled}
              onCheckedChange={setting.onToggle}
            />
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center text-lg text-gray-400 font-code">
        <p>[B] or [ESC] to go back.</p>
      </div>
    </div>
  );
}
