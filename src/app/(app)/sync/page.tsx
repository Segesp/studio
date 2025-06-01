import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, CheckCircle, Wifi, Cloud, Users, FileText, Calendar } from "lucide-react";
import Image from "next/image";
import { ConnectionStatus } from "@/components/sync/connection-status";
import { useWebSocketContext } from "@/components/providers/websocket-provider";

export default function SyncPage() {
  const { connected, connecting, error } = useWebSocketContext();
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin [animation-duration:3s]" />
              <CardTitle className="text-3xl font-headline">Multi-Device Synchronization</CardTitle>
            </div>
            <ConnectionStatus />
          </div>
          <CardDescription className="text-lg">
            Your data is kept up-to-date across all your devices with real-time synchronization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-12 text-center">
            <Image 
              src="https://placehold.co/600x300.png" 
              alt="Sync illustration" 
              width={300} 
              height={150} 
              className="mb-4 rounded-md opacity-70"
              data-ai-hint="cloud sync devices"
            />
            <h2 className="text-2xl font-semibold text-foreground flex items-center">
              {connected ? (
                <CheckCircle className="h-7 w-7 text-green-500 mr-2" />
              ) : connecting ? (
                <RefreshCw className="h-7 w-7 text-yellow-500 mr-2 animate-spin" />
              ) : (
                <Wifi className="h-7 w-7 text-gray-500 mr-2" />
              )}
              {connected ? 'Everything is Synced!' : connecting ? 'Connecting...' : 'Sync Available'}
            </h2>
            <p className="text-muted-foreground">
              {connected ? (
                'Synergy Suite ensures your documents, calendar events, and tasks are always synchronized. Work seamlessly whether you\'re on your desktop, tablet, or phone.'
              ) : error ? (
                `Connection issue: ${error}. Your changes will sync automatically when connection is restored.`
              ) : (
                'Synergy Suite provides real-time synchronization for all your content. Connect to enable live collaboration and instant updates.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Wifi className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Offline Access</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Partial offline access is available. Changes made offline will sync automatically when you reconnect.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Cloud className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Cloud Powered</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your data is securely stored and synchronized through our robust cloud infrastructure.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
