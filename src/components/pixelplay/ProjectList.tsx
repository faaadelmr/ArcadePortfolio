
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Globe, Github, ArrowLeft } from 'lucide-react';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/hooks/useLocalization';

const backToMainEvent = new Event('backToMain', { bubbles: true });

interface Project {
  titleKey: string;
  descriptionKey: string;
  date: string;
  imageUrl: string;
  imageHint: string;
  liveUrl?: string;
  githubUrl?: string;
}

export default function ProjectList() {
  const [selectedItem, setSelectedItem] = useState(0);
  const [viewingProjectIndex, setViewingProjectIndex] = useState<number | null>(null);
  const [selectedDetailButton, setSelectedDetailButton] = useState(0);
  const { playNavigate, playSelect, playBack } = useArcadeSounds();
  const { t } = useLocalization();

  const projects: Project[] = useMemo(() => {
    const projectData = t('projects.list');
    let parsedProjects: Project[] = [];
    try {
        if (typeof projectData === 'string' && projectData.startsWith('[')) {
             parsedProjects = JSON.parse(projectData);
        } else if (Array.isArray(projectData)) {
            parsedProjects = projectData;
        }
    } catch(e) {
        console.error("Could not parse projects data from localization file.", e);
        return [];
    }
    return parsedProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [t]);

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
  }, [detailButtons.length, projects.length]);

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
  }, [viewingProjectIndex, playNavigate, projects.length]);

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
    const title = t(project.titleKey);
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-6 md:p-8 text-white animate-pixel-in">
        <div className="flex items-center mb-4 flex-shrink-0">
           <Button ref={el => detailItemRefs.current[0] = el} variant="ghost" size="icon" onClick={handleBackToList} className={cn("mr-4 text-accent hover:bg-accent/20 hover:text-accent", selectedDetailButton === 0 ? 'ring-2 ring-accent' : '')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline text-primary truncate">{title}</h1>
        </div>
        <ScrollArea className="flex-grow pr-2">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className={cn("w-full md:w-1/2 flex-shrink-0 rounded-lg", selectedDetailButton === 1 ? 'ring-2 ring-primary' : '')}>
              <Image 
                ref={el => detailItemRefs.current[1] = el as HTMLImageElement}
                src={project.imageUrl}
                alt={title}
                width={600}
                height={400}
                className="rounded-lg border-2 border-primary/50 object-cover w-full h-auto"
                data-ai-hint={project.imageHint}
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col">
              <p className="text-base sm:text-lg text-gray-300 mb-4">{t(project.descriptionKey)}</p>
              <p className="text-sm text-accent font-code mb-6">{t('projects.created')}: {project.date}</p>
              <div className="flex flex-col gap-4 mt-auto">
                {project.liveUrl && (
                  <Button ref={el => detailItemRefs.current[buttonIndex++] = el} asChild className={cn("w-full bg-primary text-primary-foreground font-headline text-sm sm:text-base", selectedDetailButton === detailButtons.findIndex(b => b.id === 'live') ? 'ring-2 ring-white bg-primary/90' : '')}>
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1} onClick={(e) => { e.preventDefault(); if(project.liveUrl) window.open(project.liveUrl, '_blank') }}>
                      <Globe className="mr-2 h-5 w-5" />
                      {t('projects.visitWebsite')}
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
          <p>{t('projects.controls.detail.navigate')}</p>
          <p>{t('projects.controls.detail.back')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-8 text-white">
      <h1 className="text-3xl sm:text-5xl font-headline text-primary mb-4 sm:mb-8 text-center">{t('projects.title')}</h1>
      <ScrollArea className="flex-grow">
        <ul className="space-y-2 text-xl sm:text-2xl font-headline pr-4">
          {projects.map((proj, index) => (
            <li 
              key={proj.titleKey}
              ref={el => {if(el) itemRefs.current[index] = el}}
              className={cn(
                "flex justify-between items-center p-2 border-b-2 border-dashed border-gray-700 transition-all duration-200 rounded-md",
                selectedItem === index ? "bg-primary/20 text-accent" : ""
              )}
            >
              <span className="truncate pr-4">{t(proj.titleKey)}</span>
              <span className="font-code text-accent text-opacity-80 text-base sm:text-xl flex-shrink-0">{proj.date}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="mt-4 sm:mt-8 text-center text-sm sm:text-lg text-gray-400 font-code">
        <p>{t('projects.controls.list.navigate')}</p>
        <p>{t('projects.controls.list.back')}</p>
      </div>
    </div>
  );
}
