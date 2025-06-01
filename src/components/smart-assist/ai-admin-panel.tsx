'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface AIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  topFeatures: { name: string; usage: number }[];
}

interface AISystemHealth {
  apiKeyConfigured: boolean;
  lastSuccessfulRequest: string | null;
  systemStatus: 'healthy' | 'degraded' | 'offline';
  uptime: number;
}

export function AIAdminPanel() {
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [health, setHealth] = useState<AISystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration - in a real app, this would come from your analytics
  const loadStats = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStats({
      totalRequests: 147,
      successfulRequests: 134,
      failedRequests: 13,
      averageResponseTime: 1.2,
      topFeatures: [
        { name: 'Event Scheduling', usage: 45 },
        { name: 'Task Prioritization', usage: 38 },
        { name: 'Deadline Reminders', usage: 27 }
      ]
    });
    
    setHealth({
      apiKeyConfigured: !!process.env.NEXT_PUBLIC_DEMO_MODE, // Mock check
      lastSuccessfulRequest: new Date(Date.now() - 300000).toISOString(),
      systemStatus: 'healthy',
      uptime: 99.8
    });
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>AI System Administration</CardTitle>
                <CardDescription>Monitor and manage Smart Assist AI features</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={loadStats} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="usage">Usage Stats</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">High performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.averageResponseTime || 0}s</div>
                <p className="text-xs text-muted-foreground">Excellent performance</p>
              </CardContent>
            </Card>
          </div>

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most popular AI features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topFeatures.map((feature) => (
                  <div key={feature.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{feature.name}</span>
                      <span>{feature.usage} requests</span>
                    </div>
                    <Progress value={(feature.usage / stats.totalRequests) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          {health && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(health.systemStatus)}
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Overall Status</span>
                      <Badge variant={health.systemStatus === 'healthy' ? 'default' : 'destructive'}>
                        {health.systemStatus.charAt(0).toUpperCase() + health.systemStatus.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Uptime</span>
                      <span className="font-mono">{health.uptime}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>API Configuration</span>
                      <Badge variant={health.apiKeyConfigured ? 'default' : 'destructive'}>
                        {health.apiKeyConfigured ? 'Configured' : 'Missing'}
                      </Badge>
                    </div>
                    
                    {health.lastSuccessfulRequest && (
                      <div className="flex justify-between items-center">
                        <span>Last Successful Request</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(health.lastSuccessfulRequest).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {!health.apiKeyConfigured && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Configuration Required</AlertTitle>
                  <AlertDescription>
                    Google AI API key is not configured. AI features will use fallback responses.
                    <br />
                    <Button variant="link" className="h-auto p-0 mt-2" asChild>
                      <a href="/docs/smart-assist-setup.md" target="_blank" rel="noopener noreferrer">
                        View setup instructions <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Request Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Successful Requests</span>
                      <span className="text-green-600 font-semibold">{stats.successfulRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed Requests</span>
                      <span className="text-red-600 font-semibold">{stats.failedRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Requests</span>
                      <span className="font-semibold">{stats.totalRequests}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Response Time</span>
                      <span className="font-semibold">{stats.averageResponseTime}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-semibold">
                        {Math.round((stats.successfulRequests / stats.totalRequests) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Manage your AI service settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertTitle>Environment Configuration</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>AI features are configured through environment variables:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">GOOGLE_API_KEY</code> - Google AI API key</li>
                    <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NODE_ENV</code> - Environment mode</li>
                  </ul>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                        Get API Key <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
