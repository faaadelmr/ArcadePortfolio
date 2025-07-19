
'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import useArcadeSounds from '@/hooks/useArcadeSounds';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/hooks/useLocalization';
import { AthleteStarNesBackground } from './AthleteStarNesBackground';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Mail, Send, Loader2 } from 'lucide-react';
import { useForm } from '@formspree/react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';

const backToMainEvent = new Event('backToMain', { bubbles: true });

export default function AboutMePage() {
  const { playBack, playNavigate, playSelect, playStart } = useArcadeSounds();
  const { t } = useLocalization();
  const { toast } = useToast();
  const [state, handleSubmit] = useForm('myzpzqbk');

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.succeeded) {
      toast({
        title: t('contact.toast.successTitle'),
        description: t('contact.toast.successDescription'),
      });
      // formspree resets the form on its own
    }
  }, [state.succeeded, t, toast]);
  
  const handleBack = useCallback(() => {
    playStart();
    window.dispatchEvent(backToMainEvent);
  }, [playStart]);

  const handleScroll = useCallback((direction: 'up' | 'down') => {
    if (scrollViewportRef.current) {
        playNavigate();
        const scrollAmount = direction === 'up' ? -50 : 50;
        scrollViewportRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  }, [playNavigate]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    playSelect();
    handleSubmit(e);
    
    // Manually clear the form for instant feedback
    const form = e.target as HTMLFormElement;
    if (form) {
        const nameInput = form.elements.namedItem('name') as HTMLInputElement;
        const emailInput = form.elements.namedItem('email') as HTMLInputElement;
        const messageTextarea = form.elements.namedItem('message') as HTMLTextAreaElement;
        
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (messageTextarea) messageTextarea.value = '';
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If we are focused on an input/textarea, let the user type.
      // Only the 'escape' key should have a special function.
      const targetElement = e.target as HTMLElement;
      if (targetElement && ['INPUT', 'TEXTAREA'].includes(targetElement.tagName)) {
        if (e.key && e.key.toLowerCase() === 'escape') {
          targetElement.blur(); // Unfocus the element
          e.preventDefault();
        }
        // Do not process other keys like 'b', 's', arrows etc.
        return;
      }

      // Prevent default for navigation keys if not typing
      switch (e.key?.toLowerCase()) {
        case 's':
          e.preventDefault();
          handleBack();
          break;
        case 'arrowup':
          e.preventDefault();
          handleScroll('up');
          break;
        case 'arrowdown':
          e.preventDefault();
          handleScroll('down');
          break;
        case 'a':
        case 'enter':
            const focusedElement = document.activeElement;
            if (focusedElement && 'click' in focusedElement && typeof focusedElement.click === 'function') {
                (focusedElement as HTMLElement).click();
                e.preventDefault();
            }
          break;
        case 'b': //Explicitly handle 'b' if needed, but we want it to do nothing
        case 'escape':
            // 'b' is now handled by the global handler, which checks the target.
            // But we can also add a local prevent default if needed.
            // For now, we let it bubble to the parent.
            break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleBack, playNavigate, playSelect, playBack, handleScroll]);

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 text-white animate-pixel-in relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <AthleteStarNesBackground />
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <h1 className="text-3xl sm:text-4xl font-headline text-primary mb-4 text-center">{t('aboutMe.title')}</h1>
        
        <ScrollArea viewportRef={scrollViewportRef} className="flex-grow pr-4 -mr-4">
            <div className="max-w-3xl mx-auto space-y-6">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Image 
                                src="https://placehold.co/80x80.png" 
                                data-ai-hint="pixelated avatar" 
                                alt="Fadel Muhamad Rifai" 
                                width={80} 
                                height={80} 
                                className="rounded-full border-2 border-primary"
                            />
                            <div>
                            <CardTitle className="text-2xl font-headline text-primary">Fadel Muhamad Rifai</CardTitle>
                            <p className="text-accent font-code">Web Developer</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="text-base text-gray-300 space-y-3 pr-4">
                        <p>{t('aboutMe.intro')}</p>
                        <p>{t('aboutMe.journey')}</p>
                        <p className='italic font-code'>"{t('aboutMe.philosophy')}"</p>
                    </CardContent>

                <Card className="bg-black/30 p-4 rounded-lg border border-primary/30">
                    <div className="flex items-center gap-4 mb-2">
                        <Mail className="w-6 h-6 text-primary"/>
                        <h2 className="text-xl font-headline text-primary">{t('contact.title')}</h2>
                    </div>
                    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <Input
                            id="name"
                            name="name"
                            placeholder={t('contact.namePlaceholder')}
                            className={cn("bg-gray-900 border-gray-700 text-white focus:ring-2 focus:ring-accent")}
                            aria-invalid={state.errors?.fieldErrors.name ? 'true' : 'false'}
                        />
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder={t('contact.emailPlaceholder')}
                            className={cn("bg-gray-900 border-gray-700 text-white focus:ring-2 focus:ring-accent")}
                            aria-invalid={state.errors?.fieldErrors.email ? 'true' : 'false'}
                        />
                        <Textarea
                            id="message"
                            name="message"
                            placeholder={t('contact.messagePlaceholder')}
                            className={cn("bg-gray-900 border-gray-700 text-white min-h-[42px] md:col-span-2 focus:ring-2 focus:ring-accent")}
                            aria-invalid={state.errors?.fieldErrors.message ? 'true' : 'false'}
                            rows={2}
                        />
                        <Button 
                            type="submit" 
                            disabled={state.submitting} 
                            className={cn("w-full font-headline text-lg bg-accent hover:bg-accent/90 text-accent-foreground md:col-span-2 focus:ring-2 focus:ring-accent")}
                        >
                            {state.submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            <span>{state.submitting ? t('contact.sending') : t('contact.sendButton')}</span>
                        </Button>
                    </form>
                </Card>
            </div>
        </ScrollArea>
        
        <div className="mt-4 text-center text-sm text-gray-400 font-code flex-shrink-0">
          <p>{t('aboutMe.controls.navigate')}</p>
        </div>
      </div>
    </div>
  );
}
