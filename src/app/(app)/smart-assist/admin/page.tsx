import { AIAdminPanel } from "@/components/smart-assist/ai-admin-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AIAdminPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl mb-8">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">AI Administration</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Monitor and manage your Smart Assist AI features, usage, and configuration.
          </CardDescription>
        </CardHeader>
      </Card>

      <AIAdminPanel />
    </div>
  );
}
