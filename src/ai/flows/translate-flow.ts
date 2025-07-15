'use server';
/**
 * @fileOverview A flow for translating text from English to Indonesian.
 *
 * - translate - A function that handles the translation.
 * - TranslateInput - The input type for the translate function.
 * - TranslateOutput - The return type for the translate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateInputSchema = z.object({
  text: z.string().describe('The English text to translate.'),
});
export type TranslateInput = z.infer<typeof TranslateInputSchema>;

const TranslateOutputSchema = z.object({
  translation: z.string().describe('The translated Indonesian text.'),
});
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

export async function translate(input: TranslateInput): Promise<TranslateOutput> {
  return translateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translatePrompt',
  input: {schema: TranslateInputSchema},
  output: {schema: TranslateOutputSchema},
  prompt: `Translate the following English text to Indonesian. Return a JSON object with a "translation" key containing the translated text.

Example: { "translation": "Halo dunia" }

English text: {{{text}}}`,
});

const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
