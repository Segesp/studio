'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { smartEventScheduling, type SmartEventSchedulingOutput } from '@/ai/flows/smart-event-scheduling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';
import { ThumbsUp, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  participants: z.string().min(1, 'At least one participant is required.'),
  durationMinutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes.'),
  location: z.string().min(1, 'Location is required.'),
  context: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function SmartEventSchedulingForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SmartEventSchedulingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participants: '',
      durationMinutes: 30,
      location: '',
      context: '',
    },
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const participantsArray = data.participants.split(',').map(p => p.trim()).filter(p => p.length > 0);
        if (participantsArray.length === 0) {
          form.setError('participants', { message: 'Please enter valid participant emails, separated by commas.' });
          return;
        }
        const aiResponse = await smartEventScheduling({
          ...data,
          participants: participantsArray,
        });
        setResult(aiResponse);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      }
    });
  };

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader>
        <CardTitle>Smart Event Scheduling</CardTitle>
        <CardDescription>Let AI find the optimal time for your next event.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participants (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., alice@example.com, bob@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Conference Room A, Zoom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Context (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Consider timezones, project deadline next week" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch space-y-4">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader className="mr-2" size={16} /> : null}
              Suggest Time
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <Alert variant="default" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-200">
                <ThumbsUp className="h-4 w-4 text-green-500 dark:text-green-400" />
                <AlertTitle className="text-green-700 dark:text-green-200">Suggestion Received!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p><strong>Suggested Time:</strong> {result.suggestedTime}</p>
                  <p><strong>Reasoning:</strong> {result.reasoning}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
