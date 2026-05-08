
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
  status?: 'active' | 'discontinued' | 'beta' | 'deprecated'; // Optional status field
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
    } catch (e) {
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
      const element = itemRefs.current[selectedItem];
      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
      element?.focus();
    }
  }, [selectedItem, viewingProjectIndex]);

  useEffect(() => {
    if (viewingProjectIndex !== null) {
      const element = detailItemRefs.current[selectedDetailButton];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
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

  const handleSelectProject = useCallback((index?: number) => {
    const targetIndex = index !== undefined ? index : selectedItem;
    if (viewingProjectIndex !== null) return;
    playSelect();
    setSelectedDetailButton(0); // Default to back button on entry
    setViewingProjectIndex(targetIndex);
  }, [viewingProjectIndex, selectedItem, playSelect]);

  const handleBackToList = useCallback(() => {
    playBack();
    setViewingProjectIndex(null);
  }, [playBack]);

  const handleBackToMain = useCallback(() => {
    playBack();
    window.dispatchEvent(backToMainEvent);
  }, [playBack]);

  const handleProjectClick = useCallback((index: number) => {
    setSelectedItem(index);
    handleSelectProject(index);
  }, [handleSelectProject]);

  const handleProjectHover = useCallback((index: number) => {
    if (index !== selectedItem) {
      playNavigate();
      setSelectedItem(index);
    }
  }, [selectedItem, playNavigate]);

  const handleDetailButtonClick = useCallback((index: number) => {
    setSelectedDetailButton(index);
    // Execute the action for the clicked button
    const selectedButton = detailButtons[index];
    if (selectedButton) {
      playSelect();
      if (selectedButton.id === 'back') {
        handleBackToList();
        return;
      }
      if (selectedButton.url) {
        window.open(selectedButton.url, '_blank');
      }
    }
  }, [detailButtons, playSelect, handleBackToList]);

  const handleDetailButtonHover = useCallback((index: number) => {
    if (index !== selectedDetailButton) {
      playNavigate();
      setSelectedDetailButton(index);
    }
  }, [selectedDetailButton, playNavigate]);

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
    const title = project.title;
    const liveIndex = detailButtons.findIndex(b => b.id === 'live');
    const githubIndex = detailButtons.findIndex(b => b.id === 'github');

    return (
      <div className="w-full h-full flex flex-col p-1 sm:p-2 md:p-3 text-white animate-pixel-in relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <AgendaNesBackground />
        </div>
        <div className='relative z-10 flex flex-col h-full overflow-hidden'>
          <div className="flex items-center mb-1 sm:mb-2 md:mb-3 flex-shrink-0">
            <Button
              ref={el => { if (el) { detailItemRefs.current[0] = el; } }}
              variant="ghost"
              size="icon"
              className={cn(
                "mr-1 sm:mr-2 md:mr-3 text-accent hover:bg-accent/20 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer", 
                selectedDetailButton === 0 ? 'ring-2 ring-accent bg-accent/10' : ''
              )}
              aria-label={t('controls.bBack')}
              onClick={() => handleDetailButtonClick(0)}
              onMouseEnter={() => handleDetailButtonHover(0)}
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Button>
            <h1 className="text-base sm:text-lg md:text-xl font-headline text-primary truncate flex-1">{title}</h1>
          </div>

          <ScrollArea className="flex-grow pr-1 sm:pr-2">
            <div className="flex flex-col gap-3 sm:gap-4 pb-4">
              <div 
                className={cn(
                  "w-full rounded-md overflow-hidden border border-primary/30 transition-all duration-200 cursor-pointer", 
                  selectedDetailButton === 1 ? 'ring-4 ring-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'hover:border-primary/60'
                )}
                onClick={() => handleDetailButtonClick(1)}
                onMouseEnter={() => handleDetailButtonHover(1)}
              >
                <div className="relative aspect-video w-full">
                  <Image
                    ref={el => { if (el) { detailItemRefs.current[1] = el as any; } }}
                    src={project.imageUrl}
                    alt={`${title} project image`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    data-ai-hint={project.imageHint}
                    loading="lazy"
                    quality={90}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                  />
                  {project.status && (
                    <span
                      className={cn(
                        "absolute top-2 right-2 px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wide transform -rotate-12 z-20",
                        project.status === 'discontinued'
                          ? 'bg-red-900/80 text-red-100 border border-red-500'
                          : 'bg-blue-900/80 text-blue-100 border border-blue-500'
                      )}
                    >
                      {t(`projects.status.${project.status}`)}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                    <span className="text-[10px] font-code text-white bg-black/40 px-2 py-1 rounded">{t('projects.controls.detail.navigate')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-black/40 p-3 rounded-lg border border-primary/10 shadow-inner">
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed">{project.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {project.technologies.map(tech => (
                    <Badge key={tech} variant="secondary" className="text-[10px] sm:text-xs font-code py-0 px-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between py-2 border-y border-primary/10">
                  <span className="text-[10px] sm:text-xs text-accent font-code opacity-80">{t('projects.created')}</span>
                  <span className="text-[10px] sm:text-xs text-white font-code font-bold bg-primary/20 px-2 py-0.5 rounded">{project.date}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {project.liveUrl && liveIndex !== -1 && (
                    <Button
                      ref={el => { if (el) { detailItemRefs.current[liveIndex] = el; } }}
                      className={cn(
                        "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-xs py-4 sm:py-5 cursor-pointer transition-all",
                        selectedDetailButton === liveIndex ? 'ring-4 ring-white scale-[1.02] z-10' : ''
                      )}
                      aria-label={`${t('projects.visitWebsite')} ${title}`}
                      onClick={() => handleDetailButtonClick(liveIndex)}
                      onMouseEnter={() => handleDetailButtonHover(liveIndex)}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm uppercase tracking-wider">{t('projects.visitWebsite')}</span>
                    </Button>
                  )}
                  {project.githubUrl && githubIndex !== -1 && (
                    <Button
                      ref={el => { if (el) { detailItemRefs.current[githubIndex] = el; } }}
                      variant="outline"
                      className={cn(
                        "w-full font-headline border-accent text-accent hover:bg-accent hover:text-accent-foreground text-xs py-4 sm:py-5 cursor-pointer transition-all",
                        selectedDetailButton === githubIndex ? 'ring-4 ring-accent bg-accent/20 scale-[1.02] z-10' : ''
                      )}
                      aria-label={`View ${title} on GitHub`}
                      onClick={() => handleDetailButtonClick(githubIndex)}
                      onMouseEnter={() => handleDetailButtonHover(githubIndex)}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm uppercase tracking-wider">GitHub</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="mt-auto pt-2 text-center text-[10px] text-gray-400 font-code flex-shrink-0 border-t border-primary/10">
            <p className="flex justify-center gap-4">
              <span>↑↓ {t('projects.controls.detail.navigate')}</span>
              <span>[B/ESC] {t('projects.controls.detail.back')}</span>
            </p>
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
                ref={el => { if (el) itemRefs.current[index] = el }}
                className={cn(
                  "flex justify-between items-center p-1 border-b border-dashed border-gray-700 transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer select-none",
                  selectedItem === index ? "bg-primary/20 text-accent" : "hover:bg-primary/10"
                )}
                role="option"
                aria-selected={selectedItem === index}
                tabIndex={0}
                onClick={() => handleProjectClick(index)}
                onMouseEnter={() => handleProjectHover(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProjectClick(index);
                  }
                }}
              >
                <div className="flex items-center">
                  <span className="truncate text-xs sm:text-sm pr-1">{proj.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {proj.status && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wide transform -rotate-12 ${proj.status === 'discontinued'
                        ? 'bg-red-900/60 text-red-200 border border-red-600/50'
                        : 'bg-blue-900/60 text-blue-200 border border-blue-600/50'
                        }`}
                    >
                      {t(`projects.status.${proj.status}`)}
                    </span>
                  )}
                  <span className="font-code text-accent text-opacity-80 text-xs flex-shrink-0">{proj.date}</span>
                </div>
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
