
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import useBackgroundMusic from '@/hooks/useBackgroundMusic';
import { Slider } from '@/components/ui/slider';
import { Volume1, Volume2, VolumeX, Languages } from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';
import { ScrollArea } from '@/components/ui/scroll-area';
import useSoundSettings from '@/hooks/useSoundSettings';
import { useVisualSettings } from '@/hooks/useVisualSettings';

const backToMainEvent = new Event('backToMain', { bubbles: true });

export default function SettingsPage() {
  const [selectedItem, setSelectedItem] = useState(0);
  const [isVolumeEditing, setIsVolumeEditing] = useState(false);
  
  const { isMusicEnabled, toggleMusic, volume, setVolume, isInitialized: isMusicInitialized } = useBackgroundMusic();
  const { isSoundEnabled, toggleSound, isInitialized: isSoundInitialized } = useSoundSettings();
  const { isScanlinesEnabled, toggleScanlines, isInitialized: isVisualInitialized } = useVisualSettings();
  
  const { playNavigate, playSelect, playBack } = useArcadeSounds({ isSoundEnabled });
  const { t, language, setLanguage, isLoading: isLangLoading } = useLocalization();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'id' : 'en';
    setLanguage(newLang);
  };
  
  const settings = [
    { id: 'language', label: t('settings.language'), value: language.toUpperCase(), onToggle: toggleLanguage, type: 'toggle' },
    { id: 'music', label: t('settings.music'), onToggle: toggleMusic, isEnabled: isMusicEnabled, type: 'switch' },
    { id: 'volume', label: t('settings.volume'), type: 'slider', value: volume * 100, onValueChange: (newVolume: number) => setVolume(newVolume / 100) },
    { id: 'sound', label: t('settings.soundFx'), onToggle: toggleSound, isEnabled: isSoundEnabled, type: 'switch' },
    { id: 'scanlines', label: t('settings.scanlines'), onToggle: toggleScanlines, isEnabled: isScanlinesEnabled, type: 'switch' },
  ];

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, settings.length);
  }, [settings.length]);

  useEffect(() => {
    if (itemRefs.current[selectedItem] && !isVolumeEditing) {
      itemRefs.current[selectedItem]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedItem]);

  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    if (isVolumeEditing) return;
    playNavigate();
    setSelectedItem(prev => {
      const newIndex = direction === 'up' ? prev - 1 : prev + 1;
      return (newIndex + settings.length) % settings.length;
    });
  }, [playNavigate, settings.length, isVolumeEditing]);

  const handleSelect = useCallback(() => {
    const currentSetting = settings[selectedItem];
    playSelect();

    if (currentSetting.type === 'switch' && currentSetting.onToggle) {
        currentSetting.onToggle();
    } else if (currentSetting.type === 'toggle' && currentSetting.onToggle) {
        currentSetting.onToggle();
    } else if (currentSetting.type === 'slider') {
        setIsVolumeEditing(prev => !prev);
    }
  }, [selectedItem, playSelect, settings]);


  const handleSliderChange = useCallback((direction: 'up' | 'down') => {
    const currentSetting = settings[selectedItem];
    if (currentSetting.type !== 'slider' || !isVolumeEditing) return;
    
    playNavigate();
    const currentValue = typeof currentSetting.value === 'number' ? currentSetting.value : 0;
    const step = 5;
    const newValue = direction === 'down' 
      ? Math.max(0, currentValue - step)
      : Math.min(100, currentValue + step);
    
    if (currentSetting.onValueChange) {
      currentSetting.onValueChange(newValue);
    }
  }, [selectedItem, settings, playNavigate, isVolumeEditing]);

  const handleBack = useCallback(() => {
    if (isVolumeEditing) {
        setIsVolumeEditing(false);
        playBack();
        return;
    }
    playBack();
    window.dispatchEvent(backToMainEvent);
  }, [playBack, isVolumeEditing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      switch (e.key.toLowerCase()) {
        case 'arrowup':
          if (isVolumeEditing) {
              handleSliderChange('up');
          } else {
              handleNavigation('up');
          }
          break;
        case 'arrowdown':
          if (isVolumeEditing) {
            handleSliderChange('down');
          } else {
            handleNavigation('down');
          }
          break;
        case 'a':
        case 'enter':
        case 's':
          handleSelect();
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
  }, [handleNavigation, handleSelect, handleBack, handleSliderChange, isVolumeEditing]);

  const getVolumeIcon = () => {
    if (volume === 0 || !isMusicEnabled) return <VolumeX className="w-6 h-6" />;
    if (volume < 0.5) return <Volume1 className="w-6 h-6" />;
    return <Volume2 className="w-6 h-6" />;
  }

  if (!isMusicInitialized || !isSoundInitialized || !isVisualInitialized) {
    return null; // Prevent hydration mismatch
  }
  
  const PageContent = () => (
    <div className="w-full h-full flex flex-col p-8 text-white">
      <h1 className="text-5xl font-headline text-primary mb-8 text-center flex-shrink-0">{t('settings.title')}</h1>
      <ScrollArea className="flex-grow pr-4 -mr-4">
        <ul className="space-y-6 text-2xl font-headline max-w-md mx-auto w-full">
          {settings.map((setting, index) => (
            <li 
              key={setting.id}
              ref={el => { if(el) itemRefs.current[index] = el; }}
              className={cn(
                  "flex justify-between items-center p-2 rounded-md transition-colors",
                  selectedItem === index && !isVolumeEditing ? 'bg-primary/20' : ''
              )}
            >
              <Label 
                  htmlFor={setting.id} 
                  className={cn(
                      "text-2xl font-headline flex items-center gap-4 pointer-events-none",
                      selectedItem === index ? 'text-accent' : 'text-white'
                  )}
              >
                  {setting.id === 'volume' && getVolumeIcon()}
                  {setting.id === 'language' && <Languages className="w-6 h-6" />}
                  {setting.label}
              </Label>
              {setting.type === 'switch' && 'isEnabled' in setting && (
                <Switch 
                  id={setting.id} 
                  checked={setting.isEnabled}
                  className="pointer-events-none"
                  disabled={(setting.id === 'sound' && !isSoundInitialized) || (setting.id === 'scanlines' && !isVisualInitialized)}
                />
              )}
              {setting.type === 'toggle' && 'value' in setting && typeof setting.value === 'string' && (
                <button className="text-2xl font-headline text-accent w-[50%] text-right pointer-events-none">
                  {setting.value}
                </button>
              )}
              {setting.type === 'slider' && 'value' in setting && (
                 <div className="flex items-center gap-4 w-[50%] pointer-events-none">
                    <Slider
                      id={setting.id}
                      value={[typeof setting.value === 'number' ? setting.value : 0]}
                      max={100}
                      step={1}
                      className={cn('flex-grow', (selectedItem === index && isVolumeEditing) ? 'ring-2 ring-primary rounded-lg' : '')}
                      disabled={!isMusicEnabled}
                    />
                    <span className={cn(
                      "text-xl text-right font-code w-10 transition-opacity",
                      (selectedItem === index && isVolumeEditing) ? "opacity-100" : "opacity-0"
                    )}>
                      {Math.round(typeof setting.value === 'number' ? setting.value : 0)}
                    </span>
                  </div>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="mt-4 sm:mt-8 text-center text-sm sm:text-lg text-gray-400 font-code">
        <p>{t('settings.controls.navigate')}</p>
        <p>{t('settings.controls.back')}</p>
      </div>
    </div>
  );

  return isLangLoading ? (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-white animate-pixel-in">
          <p className="text-3xl font-headline text-accent animate-pulse">{t('loading')}</p>
      </div>
  ) : <PageContent />;
}
