
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import useBackgroundMusic from '@/hooks/useBackgroundMusic';
import { Slider } from '@/components/ui/slider';
import { Volume1, Volume2, VolumeX } from 'lucide-react';

const backToMainEvent = new Event('backToMain', { bubbles: true });

export default function SettingsPage() {
  const [selectedItem, setSelectedItem] = useState(0);
  const { isMusicEnabled, toggleMusic, volume, setVolume, isInitialized } = useBackgroundMusic();
  const { playNavigate, playSelect, playBack } = useArcadeSounds({ volume: isMusicEnabled ? volume : 0 });

  const settings = [
    { id: 'music', label: 'Music', onToggle: toggleMusic, isEnabled: isMusicEnabled, type: 'switch' },
    { id: 'volume', label: 'Volume', type: 'slider', value: volume * 100, onValueChange: (newVolume: number) => setVolume(newVolume / 100) },
    { id: 'sound', label: 'Sound FX', onToggle: () => {}, isEnabled: true, type: 'switch' }, // Placeholder for sound FX
    { id: 'scanlines', label: 'Scanline Effect', onToggle: () => {}, isEnabled: true, type: 'switch' },
  ];

  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    playNavigate();
    setSelectedItem(prev => {
      const newIndex = direction === 'up' ? prev - 1 : prev + 1;
      return (newIndex + settings.length) % settings.length;
    });
  }, [playNavigate, settings.length]);

  const handleToggle = useCallback(() => {
    const currentSetting = settings[selectedItem];
    if (currentSetting.type === 'switch' && currentSetting.onToggle) {
        playSelect();
        currentSetting.onToggle();
    }
  }, [selectedItem, playSelect, settings]);

  const handleSliderChange = useCallback((direction: 'up' | 'down') => {
    const currentSetting = settings[selectedItem];
    if (currentSetting.type !== 'slider') return;
    
    playNavigate();
    const currentValue = currentSetting.value;
    const step = 5;
    const newValue = direction === 'down' 
      ? Math.max(0, currentValue - step)
      : Math.min(100, currentValue + step);
    
    if (currentSetting.onValueChange) {
      currentSetting.onValueChange(newValue);
    }
  }, [selectedItem, settings, playNavigate]);

  const handleBack = useCallback(() => {
    playBack();
    window.dispatchEvent(backToMainEvent);
  }, [playBack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const currentSetting = settings[selectedItem];

      // Special handling for slider
      if (currentSetting.type === 'slider') {
          switch (e.key.toLowerCase()) {
              case 'arrowup':
                  handleSliderChange('up');
                  break;
              case 'arrowdown':
                  handleSliderChange('down');
                  break;
              case 'arrowleft': // Navigate up in the list
                  handleNavigation('up');
                  break;
              case 'arrowright': // Navigate down in the list
                  handleNavigation('down');
                  break;
              case 'b':
              case 'backspace':
              case 'escape':
                  handleBack();
                  break;
          }
          return;
      }
      
      // Default handling for other items
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
  }, [handleNavigation, handleToggle, handleBack, handleSliderChange, selectedItem, settings]);

  const getVolumeIcon = () => {
    if (volume === 0 || !isMusicEnabled) return <VolumeX className="w-6 h-6" />;
    if (volume < 0.5) return <Volume1 className="w-6 h-6" />;
    return <Volume2 className="w-6 h-6" />;
  }

  if (!isInitialized) {
    return null; // Prevent hydration mismatch
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
                    "text-2xl font-headline cursor-pointer flex items-center gap-4",
                    selectedItem === index ? 'text-accent' : 'text-white'
                )}
            >
                {setting.id === 'volume' && getVolumeIcon()}
                {setting.label}
            </Label>
            {setting.type === 'switch' && (
              <Switch 
                id={setting.id} 
                checked={setting.isEnabled}
                onCheckedChange={setting.onToggle}
              />
            )}
            {setting.type === 'slider' && (
               <Slider
                id={setting.id}
                value={[setting.value]}
                onValueChange={(value) => setting.onValueChange?.(value[0])}
                max={100}
                step={1}
                className={cn('w-[50%]', selectedItem === index ? 'opacity-100' : 'opacity-70')}
                disabled={!isMusicEnabled}
              />
            )}
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center text-lg text-gray-400 font-code">
        <p>[UP/DOWN] to navigate/adjust. [A] to toggle.</p>
        <p>[B] or [ESC] to go back.</p>
      </div>
    </div>
  );
}
