
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Globe, Github, ArrowLeft } from 'lucide-react';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { cn } from '@/lib/utils';

interface PageProps {
  onBack: () => void;
}

const projects = [
  { 
    title: 'Tanma', 
    date: '2023-10-26',
    description: 'A comprehensive platform for farmers to manage their crops, get weather forecasts, and connect with a community of agricultural experts.',
    imageUrl: 'https://placehold.co/600x400',
    imageHint: 'agriculture technology',
    liveUrl: '#',
    githubUrl: '#'
  },
  { 
    title: 'cewe(k)alcer', 
    date: '2024-01-15',
    description: 'An awareness and support application for cervical cancer, providing information, community forums, and resources for early detection.',
    imageUrl: 'https://placehold.co/600x400',
    imageHint: 'health app',
    liveUrl: '#',
    githubUrl: '#'
  },
  { 
    title: 'bayarGess', 
    date: '2024-05-20',
    description: 'A streamlined payment and invoicing solution for freelancers and small businesses, making it easy to track payments and manage finances.',
    imageUrl: 'https://placehold.co/600x400',
    imageHint: 'finance payment',
    liveUrl: '#',
    githubUrl: '#'
  },
];

export default function ProjectList({ onBack }: PageProps) {
  const [selectedItem, setSelectedItem] = useState(0);
  const [viewingProjectIndex, setViewingProjectIndex] = useState<number | null>(null);
  const [selectedDetailButton, setSelectedDetailButton] = useState(0);
  const { playNavigate, playSelect, playBack } = useArcadeSounds();

  const websiteButtonRef = useRef<HTMLAnchorElement>(null);
  const githubButtonRef = useRef<HTMLAnchorElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);

  const detailButtons = [backButtonRef, websiteButtonRef, githubButtonRef];

  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    if (viewingProjectIndex !== null) return;
    playNavigate();
    setSelectedItem(prev => {
      const newIndex = direction === 'up' ? prev - 1 : prev + 1;
      return (newIndex + projects.length) % projects.length;
    });
  }, [viewingProjectIndex, playNavigate]);

  const handleDetailNavigation = useCallback((direction: 'left' | 'right') => {
    if (viewingProjectIndex === null) return;
    playNavigate();
    setSelectedDetailButton(prev => {
      const newIndex = direction === 'right' ? prev + 1 : prev - 1;
      return (newIndex + detailButtons.length) % detailButtons.length;
    });
  }, [viewingProjectIndex, playNavigate, detailButtons.length]);
  
  const handleSelectProject = useCallback(() => {
    if (viewingProjectIndex !== null) return;
    playSelect();
    setSelectedDetailButton(0); // Default to back button on entry
    setViewingProjectIndex(selectedItem);
  }, [viewingProjectIndex, selectedItem, playSelect]);
  
  const handleBackToList = useCallback(() => {
    playBack();
    setViewingProjectIndex(null);
  }, [playBack]);

  const handleSelectDetail = useCallback(() => {
    if (viewingProjectIndex === null) return;
    playSelect();
    const currentButtonRef = detailButtons[selectedDetailButton]?.current;
    if (currentButtonRef) {
      currentButtonRef.click();
    }
  }, [viewingProjectIndex, selectedDetailButton, playSelect, detailButtons]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (viewingProjectIndex !== null) {
        switch (e.key.toLowerCase()) {
          case 'arrowleft':
            handleDetailNavigation('left');
            break;
          case 'arrowright':
            handleDetailNavigation('right');
            break;
          case 'a':
          case 'enter':
          case 's':
            handleSelectDetail();
            break;
          case 'b':
          case 'backspace':
          case 'escape':
            handleBackToList();
            break;
        }
      } else {
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
            handleSelectProject();
            break;
          case 'b':
          case 'backspace':
          case 'escape':
            onBack();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewingProjectIndex, handleNavigation, handleSelectProject, onBack, handleBackToList, handleDetailNavigation, handleSelectDetail]);


  const project = viewingProjectIndex !== null ? projects[viewingProjectIndex] : null;

  if (project) {
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-8 text-white animate-pixel-in">
        <div className="flex items-center mb-4">
           <Button ref={backButtonRef} variant="ghost" size="icon" onClick={handleBackToList} className={cn("mr-4 text-accent hover:bg-accent/20 hover:text-accent", selectedDetailButton === 0 ? 'ring-2 ring-accent' : '')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-4xl sm:text-5xl font-headline text-primary">{project.title}</h1>
        </div>
        <div className="flex-grow flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <Image 
              src={project.imageUrl}
              alt={project.title}
              width={600}
              height={400}
              className="rounded-lg border-2 border-primary/50"
              data-ai-hint={project.imageHint}
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col">
            <p className="text-lg text-gray-300 mb-4">{project.description}</p>
            <p className="text-sm text-accent font-code mb-6">Created: {project.date}</p>
            <div className="flex gap-4 mt-auto">
              <a ref={websiteButtonRef} href={project.liveUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
                <Button asChild className={cn("bg-primary hover:bg-primary/90 text-primary-foreground font-headline", selectedDetailButton === 1 ? 'ring-2 ring-primary' : '')}>
                  <span>
                    <Globe className="mr-2 h-5 w-5" />
                    Visit Website
                  </span>
                </Button>
              </a>
              <a ref={githubButtonRef} href={project.githubUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
                <Button asChild variant="outline" className={cn("font-headline border-accent text-accent hover:bg-accent hover:text-accent-foreground", selectedDetailButton === 2 ? 'ring-2 ring-accent' : '')}>
                  <span>
                    <Github className="mr-2 h-5 w-5" />
                    GitHub
                  </span>
                </Button>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-lg text-gray-400 font-code">
          <p>Use [ARROW KEYS] to select buttons. [A] or [ENTER] to click.</p>
          <p>[B] or [ESC] to go back to list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-8 text-white">
      <h1 className="text-5xl font-headline text-primary mb-8 text-center">PROJECT LIST</h1>
      <ul className="flex-grow space-y-2 text-2xl font-headline">
        {projects.map((proj, index) => (
          <li 
            key={proj.title}
            className={cn(
              "flex justify-between items-center p-2 border-b-2 border-dashed border-gray-700 transition-all duration-200",
              selectedItem === index ? "bg-primary/20 text-accent" : ""
            )}
          >
            <span>{proj.title}</span>
            <span className="font-code text-accent text-opacity-80">{proj.date}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center text-lg text-gray-400 font-code">
        <p>Use [ARROW KEYS] to navigate. [A] or [ENTER] to select.</p>
        <p>[B] or [ESC] to go back to Main Menu.</p>
      </div>
    </div>
  );
}
