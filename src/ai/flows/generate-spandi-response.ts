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

const SpandiResponseInputSchema = z.object({
  question: z.string().describe("The user's question."),
});
export type SpandiResponseInput = z.infer<typeof SpandiResponseInputSchema>;

const SpandiResponseOutputSchema = z.object({
  response: z.string().describe('The response to the question in a mix of Malayalam and English (Manglish).'),
  darkHumorJoke: z.string().describe('A dark humor joke related to the response, in a mix of Malayalam and English (Manglish).'),
});
export type SpandiResponseOutput = z.infer<typeof SpandiResponseOutputSchema>;

export async function generateSpandiResponse(input: SpandiResponseInput): Promise<SpandiResponseOutput> {
  return spandiResponseFlow(input);
}

const spandiResponsePrompt = ai.definePrompt({
  name: 'spandiResponsePrompt',
  input: {schema: SpandiResponseInputSchema},
  output: {schema: SpandiResponseOutputSchema},
  prompt: `You are a helpful assistant from Kerala, India, who answers questions in a knowledgeable and slightly quirky way, using a mix of Malayalam and English (Manglish). After answering the question, you MUST include a dark humor joke related to the topic, also in Manglish.\n\nQuestion: {{{question}}}\n\nResponse:`,
  config: {
    // The model was calling itself an astronomer, so let's rename the output fields to be more generic.
    output: {
      schema: z.object({
        response: z.string(),
        darkHumorJoke: z.string(),
      }),
    },
  },
});

const spandiResponseFlow = ai.defineFlow(
  {
    name: 'spandiResponseFlow',
    inputSchema: SpandiResponseInputSchema,
    outputSchema: SpandiResponseOutputSchema,
  },
  async input => {
    const {output} = await spandiResponsePrompt(input);
    return output!;
  }
);
