'use client';

import { memo, useMemo } from 'react';
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
import { HoverLift } from '@/components/ui/page-transition';

// Memoized loading skeleton
const StatsLoadingSkeleton = memo(function StatsLoadingSkeleton() {
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
});

// Memoized stat card
const StatCard = memo(function StatCard({ 
  stat 
}: { 
  stat: {
    title: string;
    value: number;
    description: string;
    icon: any;
    badge: string;
    badgeVariant: string;
  } 
}) {
  const titleId = `stat-title-${stat.title.replace(/\s+/g, '-').toLowerCase()}`;
  const descId = `stat-desc-${stat.title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <HoverLift>
      <Card 
        className="hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" 
        tabIndex={0}
        role="article"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle 
            className="text-sm font-medium text-muted-foreground"
            id={titleId}
          >
            {stat.title}
          </CardTitle>
          <stat.icon 
            className="h-4 w-4 text-muted-foreground" 
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent>
          <div 
            className="text-2xl font-bold mb-1" 
            aria-label={`${stat.value} ${stat.title.toLowerCase()}`}
          >
            {stat.value}
          </div>
          <div className="flex items-center justify-between">
            <p 
              className="text-xs text-muted-foreground"
              id={descId}
            >
              {stat.description}
            </p>
            <Badge 
              variant={stat.badgeVariant as any} 
              className="text-xs"
              aria-label={`Status: ${stat.badge}`}
            >
              {stat.badge}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </HoverLift>
  );
});

export const StatsWidget = memo(function StatsWidget() {
  const { data: stats, isLoading, error } = useDashboardStats();

  // Memoize expensive calculations
  const statsCards = useMemo(() => {
    if (!stats) return [];

    const taskCompletionRate = stats.totalTasks > 0 
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
      : 0;

    return [
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
  }, [stats]);

  if (isLoading) {
    return <StatsLoadingSkeleton />;
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

  return (
    <div 
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" 
      role="region" 
      aria-label="Dashboard statistics overview"
    >
      {statsCards.map((stat) => (
        <StatCard key={stat.title} stat={stat} />
      ))}
    </div>
  );
});
