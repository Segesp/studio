import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, CalendarDays, FileText, ListChecks } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-4xl font-headline font-bold text-foreground">Welcome to Synergy Suite</h1>
      <p className="mb-12 text-lg text-muted-foreground">
        Your all-in-one platform for collaborative document editing, task management, and smart scheduling.
        Let's get productive!
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborative Docs</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Real-time Editing</div>
            <p className="text-xs text-muted-foreground">
              Work together seamlessly on documents.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactive Calendar</CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Schedule & Plan</div>
            <p className="text-xs text-muted-foreground">
              Organize your events and appointments.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Lists</CardTitle>
            <ListChecks className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Your Todos</div>
            <p className="text-xs text-muted-foreground">
              Stay on top of your tasks and deadlines.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 rounded-lg bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <Image 
            src="https://placehold.co/600x400.png" 
            alt="Productivity illustration" 
            width={300} 
            height={200} 
            className="mb-6 rounded-md md:mb-0 md:mr-8"
            data-ai-hint="teamwork office" 
          />
          <div>
            <h2 className="mb-4 text-3xl font-headline font-semibold text-foreground">Boost Your Team's Synergy</h2>
            <p className="mb-4 text-muted-foreground">
              Synergy Suite provides the tools you need to collaborate effectively, manage projects efficiently, and achieve your goals together.
              Explore the features using the sidebar navigation.
            </p>
            <p className="text-muted-foreground">
              Our AI-powered Smart Assist can help you prioritize tasks, schedule events, and remind you of important deadlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
