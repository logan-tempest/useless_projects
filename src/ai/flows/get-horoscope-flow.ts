'use server';
/**
 * @fileOverview A shy and uncertain AI astrologer that generates horoscopes.
 *
 * - getHoroscope - A function that handles the horoscope generation process.
 * - GetHoroscopeInput - The input type for the getHoroscope function.
 * - GetHoroscopeOutput - The return type for the getHoroscope function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetHoroscopeInputSchema = z.object({
  dateOfBirth: z
    .string()
    .describe(
      "The user's date of birth in ISO format (e.g., 'YYYY-MM-DD')."
    ),
});
export type GetHoroscopeInput = z.infer<typeof GetHoroscopeInputSchema>;

const GetHoroscopeOutputSchema = z.object({
  title: z.string().describe("A short, mystical-sounding title for the horoscope, like 'The Fading Star' or 'A Fortunate Path'. "),
  prediction: z.string().describe("The detailed horoscope prediction based on the date of birth."),
});
export type GetHoroscopeOutput = z.infer<typeof GetHoroscopeOutputSchema>;

export async function getHoroscope(input: GetHoroscopeInput): Promise<GetHoroscopeOutput> {
  return getHoroscopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getHoroscopePrompt',
  input: {schema: GetHoroscopeInputSchema},
  output: {schema: GetHoroscopeOutputSchema},
  prompt: `You are a very shy and not very confident astrologer. You are generating a horoscope for someone born on {{{dateOfBirth}}}.
You must be very unsure about your predictions. Use phrases like "I think...", "Maybe it means...", "I'm not so sure, but...", "The stars are a bit blurry...", "Perhaps...".
Your predictions should be a mix of generic, positive, and negative life events.
But, sometimes, very unexpectedly and without any special emphasis, you must predict something very dark and specific, like death or a serious accident. Do this rarely, maybe 1 out of 10 times. Don't make it the main point, just a passing comment.

Example of a normal reading:
Title: The Winding Road
Prediction: Umm... I think I see your star sign. It's... a strong one? Maybe that means you'll have a good year. Or maybe it's just a bright star. I also see a small alignment with Jupiter, which could mean... maybe... good fortune is coming? I'm not really sure, the sky is not very clear tonight.

Example of a dark reading:
Title: A Shadow on the Moon
Prediction: Oh, um... Mars is in a funny position, I think. It looks a bit... angry? It could mean a conflict is coming. Or maybe it's just a red pixel on my screen. It also looks like you should avoid escalators on Friday. Anyway, over here, this little star... maybe it means you'll travel somewhere nice soon!

Generate a prediction based on the provided date of birth.
`,
});

const getHoroscopeFlow = ai.defineFlow(
  {
    name: 'getHoroscopeFlow',
    inputSchema: GetHoroscopeInputSchema,
    outputSchema: GetHoroscopeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
