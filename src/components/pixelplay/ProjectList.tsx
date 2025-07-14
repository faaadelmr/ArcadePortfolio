
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const { playNavigate, playSelect, playBack } = useArcadeSounds();

  const handleNavigation = useCallback((direction: 'up' | 'down') => {
    if (viewingProjectIndex !== null) return;
    playNavigate();
    setSelectedItem(prev => {
      const newIndex = direction === 'up' ? prev - 1 : prev + 1;
      return (newIndex + projects.length) % projects.length;
    });
  }, [viewingProjectIndex, playNavigate]);
  
  const handleSelectProject = useCallback(() => {
    if (viewingProjectIndex !== null) return;
    playSelect();
    setViewingProjectIndex(selectedItem);
  }, [viewingProjectIndex, selectedItem, playSelect]);
  
  const handleBackToList = useCallback(() => {
    playBack();
    setViewingProjectIndex(null);
  }, [playBack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (viewingProjectIndex !== null) {
        if (e.key.toLowerCase() === 'b' || e.key === 'Backspace' || e.key === 'Escape') {
          handleBackToList();
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
  }, [viewingProjectIndex, handleNavigation, handleSelectProject, onBack, handleBackToList]);


  const project = viewingProjectIndex !== null ? projects[viewingProjectIndex] : null;

  if (project) {
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-8 text-white animate-pixel-in">
        <div className="flex items-center mb-4">
           <Button variant="ghost" size="icon" onClick={handleBackToList} className="mr-4 text-accent hover:bg-accent/20 hover:text-accent">
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
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
                  <Globe className="mr-2 h-5 w-5" />
                  Visit Website
                </Button>
              </a>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="font-headline border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <Github className="mr-2 h-5 w-5" />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-lg text-gray-400 font-code">
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
            onClick={() => { setSelectedItem(index); handleSelectProject(); }}
            className={cn(
              "flex justify-between items-center p-2 border-b-2 border-dashed border-gray-700 hover:bg-primary/20 cursor-pointer transition-all duration-200",
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
