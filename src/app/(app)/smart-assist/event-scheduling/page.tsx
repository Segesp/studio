
import { SmartEventSchedulingForm } from "@/components/smart-assist/smart-event-scheduling-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";

export default function SmartEventSchedulingPage() {
  return (
    <div className="container mx-auto py-8">
       <Card className="shadow-xl mb-8 max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <CalendarClock className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Smart Event Scheduling</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Let AI find the optimal time for your next event.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex justify-center">
        <SmartEventSchedulingForm />
      </div>
    </div>
  );
}
