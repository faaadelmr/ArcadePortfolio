
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
  onItemClick?: (index: number) => void;
  onItemHover?: (index: number) => void;
}

export default function MainMenu({ menuItems, selectedItem, onItemClick, onItemHover }: MainMenuProps) {
  const { t } = useLocalization();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-3 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <LockerRoomNesBackground />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full">
        <h1
          className="text-xl sm:text-2xl md:text-3xl font-headline text-primary mb-3 sm:mb-4"
          style={{ textShadow: '0 0 10px hsl(var(--primary))' }}
          tabIndex={-1}
          aria-label="Fadel Muhamad Rifai Portfolio"
        >
          FADEL MUHAMAD RIFAI
        </h1>
        <ul className="space-y-1.5 sm:space-y-2 w-full max-w-[280px] sm:max-w-xs">
          {menuItems.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                'flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-headline transition-all duration-200 py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer select-none',
                selectedItem === index
                  ? 'text-accent scale-105 bg-primary/10'
                  : 'text-gray-300 hover:text-accent hover:bg-primary/5 hover:scale-102'
              )}
              role="menuitem"
              aria-selected={selectedItem === index}
              tabIndex={0}
              onClick={() => onItemClick?.(index)}
              onMouseEnter={() => onItemHover?.(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onItemClick?.(index);
                }
              }}
            >
              <div className={cn(
                "transition-opacity duration-200 w-4 sm:w-5 flex-shrink-0",
                selectedItem === index ? 'opacity-100 animate-blink' : 'opacity-50'
              )}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="truncate">{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-gray-500 font-code">
          <p>{t('mainMenu.controls.navigate')}</p>
          <p>{t('mainMenu.controls.select')}</p>
        </div>
      </div>
    </div>
  );
}
