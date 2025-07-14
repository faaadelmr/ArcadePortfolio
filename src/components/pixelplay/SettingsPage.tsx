'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import useArcadeSounds from '@/hooks/useArcadeSounds';

const settings = [
  { id: 'sound', label: 'Sound FX', defaultChecked: true },
  { id: 'music', label: 'Music', defaultChecked: false },
  { id: 'scanlines', label: 'Scanline Effect', defaultChecked: true },
  { id: 'difficulty', label: 'Hard Mode', defaultChecked: false },
];

const backToMainEvent = new Event('backToMain', { bubbles: true });

export default function SettingsPage() {
  const [selectedItem, setSelectedItem] = useState(0);
  const { playNavigate, playSelect, playBack } = useArcadeSounds();

  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    playNavigate();
    setSelectedItem(prev => {
      const newIndex = direction === 'up' ? prev - 1 : prev + 1;
      return (newIndex + settings.length) % settings.length;
    });
  }, [playNavigate]);

  const handleToggle = useCallback(() => {
    playSelect();
    const settingId = settings[selectedItem].id;
    const switchElement = document.getElementById(settingId) as HTMLButtonElement | null;
    switchElement?.click();
  }, [selectedItem, playSelect]);

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
            <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center text-lg text-gray-400 font-code">
        <p>[B] or [ESC] to go back.</p>
      </div>
    </div>
  );
}
