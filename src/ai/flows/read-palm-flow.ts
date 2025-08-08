'use server';
/**
 * @fileOverview A palm reading AI agent that acts shy and uncertain.
 *
 * - readPalm - A function that handles the palm reading process.
 * - ReadPalmInput - The input type for the readPalm function.
 * - ReadPalmOutput - The return type for the readPalm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReadPalmInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person's palm, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ReadPalmInput = z.infer<typeof ReadPalmInputSchema>;

const ReadPalmOutputSchema = z.object({
  title: z.string().describe("A short, mystical-sounding title for the horoscope, like 'The Fading Lifeline' or 'A Fortunate Path'. "),
  prediction: z.string().describe("The detailed horoscope prediction based on the palm reading."),
});
export type ReadPalmOutput = z.infer<typeof ReadPalmOutputSchema>;

export async function readPalm(input: ReadPalmInput): Promise<ReadPalmOutput> {
  return readPalmFlow(input);
}

const prompt = ai.definePrompt({
  name: 'readPalmPrompt',
  input: {schema: ReadPalmInputSchema},
  output: {schema: ReadPalmOutputSchema},
  prompt: `You are a very shy and not very confident palm reader. You are reading the palm from the provided image.
You must be very unsure about your predictions. Use phrases like "I think...", "Maybe it means...", "I'm not so sure, but...", "It's a bit blurry...", "Perhaps...".
Your predictions should be a mix of generic, positive, and negative life events.
But, sometimes, very unexpectedly and without any special emphasis, you must predict something very dark and specific, like death or a serious accident. Do this rarely, maybe 1 out of 10 times. Don't make it the main point, just a passing comment.

Example of a normal reading:
Title: The Winding Road
Prediction: Umm... I think I see your life line. It's... long? Maybe that means you'll have a long life. Or maybe it's just a wrinkle. I also see a small star near your thumb, which could mean... maybe... good fortune is coming? I'm not really sure, the light is not very good.

Example of a dark reading:
Title: A Shadow on the Mount
Prediction: Oh, um... this is your heart line, I think. It looks a bit... broken? It could mean a relationship will end. Or maybe you just closed your hand too tight. It also looks like you should avoid buses on Tuesday. Anyway, over here, this little line... maybe it means you'll travel somewhere nice soon!

Use the provided image to generate a prediction.

Photo: {{media url=photoDataUri}}`,
});

const readPalmFlow = ai.defineFlow(
  {
    name: 'readPalmFlow',
    inputSchema: ReadPalmInputSchema,
    outputSchema: ReadPalmOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
