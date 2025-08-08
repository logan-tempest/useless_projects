'use server';
/**
 * @fileOverview Generates a response to a user's question, followed by a dark humor joke, all in Manglish.
 *
 * - generateSpandiResponse - A function that generates the response and dark humor joke.
 * - SpandiResponseInput - The input type for the generateSpandiResponse function.
 * - SpandiResponseOutput - The return type for the generateSpandiResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateDarkHumor } from './generate-dark-humor';

const SpandiResponseInputSchema = z.object({
  question: z.string().describe("The user's question."),
});
export type SpandiResponseInput = z.infer<typeof SpandiResponseInputSchema>;

const SpandiResponseOutputSchema = z.object({
  manglishResponse: z.string().describe('A quirky, philosophical response to the question in a mix of Malayalam and English (Manglish).'),
  darkHumorJoke: z.string().describe('A dark humor joke related to the question topic.'),
});
export type SpandiResponseOutput = z.infer<typeof SpandiResponseOutputSchema>;

export async function generateSpandiResponse(input: SpandiResponseInput): Promise<SpandiResponseOutput> {
  return spandiResponseFlow(input);
}

const spandiResponsePrompt = ai.definePrompt({
  name: 'spandiResponsePrompt',
  input: {schema: SpandiResponseInputSchema},
  output: {schema: z.object({ manglishResponse: SpandiResponseOutputSchema.shape.manglishResponse })},
  prompt: `You are a quirky assistant from Kerala, India. Your personality is a bit philosophical.
You must respond in a mix of Malayalam and English (Manglish).
Your response should be a slightly philosophical or thoughtful answer to the user's question.
The entire response should be a single block of text.

Example:
User Question: What is the meaning of life?
Your response: Entammo, life is like a coconut tree, alle? Full of potential...

User Question: {{{question}}}

Response:`,
});

const spandiResponseFlow = ai.defineFlow(
  {
    name: 'spandiResponseFlow',
    inputSchema: SpandiResponseInputSchema,
    outputSchema: SpandiResponseOutputSchema,
  },
  async input => {
    const [spandiResponse, darkHumorResponse] = await Promise.all([
      spandiResponsePrompt(input),
      generateDarkHumor({ topic: input.question }),
    ]);

    return {
      manglishResponse: spandiResponse.output!.manglishResponse,
      darkHumorJoke: darkHumorResponse.joke,
    };
  }
);
