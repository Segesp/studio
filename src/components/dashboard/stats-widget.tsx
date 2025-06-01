'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-data';

export function StatsWidget() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Error loading dashboard statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  const taskCompletionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const statsCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      description: `${stats.completedTasks} completed`,
      icon: CheckCircle,
      badge: `${taskCompletionRate}%`,
      badgeVariant: taskCompletionRate >= 75 ? 'default' : taskCompletionRate >= 50 ? 'secondary' : 'destructive',
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      description: stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : 'All on track',
      icon: Clock,
      badge: stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : 'On time',
      badgeVariant: stats.overdueTasks > 0 ? 'destructive' : 'default',
    },
    {
      title: 'Events',
      value: stats.totalEvents,
      description: `${stats.upcomingEvents} upcoming`,
      icon: Calendar,
      badge: stats.upcomingEvents > 0 ? 'Active' : 'None',
      badgeVariant: stats.upcomingEvents > 0 ? 'default' : 'secondary',
    },
    {
      title: 'Documents',
      value: stats.totalDocs,
      description: 'Collaborative docs',
      icon: FileText,
      badge: 'Active',
      badgeVariant: 'default',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <Badge variant={stat.badgeVariant as any} className="text-xs">
                {stat.badge}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
