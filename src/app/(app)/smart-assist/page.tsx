import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SmartEventSchedulingForm } from "@/components/smart-assist/smart-event-scheduling-form";
import { SmartTaskPrioritizationForm } from "@/components/smart-assist/smart-task-prioritization-form";
import { IntelligentDeadlineRemindersForm } from "@/components/smart-assist/intelligent-deadline-reminders-form";
import { Cpu, CalendarClock, ListFilter, BellPlus } from "lucide-react";

export default function SmartAssistPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl mb-8">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Cpu className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Smart Assist</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Leverage AI to enhance your productivity with intelligent suggestions.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="event-scheduling" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
          <TabsTrigger value="event-scheduling" className="flex items-center gap-2 py-3">
            <CalendarClock className="h-5 w-5" /> Event Scheduling
          </TabsTrigger>
          <TabsTrigger value="task-prioritization" className="flex items-center gap-2 py-3">
            <ListFilter className="h-5 w-5" /> Task Prioritization
          </TabsTrigger>
          <TabsTrigger value="deadline-reminders" className="flex items-center gap-2 py-3">
            <BellPlus className="h-5 w-5" /> Deadline Reminders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="event-scheduling">
          <div className="flex justify-center">
            <SmartEventSchedulingForm />
          </div>
        </TabsContent>
        <TabsContent value="task-prioritization">
          <div className="flex justify-center">
            <SmartTaskPrioritizationForm />
          </div>
        </TabsContent>
        <TabsContent value="deadline-reminders">
          <div className="flex justify-center">
            <IntelligentDeadlineRemindersForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
