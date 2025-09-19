
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Globe, Github, ArrowLeft } from 'lucide-react';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/hooks/useLocalization';
import { Badge } from '@/components/ui/badge';
import { AgendaNesBackground } from './AgendaNesBackground';

const backToMainEvent = new Event('backToMain', { bubbles: true });

interface Project {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  imageHint: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
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
    const buttons: { id: string; url: string | null }[] = [];
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
    const title = project.title;
    return (
      <div className="w-full h-full flex flex-col p-1 sm:p-2 md:p-3 text-white animate-pixel-in relative">
        <div className="absolute inset-0 z-0 opacity-20">
            <AgendaNesBackground />
        </div>
        <div className='relative z-10 flex flex-col h-full'>
            <div className="flex items-center mb-1 sm:mb-2 md:mb-3 flex-shrink-0">
            <Button 
              ref={el => { if (el) {detailItemRefs.current[0] = el;} }} 
              variant="ghost" 
              size="icon" 
              className={cn("mr-1 sm:mr-2 md:mr-3 text-accent hover:bg-accent/20 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent", selectedDetailButton === 0 ? 'ring-2 ring-accent' : '')}
              aria-label={t('controls.bBack')}
            >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Button>
            <h1 className="text-base sm:text-lg md:text-xl font-headline text-primary truncate">{title}</h1>
            </div>
            <ScrollArea className="flex-grow pr-1 sm:pr-2">
            <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4">
                <div className={cn("w-full md:w-1/2 flex-shrink-0 rounded-md", selectedDetailButton === 1 ? 'ring-2 ring-primary' : '')}>
                <Image 
                    ref={el => { if (el) {detailItemRefs.current[1] = el;} }}
                    src={project.imageUrl}
                    alt={`${title} project image`}
                    width={600}
                    height={400}
                    className="rounded-md border border-primary/50 object-cover w-full h-auto"
                    data-ai-hint={project.imageHint}
                    loading="lazy"
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                />
                </div>
                <div className="w-full md:w-1/2 flex flex-col">
                <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-2 sm:mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                    {project.technologies.map(tech => (
                        <Badge key={tech} variant="secondary" className="text-xs sm:text-sm">{tech}</Badge>
                    ))}
                </div>
                <p className="text-xs sm:text-sm text-accent font-code mb-3 sm:mb-4">{t('projects.created')}: {project.date}</p>
                <div className="flex flex-col gap-1 sm:gap-2 mt-auto">
                    {project.liveUrl && (
                    <Button 
                      ref={el => { if (el) {detailItemRefs.current[buttonIndex++] = el;} }} 
                      asChild 
                      className={cn(
                        "w-full bg-primary text-primary-foreground font-headline text-xs py-1 sm:py-2 pointer-events-none focus:outline-none focus:ring-2 focus:ring-white", 
                        selectedDetailButton === detailButtons.findIndex(b => b.id === 'live') ? 'ring-2 ring-white bg-primary/90' : ''
                      )}
                      aria-label={`${t('projects.visitWebsite')} ${title}`}
                    >
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
                        <Globe className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">{t('projects.visitWebsite')}</span>
                        </a>
                    </Button>
                    )}
                    {project.githubUrl && (
                    <Button 
                      ref={el => { if (el) {detailItemRefs.current[buttonIndex++] = el;} }} 
                      asChild 
                      variant="outline" 
                      className={cn(
                        "w-full font-headline border-accent text-accent text-xs py-1 sm:py-2 pointer-events-none focus:outline-none focus:ring-2 focus:ring-accent", 
                        selectedDetailButton === detailButtons.findIndex(b => b.id === 'github') ? 'ring-2 ring-accent bg-accent text-accent-foreground' : ''
                      )}
                      aria-label={`View ${title} on GitHub`}
                    >
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
                        <Github className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">GitHub</span>
                        </a>
                    </Button>
                    )}
                </div>
                </div>
            </div>
            </ScrollArea>
            <div className="mt-1 sm:mt-2 text-center text-xs text-gray-400 font-code flex-shrink-0">
            <p>{t('projects.controls.detail.navigate')}</p>
            <p>{t('projects.controls.detail.back')}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-1 sm:p-2 md:p-3 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
            <AgendaNesBackground />
        </div>
        <div className="relative z-10 flex flex-col h-full">
            <h1 className="text-lg sm:text-xl md:text-2xl font-headline text-primary mb-1 sm:mb-2 md:mb-3 text-center">{t('projects.title')}</h1>
            <ScrollArea className="flex-grow">
                <ul className="space-y-1 text-xs sm:text-sm md:text-base font-headline pr-1 sm:pr-2">
                {projects.map((proj, index) => (
                    <li 
                    key={proj.title}
                    ref={el => {if(el) itemRefs.current[index] = el}}
                    className={cn(
                        "flex justify-between items-center p-1 border-b border-dashed border-gray-700 transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-accent",
                        selectedItem === index ? "bg-primary/20 text-accent" : ""
                    )}
                    role="option"
                    aria-selected={selectedItem === index}
                    tabIndex={-1}
                    >
                    <span className="truncate pr-1 sm:pr-2 text-xs sm:text-sm">{proj.title}</span>
                    <span className="font-code text-accent text-opacity-80 text-xs flex-shrink-0">{proj.date}</span>
                    </li>
                ))}
                </ul>
            </ScrollArea>
            <div className="mt-1 sm:mt-2 text-center text-xs text-gray-400 font-code">
                <p>{t('projects.controls.list.navigate')}</p>
                <p>{t('projects.controls.list.back')}</p>
            </div>
        </div>
    </div>
  );
}
