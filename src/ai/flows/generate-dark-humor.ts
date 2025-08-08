// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Flow to generate a dark humor joke related to a topic.
 *
 * - generateDarkHumor - A function that generates a dark humor joke.
 * - GenerateDarkHumorInput - The input type for the generateDarkHumor function.
 * - GenerateDarkHumorOutput - The return type for the generateDarkHumor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDarkHumorInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a dark humor joke.'),
});
export type GenerateDarkHumorInput = z.infer<typeof GenerateDarkHumorInputSchema>;

const GenerateDarkHumorOutputSchema = z.object({
  joke: z.string().describe('A dark humor joke related to the topic.'),
});
export type GenerateDarkHumorOutput = z.infer<typeof GenerateDarkHumorOutputSchema>;

export async function generateDarkHumor(input: GenerateDarkHumorInput): Promise<GenerateDarkHumorOutput> {
  return generateDarkHumorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDarkHumorPrompt',
  input: {schema: GenerateDarkHumorInputSchema},
  output: {schema: GenerateDarkHumorOutputSchema},
  prompt: `You are a dark humor joke writer. Your task is to generate a dark humor joke related to the following topic:\n\nTopic: {{{topic}}}\n\nJoke:`, 
});

const generateDarkHumorFlow = ai.defineFlow(
  {
    name: 'generateDarkHumorFlow',
    inputSchema: GenerateDarkHumorInputSchema,
    outputSchema: GenerateDarkHumorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
