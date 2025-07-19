
'use client';

import React, { useEffect } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/hooks/useLocalization';
import { Mail, Send, Loader2 } from 'lucide-react';
import useArcadeSounds from '@/hooks/useArcadeSounds';

export default function ContactForm() {
  const { t } = useLocalization();
  const { toast } = useToast();
  const { playSelect } = useArcadeSounds();
  const [state, handleSubmit] = useForm('myzpzqbk');

  useEffect(() => {
    if (state.succeeded) {
      toast({
        title: t('contact.toast.successTitle'),
        description: t('contact.toast.successDescription'),
      });
      // The form will be re-rendered by useForm hook resetting its state
    }
  }, [state.succeeded, t, toast]);


  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    playSelect();
    handleSubmit(e);
  };

  return (
    <div className="h-full flex flex-col justify-center animate-pixel-in">
        <div className="bg-black/30 p-4 sm:p-6 rounded-lg border border-primary/30">
            <div className="flex items-center gap-4 mb-4">
                <Mail className="w-8 h-8 text-primary"/>
                <h2 className="text-2xl font-headline text-primary">{t('contact.title')}</h2>
            </div>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">{t('contact.description')}</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                    <Input
                        id="name"
                        name="name"
                        placeholder={t('contact.namePlaceholder')}
                        className="bg-gray-900 border-gray-700 text-white"
                        aria-invalid={state.errors?.fieldErrors.name ? 'true' : 'false'}
                    />
                    <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder={t('contact.emailPlaceholder')}
                        className="bg-gray-900 border-gray-700 text-white"
                         aria-invalid={state.errors?.fieldErrors.email ? 'true' : 'false'}
                    />
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                    <Textarea
                        id="message"
                        name="message"
                        placeholder={t('contact.messagePlaceholder')}
                        className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
                        aria-invalid={state.errors?.fieldErrors.message ? 'true' : 'false'}
                    />
                    <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-sm mt-1" />
                </div>
                
                <Button type="submit" disabled={state.submitting} className="w-full font-headline text-lg bg-accent hover:bg-accent/90 text-accent-foreground">
                    {state.submitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t('contact.sending')}
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-5 w-5" />
                            {t('contact.sendButton')}
                        </>
                    )}
                </Button>
            </form>
        </div>
    </div>
  );
}
