'use client';

import { useEffect } from 'react';
import { Bell, X, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { useWebSocket } from '@/hooks/use-websocket';
import { formatDistanceToNow } from 'date-fns';

export function RealtimeNotifications() {
  const { connected } = useWebSocket();
  const {
    notifications,
    dismissNotification,
    clearAllNotifications,
    hasNotifications,
    unreadCount,
  } = useRealtimeNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {connected ? (
            <Bell className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4 opacity-50" />
          )}
          {hasNotifications && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="bottom" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {connected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <CardTitle className="text-sm">Real-time Updates</CardTitle>
              </div>
              {hasNotifications && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
            <CardDescription className="text-xs">
              {connected 
                ? `Connected • ${unreadCount} notifications`
                : 'Disconnected • Real-time updates paused'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {!hasNotifications ? (
              <div className="text-center py-6">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No new updates</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll see real-time notifications here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => dismissNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
