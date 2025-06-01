'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { smartTaskPrioritization, type SmartTaskPrioritizationOutput, type SmartTaskPrioritizationInput } from '@/ai/flows/smart-task-prioritization';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';
import { ListChecks, AlertTriangle } from 'lucide-react';

const taskSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  deadline: z.string().optional(),
  importance: z.enum(['high', 'medium', 'low']),
  context: z.string().optional(),
});

const formSchema = z.object({
  tasksJson: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.every(task => taskSchema.safeParse(task).success);
    } catch (e) {
      return false;
    }
  }, { message: 'Invalid JSON format for tasks or tasks do not match schema. Each task needs id, description, importance (\'high\',\'medium\',\'low\'). Deadline & context optional.' }),
  userPreferences: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function SmartTaskPrioritizationForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SmartTaskPrioritizationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tasksJson: JSON.stringify([
        { id: '1', description: 'Develop feature X', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0,10) , importance: 'high', context: 'Client demo next week' },
        { id: '2', description: 'Fix bug Y', deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().substring(0,10), importance: 'medium' },
        { id: '3', description: 'Team meeting', importance: 'low', context: 'Weekly sync' },
      ], null, 2),
      userPreferences: 'Prefer to work on high importance tasks in the morning.',
    },
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const tasks = JSON.parse(data.tasksJson) as SmartTaskPrioritizationInput['tasks'];
        const aiResponse = await smartTaskPrioritization({
          tasks,
          userPreferences: data.userPreferences,
        });
        setResult(aiResponse);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to prioritize tasks. Check JSON format.';
        setError(errorMessage);
        
        // If it's an API key error, show a more helpful message
        if (errorMessage.includes('GOOGLE_API_KEY')) {
          setError('AI features require Google API configuration. The form will work with fallback suggestions until you configure your API key.');
        }
      }
    });
  };

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader>
        <CardTitle>Smart Task Prioritization</CardTitle>
        <CardDescription>Get AI-powered suggestions for prioritizing your tasks.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tasksJson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasks (JSON format)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter tasks as JSON array. Example: [{"id": "1", "description": "Task A", "importance": "high"}]'
                      {...field}
                      rows={10}
                      className="font-code text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Preferences (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Focus on urgent tasks first, group similar tasks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch space-y-4">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader className="mr-2" size={16} /> : null}
              Prioritize Tasks
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200">
                <ListChecks className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <AlertTitle className="text-blue-700 dark:text-blue-200">Prioritization Result</AlertTitle>
                <AlertDescription className="space-y-2">
                  {result.prioritizedTasks.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {result.prioritizedTasks.map(task => (
                        <li key={task.id}>
                          <strong>Task ID {task.id}</strong> (Score: {task.priorityScore}) - {task.reason}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No tasks were prioritized. Check your input.</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
