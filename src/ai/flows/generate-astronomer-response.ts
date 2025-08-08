'use server';
/**
 * @fileOverview Generates an astronomer-style response to a user's question, followed by a dark humor joke.
 *
 * - generateAstronomerResponse - A function that generates the astronomer response and dark humor joke.
 * - AstronomerResponseInput - The input type for the generateAstronomerResponse function.
 * - AstronomerResponseOutput - The return type for the generateAstronomerResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AstronomerResponseInputSchema = z.object({
  question: z.string().describe('The user\'s question about astronomy.'),
});
export type AstronomerResponseInput = z.infer<typeof AstronomerResponseInputSchema>;

const AstronomerResponseOutputSchema = z.object({
  astronomerResponse: z.string().describe('The astronomer\'s response to the question.'),
  darkHumorJoke: z.string().describe('A dark humor joke related to the response.'),
});
export type AstronomerResponseOutput = z.infer<typeof AstronomerResponseOutputSchema>;

export async function generateAstronomerResponse(input: AstronomerResponseInput): Promise<AstronomerResponseOutput> {
  return astronomerResponseFlow(input);
}

const astronomerResponsePrompt = ai.definePrompt({
  name: 'astronomerResponsePrompt',
  input: {schema: AstronomerResponseInputSchema},
  output: {schema: AstronomerResponseOutputSchema},
  prompt: `You are an astronomer who answers questions about space in a knowledgeable and slightly quirky way. After answering the question, you MUST include a dark humor joke related to the topic.\n\nQuestion: {{{question}}}\n\nAstronomer Response:`, // Enforce dark humor in the prompt
});

const astronomerResponseFlow = ai.defineFlow(
  {
    name: 'astronomerResponseFlow',
    inputSchema: AstronomerResponseInputSchema,
    outputSchema: AstronomerResponseOutputSchema,
  },
  async input => {
    const {output} = await astronomerResponsePrompt(input);
    return output!;
  }
);
