
import React from 'react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/hooks/useLocalization';
import { LockerRoomNesBackground } from './LockerRoomNesBackground';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
}

interface MainMenuProps {
  menuItems: MenuItem[];
  selectedItem: number;
}

export default function MainMenu({ menuItems, selectedItem }: MainMenuProps) {
  const { t } = useLocalization();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 relative overflow-hidden">
       <div className="absolute inset-0 z-0 opacity-20">
        <LockerRoomNesBackground />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-headline text-primary mb-4 sm:mb-6 md:mb-8" 
          style={{textShadow: '0 0 10px hsl(var(--primary))'}}
          tabIndex={-1}
          aria-label="Fadel Muhamad Rifai Portfolio"
        >
          FADEL MUHAMAD RIFAI
        </h1>
        <ul className="space-y-2 sm:space-y-3 md:space-y-4 w-full max-w-xs sm:max-w-sm md:max-w-md">
          {menuItems.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                'flex items-center gap-2 sm:gap-3 md:gap-4 text-base sm:text-xl md:text-2xl font-headline transition-all duration-200 py-1 px-2 sm:py-2 sm:px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent',
                selectedItem === index ? 'text-accent scale-105 bg-primary/10' : 'text-gray-300 hover:text-accent'
              )}
              role="menuitem"
              aria-selected={selectedItem === index}
              tabIndex={-1}
            >
              <div className={cn(
                "transition-opacity duration-200 w-5 sm:w-6 md:w-8 flex-shrink-0",
                selectedItem === index ? 'opacity-100 animate-blink' : 'opacity-50'
              )}>
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </div>
              <span className="truncate">{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 sm:mt-4 md:mt-6 text-center text-xs sm:text-sm md:text-base text-gray-400 font-code">
          <p>{t('mainMenu.controls.navigate')}</p>
          <p>{t('mainMenu.controls.select')}</p>
        </div>
      </div>
    </div>
  );
}
