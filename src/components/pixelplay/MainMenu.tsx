
import React from 'react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/hooks/useLocalization';

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
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-headline text-primary mb-12" style={{textShadow: '0 0 10px hsl(var(--primary))'}}>FADEL MUHAMAD RIFAI</h1>
      <ul className="space-y-6">
        {menuItems.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              'flex items-center gap-4 text-2xl font-headline transition-all duration-200',
              selectedItem === index ? 'text-accent scale-110' : 'text-gray-500'
            )}
          >
            <div className={cn(
              "transition-opacity duration-200 w-8",
              selectedItem === index ? 'opacity-100 animate-pulse' : 'opacity-0'
            )}>
              <item.icon className="w-8 h-8" />
            </div>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      <div className="mt-16 text-center text-sm text-gray-400 font-code">
        <p>{t('mainMenu.controls.navigate')}</p>
        <p>{t('mainMenu.controls.select')}</p>
      </div>
    </div>
  );
}
