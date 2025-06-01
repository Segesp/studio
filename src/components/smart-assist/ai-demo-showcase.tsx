'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, ListFilter, BellPlus, Play, CheckCircle } from 'lucide-react';

const demoScenarios = {
  eventScheduling: {
    input: {
      participants: ['alice@company.com', 'bob@company.com', 'charlie@company.com'],
      durationMinutes: 60,
      location: 'Conference Room A',
      context: 'Q4 planning meeting - important for next quarter strategy'
    },
    expectedOutput: {
      suggestedTime: 'Thursday, December 14th at 2:00 PM - 3:00 PM EST',
      reasoning: 'This time slot works best considering all participants are in EST timezone, avoids lunch hours, and allows preparation time before the weekend. The afternoon slot also aligns with planning-focused work when energy levels are optimal for strategic discussions.'
    }
  },
  taskPrioritization: {
    input: {
      tasks: [
        { id: '1', description: 'Fix critical bug in production', deadline: '2025-06-03', importance: 'high', context: 'Affecting 20% of users' },
        { id: '2', description: 'Prepare monthly report', deadline: '2025-06-05', importance: 'medium', context: 'Board meeting next week' },
        { id: '3', description: 'Update documentation', deadline: '2025-06-10', importance: 'low', context: 'New team member onboarding' },
        { id: '4', description: 'Client demo preparation', deadline: '2025-06-04', importance: 'high', context: 'Potential $50k deal' }
      ],
      userPreferences: 'Prefer to tackle high-impact items in the morning, group similar tasks together'
    },
    expectedOutput: {
      prioritizedTasks: [
        { id: '1', priorityScore: 95, reason: 'Critical production issue with immediate user impact and closest deadline' },
        { id: '4', priorityScore: 90, reason: 'High business value with tight deadline - significant revenue opportunity' },
        { id: '2', priorityScore: 70, reason: 'Important for board meeting, moderate deadline allows for proper preparation' },
        { id: '3', priorityScore: 40, reason: 'Lower priority but important for team growth, flexible timeline' }
      ]
    }
  },
  deadlineReminder: {
    input: {
      taskName: 'Prepare quarterly presentation for board meeting',
      deadline: '2025-06-08T14:00:00Z',
      taskComplexity: 'high',
      currentWorkload: 'moderate',
      userPreferences: 'Prefer reminders 3 days before for important presentations'
    },
    expectedOutput: {
      shouldRemind: true,
      reminderTime: '2025-06-05T09:00:00Z',
      reason: 'Given the high complexity of preparing a board presentation and your moderate workload, I recommend a reminder 3 days in advance. This allows adequate time for research, slide preparation, practice, and potential revisions while aligning with your stated preferences.'
    }
  }
};

export function AIDemoShowcase() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [runningDemo, setRunningDemo] = useState<string | null>(null);

  const runDemo = async (demoType: string) => {
    setRunningDemo(demoType);
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    setActiveDemo(demoType);
    setRunningDemo(null);
  };

  return (
    <Card className="shadow-lg mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Play className="h-5 w-5 text-blue-500" />
          AI Features Demo
        </CardTitle>
        <CardDescription>
          Explore what our Smart Assist AI can do for you. These demonstrations show the types of intelligent suggestions you'll receive once configured.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="event-scheduling" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="event-scheduling" className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Event Scheduling
            </TabsTrigger>
            <TabsTrigger value="task-prioritization" className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              Task Prioritization
            </TabsTrigger>
            <TabsTrigger value="deadline-reminder" className="flex items-center gap-2">
              <BellPlus className="h-4 w-4" />
              Deadline Reminders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="event-scheduling" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Input Example:</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-sm">
                  <p><strong>Participants:</strong> {demoScenarios.eventScheduling.input.participants.join(', ')}</p>
                  <p><strong>Duration:</strong> {demoScenarios.eventScheduling.input.durationMinutes} minutes</p>
                  <p><strong>Location:</strong> {demoScenarios.eventScheduling.input.location}</p>
                  <p><strong>Context:</strong> {demoScenarios.eventScheduling.input.context}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">AI Response:</h4>
                  <Button 
                    size="sm" 
                    onClick={() => runDemo('eventScheduling')}
                    disabled={runningDemo === 'eventScheduling'}
                  >
                    {runningDemo === 'eventScheduling' ? 'Processing...' : 'Run Demo'}
                  </Button>
                </div>
                
                {activeDemo === 'eventScheduling' && (
                  <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md text-sm border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Badge variant="default" className="bg-green-100 text-green-800">AI Suggestion</Badge>
                    </div>
                    <p><strong>Suggested Time:</strong> {demoScenarios.eventScheduling.expectedOutput.suggestedTime}</p>
                    <p className="mt-2"><strong>Reasoning:</strong> {demoScenarios.eventScheduling.expectedOutput.reasoning}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="task-prioritization" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Input Example:</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-sm">
                  <p><strong>Tasks to prioritize:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {demoScenarios.taskPrioritization.input.tasks.map(task => (
                      <li key={task.id} className="text-xs">
                        {task.description} ({task.importance}, due: {task.deadline})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2"><strong>Preferences:</strong> {demoScenarios.taskPrioritization.input.userPreferences}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">AI Response:</h4>
                  <Button 
                    size="sm" 
                    onClick={() => runDemo('taskPrioritization')}
                    disabled={runningDemo === 'taskPrioritization'}
                  >
                    {runningDemo === 'taskPrioritization' ? 'Processing...' : 'Run Demo'}
                  </Button>
                </div>
                
                {activeDemo === 'taskPrioritization' && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-md text-sm border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <Badge variant="default" className="bg-blue-100 text-blue-800">AI Prioritization</Badge>
                    </div>
                    <div className="space-y-2">
                      {demoScenarios.taskPrioritization.expectedOutput.prioritizedTasks.map((task, index) => (
                        <div key={task.id} className="flex items-start gap-2">
                          <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                          <div>
                            <p className="font-medium">Task {task.id} (Score: {task.priorityScore})</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{task.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deadline-reminder" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Input Example:</h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-sm">
                  <p><strong>Task:</strong> {demoScenarios.deadlineReminder.input.taskName}</p>
                  <p><strong>Deadline:</strong> {new Date(demoScenarios.deadlineReminder.input.deadline).toLocaleDateString()}</p>
                  <p><strong>Complexity:</strong> {demoScenarios.deadlineReminder.input.taskComplexity}</p>
                  <p><strong>Workload:</strong> {demoScenarios.deadlineReminder.input.currentWorkload}</p>
                  <p><strong>Preferences:</strong> {demoScenarios.deadlineReminder.input.userPreferences}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">AI Response:</h4>
                  <Button 
                    size="sm" 
                    onClick={() => runDemo('deadlineReminder')}
                    disabled={runningDemo === 'deadlineReminder'}
                  >
                    {runningDemo === 'deadlineReminder' ? 'Processing...' : 'Run Demo'}
                  </Button>
                </div>
                
                {activeDemo === 'deadlineReminder' && (
                  <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-md text-sm border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      <Badge variant="default" className="bg-purple-100 text-purple-800">AI Reminder</Badge>
                    </div>
                    <p><strong>Should Remind:</strong> {demoScenarios.deadlineReminder.expectedOutput.shouldRemind ? 'Yes' : 'No'}</p>
                    {demoScenarios.deadlineReminder.expectedOutput.reminderTime && (
                      <p><strong>Suggested Time:</strong> {new Date(demoScenarios.deadlineReminder.expectedOutput.reminderTime).toLocaleString()}</p>
                    )}
                    <p className="mt-2"><strong>Reasoning:</strong> {demoScenarios.deadlineReminder.expectedOutput.reason}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
