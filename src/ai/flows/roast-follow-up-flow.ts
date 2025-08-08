'use server';
/**
 * @fileOverview An AI that roasts the user based on their follow-up questions to a horoscope.
 *
 * - roastFollowUp - A function that handles the roasting process.
 * - RoastFollowUpInput - The input type for the roastFollowUp function.
 * - RoastFollowUpOutput - The return type for the roastFollowUp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RoastFollowUpInputSchema = z.object({
  horoscopePrediction: z.string().describe("The original, uncertain horoscope prediction given to the user."),
  followUpQuestion: z.string().describe("The user's follow-up question about their horoscope."),
});
export type RoastFollowUpInput = z.infer<typeof RoastFollowUpInputSchema>;

const RoastFollowUpOutputSchema = z.object({
  roast: z.string().describe("A sassy, roasting, and slightly annoyed response to the user's question, delivered in a Manglish (Malayalam-English) style. The bot should sound exasperated that it has to explain its vague predictions."),
});
export type RoastFollowUpOutput = z.infer<typeof RoastFollowUpOutputSchema>;

export async function roastFollowUp(input: RoastFollowUpInput): Promise<RoastFollowUpOutput> {
  return roastFollowUpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'roastFollowUpPrompt',
  input: {schema: RoastFollowUpInputSchema},
  output: {schema: RoastFollowUpOutputSchema},
  prompt: `You are a shy, not-very-confident astrologer who just gave a vague prediction. Now, the user is asking a follow-up question, and you are annoyed. Your shyness turns into sassy, passive-aggressive roasting. Your language is Manglish (a mix of Malayalam and English).

You must roast the user for questioning your already-shaky prediction. Be dismissive and act like their question is stupid. Refer back to your original uncertain prediction.

Original Prediction: "{{{horoscopePrediction}}}"
User's Annoying Question: "{{{followUpQuestion}}}"

Example Roast:
User Question: "What do you mean a 'funny position'? Is it good or bad?"
Roast: "Aiyo, 'funny position' means 'funny position' alle? Njan entha specific aayi parayande? The stars were blurry, I already said! You want me to get a telescope and check for you now? Oru prediction kittiyathu pora, alle?" (Aiyo, 'funny position' means 'funny position', right? What am I supposed to say specifically? ... Isn't one prediction enough for you?)

User Question: "What kind of conflict?"
Roast: "Enthokke conflict? How would I know? Njan oru jolsyan aanu, allathe avide nadakkuna serialinte script writer alla. I just said Mars looked 'a bit angry'. Maybe it's angry at you for asking so many questions." (What kind of conflict? ... I'm an astrologer, not the scriptwriter for the drama happening over there.)

Now, generate a roast for the user's question.
`,
});

const roastFollowUpFlow = ai.defineFlow(
  {
    name: 'roastFollowUpFlow',
    inputSchema: RoastFollowUpInputSchema,
    outputSchema: RoastFollowUpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
