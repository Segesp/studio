import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks, KanbanSquare, Tag } from "lucide-react";
import Image from "next/image";

export default function TaskListPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <ListChecks className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Task Management</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Organize your to-dos with priorities, deadlines, and statuses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-12 text-center">
            <Image 
              src="https://placehold.co/800x400.png" 
              alt="Task list placeholder" 
              width={400} 
              height={200} 
              className="mb-4 rounded-md opacity-70"
              data-ai-hint="task board"
            />
            <h2 className="text-2xl font-semibold text-foreground">Task List Feature In Progress</h2>
            <p className="text-muted-foreground">
              This section will provide a comprehensive task management system, including
              Kanban views, status tracking, and smart notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <KanbanSquare className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Kanban View</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualize your workflow with an optional Kanban board and drag-and-drop task movement.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Tag className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Priorities & Tags</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Set priorities, due dates, and apply tags for efficient filtering and organization.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
