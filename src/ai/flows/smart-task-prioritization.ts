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
  try {
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your-google-api-key-here') {
      throw new Error('AI features are unavailable. Please configure GOOGLE_API_KEY in your environment variables.');
    }
    return await smartTaskPrioritizationFlow(input);
  } catch (error) {
    // Provide fallback response when AI is not available
    console.error('Smart Task Prioritization AI Error:', error);
    
    // Generate a basic fallback prioritization based on deadlines and importance
    const prioritizedTasks = input.tasks
      .map(task => {
        let score = 0;
        
        // Score based on importance
        if (task.importance === 'high') score += 70;
        else if (task.importance === 'medium') score += 50;
        else score += 30;
        
        // Score based on deadline proximity
        if (task.deadline) {
          const deadline = new Date(task.deadline);
          const now = new Date();
          const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDeadline <= 1) score += 30;
          else if (daysUntilDeadline <= 3) score += 20;
          else if (daysUntilDeadline <= 7) score += 10;
        }
        
        return {
          id: task.id,
          priorityScore: score,
          reason: `Fallback scoring: ${task.importance} importance task. For intelligent AI-powered prioritization, please configure your Google API key.`
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
    
    return { prioritizedTasks };
  }
}

const prompt = ai.definePrompt({
  name: 'smartTaskPrioritizationPrompt',
  model: 'googleai/gemini-2.0-flash', // Explicitly specify the model
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
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('AI features are unavailable. GOOGLE_API_KEY is not configured.');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
