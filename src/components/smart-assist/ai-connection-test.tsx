'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ConnectionStatus {
  success: boolean;
  message: string;
  hasGoogleApiKey: boolean;
  timestamp: string;
}

export function AIConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/test-connection');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to test AI connection');
      }
      
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    if (isLoading) return <Loader className="h-4 w-4" />;
    if (!status) return <XCircle className="h-4 w-4 text-red-500" />;
    if (status.success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusVariant = () => {
    if (error) return "destructive";
    if (!status) return "destructive";
    if (status.success) return "default";
    return "default";
  };

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary">Testing...</Badge>;
    if (error) return <Badge variant="destructive">Error</Badge>;
    if (!status) return <Badge variant="destructive">Failed</Badge>;
    if (status.success) return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>;
    return <Badge variant="secondary">Not Configured</Badge>;
  };

  return (
    <Card className="shadow-lg mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <CardTitle className="text-lg">AI Service Status</CardTitle>
            {getStatusBadge()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testConnection}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
        </div>
        <CardDescription>
          Google AI API connection status for Smart Assist features
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {status && (
          <Alert variant={getStatusVariant()} className={status.success ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-200" : undefined}>
            {status.success ? (
              <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle>
              {status.success ? 'AI Features Available' : 'AI Configuration Required'}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{status.message}</p>
              {!status.hasGoogleApiKey && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                  <p className="text-sm font-medium mb-2">Para habilitar las funciones de IA:</p>
                  <ol className="text-sm list-decimal list-inside space-y-1">
                    <li>Obtén tu clave API de Google AI Studio: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://aistudio.google.com/app/apikey</a></li>
                    <li>Agrega la clave a tu archivo <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.env.local</code></li>
                    <li>Reinicia el servidor de desarrollo</li>
                  </ol>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Última verificación: {new Date(status.timestamp).toLocaleString()}
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
