'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { intelligentDeadlineReminder, type IntelligentDeadlineReminderOutput } from '@/ai/flows/intelligent-deadline-reminders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';
import { BellRing, AlertTriangle, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  taskName: z.string().min(1, 'Task name is required.'),
  deadline: z.date({ required_error: 'Deadline is required.' }),
  taskComplexity: z.enum(['low', 'medium', 'high'], { required_error: 'Task complexity is required.' }),
  currentWorkload: z.enum(['light', 'moderate', 'heavy'], { required_error: 'Current workload is required.' }),
  userPreferences: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function IntelligentDeadlineRemindersForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<IntelligentDeadlineReminderOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskName: '',
      taskComplexity: 'medium',
      currentWorkload: 'moderate',
      userPreferences: '',
    },
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const aiResponse = await intelligentDeadlineReminder({
          ...data,
          deadline: data.deadline.toISOString(),
        });
        setResult(aiResponse);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
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
        <CardTitle>Intelligent Deadline Reminders</CardTitle>
        <CardDescription>Get smart suggestions on when to be reminded for your tasks.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Prepare quarterly report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taskComplexity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Complexity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentWorkload"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Workload</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select workload" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea placeholder="e.g., Remind me 2 days before for high complexity tasks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch space-y-4">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader className="mr-2" size={16} /> : null}
              Get Reminder Suggestion
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <Alert variant="default" className={cn(result.shouldRemind ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200" : "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200")}>
                <BellRing className={cn("h-4 w-4", result.shouldRemind ? "text-purple-500 dark:text-purple-400" : "text-yellow-500 dark:text-yellow-400")} />
                <AlertTitle className={cn(result.shouldRemind ? "text-purple-700 dark:text-purple-200" : "text-yellow-700 dark:text-yellow-200")}>
                  {result.shouldRemind ? "Reminder Suggested" : "Reminder Not Suggested (Yet)"}
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  <p><strong>Should Remind:</strong> {result.shouldRemind ? 'Yes' : 'No'}</p>
                  {result.shouldRemind && result.reminderTime && (
                    <p><strong>Suggested Reminder Time:</strong> {format(new Date(result.reminderTime), "PPPp")}</p>
                  )}
                  {result.reason && <p><strong>Reasoning:</strong> {result.reason}</p>}
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
