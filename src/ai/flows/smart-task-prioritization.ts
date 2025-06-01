// src/ai/flows/smart-task-prioritization.ts
'use server';

/**
 * @fileOverview Provides intelligent suggestions for prioritizing tasks based on deadlines, importance, and context.
 *
 * - smartTaskPrioritization - A function that suggests task prioritization.
 * - SmartTaskPrioritizationInput - The input type for the smartTaskPrioritization function.
 * - SmartTaskPrioritizationOutput - The return type for the smartTaskPrioritization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaskPrioritizationInputSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().describe('Unique identifier for the task.'),
      description: z.string().describe('Description of the task.'),
      deadline: z.string().optional().describe('Deadline for the task (ISO format).'),
      importance: z.enum(['high', 'medium', 'low']).describe('Importance level of the task.'),
      context: z.string().optional().describe('Additional context or notes for the task.'),
    })
  ).describe('List of tasks to prioritize.'),
  userPreferences: z.string().optional().describe('User preferences or historical data.'),
});
export type SmartTaskPrioritizationInput = z.infer<typeof SmartTaskPrioritizationInputSchema>;

const SmartTaskPrioritizationOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      id: z.string().describe('Task ID.'),
      priorityScore: z.number().describe('A numerical score indicating the priority of the task.'),
      reason: z.string().describe('Explanation for the assigned priority score.'),
    })
  ).describe('List of tasks with assigned priority scores and reasons.'),
});
export type SmartTaskPrioritizationOutput = z.infer<typeof SmartTaskPrioritizationOutputSchema>;

export async function smartTaskPrioritization(input: SmartTaskPrioritizationInput): Promise<SmartTaskPrioritizationOutput> {
  return smartTaskPrioritizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTaskPrioritizationPrompt',
  input: {schema: SmartTaskPrioritizationInputSchema},
  output: {schema: SmartTaskPrioritizationOutputSchema},
  prompt: `You are an AI task prioritization assistant. Given a list of tasks, their deadlines, importance levels, and context, you will provide a prioritized list of tasks with a priority score and a reason for each score.

  Here are the tasks:
  {{#each tasks}}
  - ID: {{this.id}}
    Description: {{this.description}}
    Deadline: {{this.deadline}}
    Importance: {{this.importance}}
    Context: {{this.context}}
  {{/each}}

  User Preferences: {{userPreferences}}

  Prioritize the tasks based on the following criteria:
  - Tasks with closer deadlines should have higher priority.
  - Tasks with higher importance should have higher priority.
  - Tasks with relevant context should be considered for prioritization.

  Return the prioritized tasks with a priority score (higher is more important) and a reason for each task.  The score must be a number.
  `,
});

const smartTaskPrioritizationFlow = ai.defineFlow(
  {
    name: 'smartTaskPrioritizationFlow',
    inputSchema: SmartTaskPrioritizationInputSchema,
    outputSchema: SmartTaskPrioritizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
