// src/ai/flows/intelligent-deadline-reminders.ts
'use server';
/**
 * @fileOverview An AI agent that intelligently reminds the user of upcoming deadlines, considering task complexity and current workload.
 *
 * - intelligentDeadlineReminder - A function that determines when to remind a user about a task deadline.
 * - IntelligentDeadlineReminderInput - The input type for the intelligentDeadlineReminder function.
 * - IntelligentDeadlineReminderOutput - The return type for the intelligentDeadlineReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentDeadlineReminderInputSchema = z.object({
  taskName: z.string().describe('The name of the task.'),
  deadline: z.string().describe('The deadline of the task in ISO 8601 format (e.g., 2024-01-01T00:00:00Z).'),
  taskComplexity: z.enum(['low', 'medium', 'high']).describe('The complexity of the task.'),
  currentWorkload: z.enum(['light', 'moderate', 'heavy']).describe('The user\'s current workload.'),
  userPreferences: z.string().optional().describe('Any user preferences regarding reminders.'),
});
export type IntelligentDeadlineReminderInput = z.infer<typeof IntelligentDeadlineReminderInputSchema>;

const IntelligentDeadlineReminderOutputSchema = z.object({
  shouldRemind: z.boolean().describe('Whether a reminder should be sent to the user.'),
  reminderTime: z.string().optional().describe('The suggested time to send the reminder in ISO 8601 format (e.g., 2023-12-31T23:00:00Z).'),
  reason: z.string().optional().describe('The reasoning behind the decision to send or not send a reminder.'),
});
export type IntelligentDeadlineReminderOutput = z.infer<typeof IntelligentDeadlineReminderOutputSchema>;

export async function intelligentDeadlineReminder(input: IntelligentDeadlineReminderInput): Promise<IntelligentDeadlineReminderOutput> {
  return intelligentDeadlineReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentDeadlineReminderPrompt',
  model: 'googleai/gemini-2.0-flash', // Explicitly specify the model
  input: {schema: IntelligentDeadlineReminderInputSchema},
  output: {schema: IntelligentDeadlineReminderOutputSchema},
  prompt: `You are an AI assistant helping users manage their tasks and deadlines effectively.

  Given the following information about a task, its deadline, complexity, the user's current workload, and any user preferences, determine whether a reminder should be sent, and if so, when.

  Task Name: {{{taskName}}}
  Deadline: {{{deadline}}}
  Task Complexity: {{{taskComplexity}}}
  Current Workload: {{{currentWorkload}}}
  User Preferences: {{{userPreferences}}}

  Consider the task's complexity and the user's workload when deciding whether to send a reminder. For high-complexity tasks or when the user has a heavy workload, suggest sending reminders earlier.  If the user has specified preferences, factor those in as well.

  Return a JSON object with 'shouldRemind' set to true or false, 'reminderTime' as an ISO 8601 timestamp string if shouldRemind is true, and 'reason' explaining your decision.

  Ensure the 'reminderTime' is set to a time that is far enough in advance to be useful but not so far in advance as to be annoying.
  `,
});

const intelligentDeadlineReminderFlow = ai.defineFlow(
  {
    name: 'intelligentDeadlineReminderFlow',
    inputSchema: IntelligentDeadlineReminderInputSchema,
    outputSchema: IntelligentDeadlineReminderOutputSchema,
  },
  async input => {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('AI features are unavailable. GOOGLE_API_KEY is not configured.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
