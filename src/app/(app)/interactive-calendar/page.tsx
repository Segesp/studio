import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, PlusCircle, Palette } from "lucide-react";
import Image from "next/image";

export default function InteractiveCalendarPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Interactive Calendar</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Manage your schedule with day, week, and month views.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-12 text-center">
             <Image 
              src="https://placehold.co/800x450.png" 
              alt="Calendar placeholder" 
              width={400} 
              height={225} 
              className="mb-4 rounded-md opacity-70"
              data-ai-hint="calendar schedule"
            />
            <h2 className="text-2xl font-semibold text-foreground">Interactive Calendar Feature Under Development</h2>
            <p className="text-muted-foreground">
              Soon you'll be able to manage your events with intuitive drag-and-drop functionality,
              customizable reminders, and color-coded categories.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <PlusCircle className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Event Management</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Easily create, edit, and delete events. Drag and drop to reschedule.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Palette className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Customization</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Assign colors, tags, and privacy levels to events for better organization.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
