
import { SmartTaskPrioritizationForm } from "@/components/smart-assist/smart-task-prioritization-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListFilter } from "lucide-react";

export default function SmartTaskPrioritizationPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl mb-8 max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <ListFilter className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Smart Task Prioritization</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Get AI-powered suggestions for prioritizing your tasks.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex justify-center">
        <SmartTaskPrioritizationForm />
      </div>
    </div>
  );
}
