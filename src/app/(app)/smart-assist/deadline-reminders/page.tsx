
import { IntelligentDeadlineRemindersForm } from "@/components/smart-assist/intelligent-deadline-reminders-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BellPlus } from "lucide-react";

export default function IntelligentDeadlineRemindersPage() {
  return (
    <div className="container mx-auto py-8">
       <Card className="shadow-xl mb-8 max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <BellPlus className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Intelligent Deadline Reminders</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Get smart suggestions on when to be reminded for your tasks.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex justify-center">
        <IntelligentDeadlineRemindersForm />
      </div>
    </div>
  );
}
