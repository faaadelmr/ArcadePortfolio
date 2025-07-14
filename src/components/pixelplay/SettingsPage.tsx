'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: PageProps) {
  const settings = [
    { id: 'sound', label: 'Sound FX', defaultChecked: true },
    { id: 'music', label: 'Music', defaultChecked: false },
    { id: 'scanlines', label: 'Scanline Effect', defaultChecked: true },
    { id: 'difficulty', label: 'Hard Mode', defaultChecked: false },
  ];
  return (
    <div className="w-full h-full flex flex-col p-8 text-white">
      <h1 className="text-5xl font-headline text-primary mb-8 text-center">SETTINGS</h1>
      <ul className="flex-grow space-y-6 text-2xl font-headline max-w-md mx-auto w-full">
        {settings.map(setting => (
          <li key={setting.id} className="flex justify-between items-center p-2 hover:bg-primary/20 rounded-md">
            <Label htmlFor={setting.id} className="text-2xl font-headline text-white cursor-pointer">{setting.label}</Label>
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
