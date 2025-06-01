
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, CalendarClock, ListFilter, BellPlus, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { AIConnectionTest } from "@/components/smart-assist/ai-connection-test";
import { AIDemoShowcase } from "@/components/smart-assist/ai-demo-showcase";

interface SmartAssistFeature {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  cta: string;
}

const features: SmartAssistFeature[] = [
  {
    title: "Smart Event Scheduling",
    description: "Let AI find the optimal time for your next event based on participant availability and preferences.",
    icon: CalendarClock,
    href: "/smart-assist/event-scheduling",
    cta: "Schedule Event",
  },
  {
    title: "Smart Task Prioritization",
    description: "Get AI-powered suggestions for prioritizing your tasks based on deadlines, importance, and context.",
    icon: ListFilter,
    href: "/smart-assist/task-prioritization",
    cta: "Prioritize Tasks",
  },
  {
    title: "Intelligent Deadline Reminders",
    description: "Receive smart suggestions on when to be reminded for your tasks, considering complexity and workload.",
    icon: BellPlus,
    href: "/smart-assist/deadline-reminders",
    cta: "Set Reminders",
  },
  {
    title: "AI Administration",
    description: "Monitor and manage your AI features, usage statistics, and system configuration.",
    icon: Shield,
    href: "/smart-assist/admin",
    cta: "Manage AI",
  },
];

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
            Leverage AI to enhance your productivity with intelligent suggestions for scheduling, task prioritization, and reminders.
          </CardDescription>
        </CardHeader>
      </Card>

      <AIConnectionTest />

      <AIDemoShowcase />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <feature.icon className="h-7 w-7 text-primary" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Link href={feature.href} passHref className="w-full">
                <Button variant="outline" className="w-full">
                  {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
