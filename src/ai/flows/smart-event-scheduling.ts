// src/ai/flows/smart-event-scheduling.ts
'use server';

/**
 * @fileOverview AI-powered smart event scheduling assistant.
 *
 * - smartEventScheduling - A function that handles the event scheduling process.
 * - SmartEventSchedulingInput - The input type for the smartEventScheduling function.
 * - SmartEventSchedulingOutput - The return type for the smartEventScheduling function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartEventSchedulingInputSchema = z.object({
  participants: z
    .array(z.string())
    .describe('List of participants (e.g., email addresses).'),
  durationMinutes: z
    .number()
    .describe('Duration of the event in minutes.'),
  location: z.string().describe('Location of the event.'),
  context: z
    .string()
    .optional()
    .describe('Any other relevant context to consider when scheduling.'),
});

export type SmartEventSchedulingInput = z.infer<typeof SmartEventSchedulingInputSchema>;

const SmartEventSchedulingOutputSchema = z.object({
  suggestedTime: z.string().describe('The suggested optimal time for the event.'),
  reasoning: z.string().describe('The reasoning behind the suggested time.'),
});

export type SmartEventSchedulingOutput = z.infer<typeof SmartEventSchedulingOutputSchema>;

export async function smartEventScheduling(input: SmartEventSchedulingInput): Promise<SmartEventSchedulingOutput> {
  try {
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your-google-api-key-here') {
      throw new Error('AI features are unavailable. Please configure GOOGLE_API_KEY in your environment variables.');
    }
    return await smartEventSchedulingFlow(input);
  } catch (error) {
    // Provide fallback response when AI is not available
    console.error('Smart Event Scheduling AI Error:', error);
    
    // Generate a basic fallback suggestion
    const participants = input.participants.join(', ');
    const duration = input.durationMinutes;
    
    return {
      suggestedTime: 'Tomorrow at 2:00 PM (AI suggestion unavailable - please configure Google API key)',
      reasoning: `Fallback suggestion for ${duration}-minute meeting with ${participants}. For intelligent AI-powered scheduling suggestions, please configure your Google API key in the environment variables.`
    };
  }
}

const prompt = ai.definePrompt({
  name: 'smartEventSchedulingPrompt',
  model: 'googleai/gemini-2.0-flash', // Explicitly specify the model
  input: {schema: SmartEventSchedulingInputSchema},
  output: {schema: SmartEventSchedulingOutputSchema},
  prompt: `You are a smart event scheduling assistant. Given the following information, suggest the optimal time for the event, considering participant availability, event duration, location, and any other relevant context.\n\nParticipants: {{{participants}}}\nDuration: {{{durationMinutes}}} minutes\nLocation: {{{location}}}\nContext: {{{context}}}\n\nConsider the working hours and timezones for the participants when providing the suggested time. Return the suggested time and the reasoning behind it.`,
});

const smartEventSchedulingFlow = ai.defineFlow(
  {
    name: 'smartEventSchedulingFlow',
    inputSchema: SmartEventSchedulingInputSchema,
    outputSchema: SmartEventSchedulingOutputSchema,
  },
  async input => {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('AI features are unavailable. GOOGLE_API_KEY is not configured.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
