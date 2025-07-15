
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Globe, Github, ArrowLeft } from 'lucide-react';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const projects = [
  { 
    title: 'Tanma', 
    date: '2024-05-01',
    description: 'An application about daily reports at my workplace (reliance insurance) to simplify reporting that can be exported and display graphs for an analysis if needed. there are additional tools to support work such as meeting minutes, user management, chat rooms, PDF tools (merging, selection), and separate bills manually.',
    imageUrl: '/project/tanma.png',
    imageHint: 'Daily Report Claim',
    liveUrl: 'https://mentanma.cyou',
    githubUrl: 'https://github.com/faaadelmr/tanma'
  },
  { 
    title: 'cewe(k)alcer', 
    date: '2024-06-09',
    description: 'application to provide affiliate links with the main feature of QR Code and can add 3 links (Shopee, TiktokShop, Tokopedia).',
    imageUrl: '/project/cewekalcer.png',
    imageHint: 'CewekKalcer',
    liveUrl: 'https://cewekalcer.pages.dev/',
  },
  { 
    title: 'bayarGess', 
    date: '2025-07-12',
    description: 'A separate billing app that uses AI for receipt reading and item sharing. perfect for those of you who are bothered to share the cost of food with friends.',
    imageUrl: '/project/bayargess.png',
    imageHint: 'splitbill sharing',
    liveUrl: 'https://bayargess.vercel.app/',
    githubUrl: 'https://github.com/faaadelmr/bayarGess.git'
  },
];

const backToMainEvent = new Event('backToMain', { bubbles: true });

export default function ProjectList() {
  const [selectedItem, setSelectedItem] = useState(0);
  const [viewingProjectIndex, setViewingProjectIndex] = useState<number | null>(null);
  const [selectedDetailButton, setSelectedDetailButton] = useState(0);
  const { playNavigate, playSelect, playBack } = useArcadeSounds();

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const detailItemRefs = useRef<(HTMLElement | null)[]>([]);
  
  const project = viewingProjectIndex !== null ? projects[viewingProjectIndex] : null;

  const detailButtons = React.useMemo(() => {
    const buttons = [];
    if (!project) return buttons;
    buttons.push({ id: 'back', url: null });
    buttons.push({ id: 'image', url: project.imageUrl });
    if (project.liveUrl) buttons.push({ id: 'live', url: project.liveUrl });
    if (project.githubUrl) buttons.push({ id: 'github', url: project.githubUrl });
    return buttons;
  }, [project]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, projects.length);
    detailItemRefs.current = detailItemRefs.current.slice(0, detailButtons.length);
  }, [detailButtons.length]);

  useEffect(() => {
    if (viewingProjectIndex === null && itemRefs.current[selectedItem]) {
      itemRefs.current[selectedItem]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedItem, viewingProjectIndex]);
  
  useEffect(() => {
    if (viewingProjectIndex !== null) {
      const element = detailItemRefs.current[selectedDetailButton];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedDetailButton, viewingProjectIndex]);
  
  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    if (viewingProjectIndex !== null) return;
    playNavigate();
    setSelectedItem(prev => {
      const newIndex = direction === 'up' ? prev - 1 : prev + 1;
      return (newIndex + projects.length) % projects.length;
    });
  }, [viewingProjectIndex, playNavigate]);

  const handleDetailNavigation = useCallback((direction: 'up' | 'down') => {
    if (viewingProjectIndex === null) return;
    playNavigate();
    setSelectedDetailButton(prev => {
      const newIndex = direction === 'up' ? prev - 1 : prev + 1;
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
  
  const handleBackToMain = useCallback(() => {
    playBack();
    window.dispatchEvent(backToMainEvent);
  }, [playBack]);

  const handleSelectDetail = useCallback(() => {
    if (viewingProjectIndex === null) return;
    playSelect();

    const selectedButton = detailButtons[selectedDetailButton];

    if (selectedButton.id === 'back') {
        handleBackToList();
        return;
    }

    if (selectedButton.url) {
        window.open(selectedButton.url, '_blank');
    }
  }, [viewingProjectIndex, selectedDetailButton, playSelect, handleBackToList, detailButtons]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let keyHandled = false;
      if (viewingProjectIndex !== null) {
        switch (e.key.toLowerCase()) {
          case 'arrowup':
            handleDetailNavigation('up');
            keyHandled = true;
            break;
          case 'arrowdown':
            handleDetailNavigation('down');
            keyHandled = true;
            break;
          case 'a':
          case 'enter':
          case 's':
            handleSelectDetail();
            keyHandled = true;
            break;
          case 'b':
          case 'backspace':
          case 'escape':
            handleBackToList();
            keyHandled = true;
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'arrowup':
            handleNavigation('up');
            keyHandled = true;
            break;
          case 'arrowdown':
            handleNavigation('down');
            keyHandled = true;
            break;
          case 'a':
          case 'enter':
          case 's':
            handleSelectProject();
            keyHandled = true;
            break;
          case 'b':
          case 'backspace':
          case 'escape':
            handleBackToMain();
            keyHandled = true;
            break;
        }
      }
      if (keyHandled) e.preventDefault();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewingProjectIndex, handleNavigation, handleSelectProject, handleBackToMain, handleBackToList, handleDetailNavigation, handleSelectDetail]);


  if (project) {
    let buttonIndex = 2; // Start after back and image
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-6 md:p-8 text-white animate-pixel-in">
        <div className="flex items-center mb-4 flex-shrink-0">
           <Button ref={el => detailItemRefs.current[0] = el} variant="ghost" size="icon" onClick={handleBackToList} className={cn("mr-4 text-accent hover:bg-accent/20 hover:text-accent", selectedDetailButton === 0 ? 'ring-2 ring-accent' : '')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline text-primary truncate">{project.title}</h1>
        </div>
        <ScrollArea className="flex-grow pr-2">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className={cn("w-full md:w-1/2 flex-shrink-0 rounded-lg", selectedDetailButton === 1 ? 'ring-2 ring-primary' : '')}>
              <Image 
                ref={el => detailItemRefs.current[1] = el as HTMLImageElement}
                src={project.imageUrl}
                alt={project.title}
                width={600}
                height={400}
                className="rounded-lg border-2 border-primary/50 object-cover w-full h-auto"
                data-ai-hint={project.imageHint}
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col">
              <p className="text-base sm:text-lg text-gray-300 mb-4">{project.description}</p>
              <p className="text-sm text-accent font-code mb-6">Created: {project.date}</p>
              <div className="flex flex-col gap-4 mt-auto">
                {project.liveUrl && (
                  <Button ref={el => detailItemRefs.current[buttonIndex++] = el} asChild className={cn("w-full bg-primary text-primary-foreground font-headline text-sm sm:text-base", selectedDetailButton === detailButtons.findIndex(b => b.id === 'live') ? 'ring-2 ring-white bg-primary/90' : '')}>
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1} onClick={(e) => { e.preventDefault(); if(project.liveUrl) window.open(project.liveUrl, '_blank') }}>
                      <Globe className="mr-2 h-5 w-5" />
                      Visit Website
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button ref={el => detailItemRefs.current[buttonIndex++] = el} asChild variant="outline" className={cn("w-full font-headline border-accent text-accent text-sm sm:text-base", selectedDetailButton === detailButtons.findIndex(b => b.id === 'github') ? 'ring-2 ring-accent bg-accent text-accent-foreground' : '')}>
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1} onClick={(e) => { e.preventDefault(); if(project.githubUrl) window.open(project.githubUrl, '_blank') }}>
                      <Github className="mr-2 h-5 w-5" />
                      GitHub
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="mt-4 sm:mt-8 text-center text-sm sm:text-lg text-gray-400 font-code flex-shrink-0">
          <p>Use [ARROW KEYS] to select. [A] or [ENTER] to activate.</p>
          <p>[B] or [ESC] to go back to list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8 text-white">
      <h1 className="text-3xl sm:text-5xl font-headline text-primary mb-4 sm:mb-8 text-center">PROJECT LIST</h1>
      <ScrollArea className="flex-grow">
        <ul className="space-y-2 text-xl sm:text-2xl font-headline pr-4">
          {projects.map((proj, index) => (
            <li 
              key={proj.title}
              ref={el => itemRefs.current[index] = el}
              className={cn(
                "flex justify-between items-center p-2 border-b-2 border-dashed border-gray-700 transition-all duration-200 rounded-md",
                selectedItem === index ? "bg-primary/20 text-accent" : ""
              )}
            >
              <span className="truncate pr-4">{proj.title}</span>
              <span className="font-code text-accent text-opacity-80 text-base sm:text-xl flex-shrink-0">{proj.date}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="mt-4 sm:mt-8 text-center text-sm sm:text-lg text-gray-400 font-code">
        <p>Use [ARROW KEYS] to navigate. [A] or [ENTER] to select.</p>
        <p>[B] or [ESC] to go back to Main Menu.</p>
      </div>
    </div>
  );
}
