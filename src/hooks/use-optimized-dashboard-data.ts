'use client';

import { useMemo, useCallback } from 'react';
import { useDashboardStats, useProductivityMetrics } from './use-dashboard-data';

// Optimized dashboard data hook with memoization and caching
export function useOptimizedDashboardData() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useProductivityMetrics();

  // Memoize combined loading state
  const isLoading = useMemo(() => {
    return statsLoading || metricsLoading;
  }, [statsLoading, metricsLoading]);

  // Memoize combined error state
  const error = useMemo(() => {
    return statsError || metricsError;
  }, [statsError, metricsError]);

  // Memoize dashboard summary data
  const dashboardSummary = useMemo(() => {
    if (!stats || !metrics) return null;

    return {
      totalTasks: stats.totalTasks || 0,
      completedTasks: stats.completedTasks || 0,
      pendingTasks: stats.pendingTasks || 0,
      overdueTasks: stats.overdueTasks || 0,
      totalEvents: stats.totalEvents || 0,
      upcomingEvents: stats.upcomingEvents || 0,
      totalDocs: stats.totalDocs || 0,
      completionRate: stats.totalTasks > 0 
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
        : 0,
      productivityTrend: metrics.productivityTrend || 0,
      weeklyProgress: metrics.weeklyActivity?.length || 0,
    };
  }, [stats, metrics]);

  // Memoize performance metrics
  const performanceMetrics = useMemo(() => {
    if (!metrics) return null;

    const weeklyTotal = metrics.weeklyActivity?.reduce((sum: number, day: any) => {
      return sum + (day.tasksCompleted || 0) + (day.eventsAttended || 0) + (day.hoursWorked || 0);
    }, 0) || 0;

    const averageDaily = weeklyTotal / 7;

    return {
      weeklyTotal,
      averageDaily: Math.round(averageDaily * 10) / 10,
      mostProductiveDay: metrics.weeklyActivity?.reduce((max: any, day: any) => {
        const dayTotal = (day.tasksCompleted || 0) + (day.eventsAttended || 0) + (day.hoursWorked || 0);
        const maxTotal = (max?.tasksCompleted || 0) + (max?.eventsAttended || 0) + (max?.hoursWorked || 0);
        return dayTotal > maxTotal ? day : max;
      }, null),
      improvementArea: (() => {
        if (!metrics.weeklyActivity) return 'tasks';
        const totals = metrics.weeklyActivity.reduce((acc: any, day: any) => ({
          tasks: acc.tasks + (day.tasksCompleted || 0),
          events: acc.events + (day.eventsAttended || 0),
          hours: acc.hours + (day.hoursWorked || 0),
        }), { tasks: 0, events: 0, hours: 0 });

        const min = Math.min(totals.tasks, totals.events, totals.hours);
        if (min === totals.tasks) return 'tasks';
        if (min === totals.events) return 'events';
        return 'focus-time';
      })(),
    };
  }, [metrics]);

  // Callback for refreshing data
  const refreshData = useCallback(() => {
    // Implementation would depend on your data fetching strategy
    console.log('Refreshing dashboard data...');
  }, []);

  // Callback for getting cached data
  const getCachedData = useCallback(() => {
    return {
      stats,
      metrics,
      summary: dashboardSummary,
      performance: performanceMetrics,
    };
  }, [stats, metrics, dashboardSummary, performanceMetrics]);

  return {
    // Raw data
    stats,
    metrics,
    
    // Loading and error states
    isLoading,
    error,
    
    // Processed data
    summary: dashboardSummary,
    performance: performanceMetrics,
    
    // Utilities
    refreshData,
    getCachedData,
    
    // Computed properties
    hasData: Boolean(stats && metrics),
    isEmpty: Boolean(!isLoading && (!stats || !metrics)),
  };
}

// Hook for dashboard widget optimization
export function useWidgetOptimization(widgetId: string) {
  const { isLoading, hasData } = useOptimizedDashboardData();

  // Memoize widget-specific loading state
  const shouldShowSkeleton = useMemo(() => {
    return isLoading && !hasData;
  }, [isLoading, hasData]);

  // Memoize widget visibility state
  const isVisible = useMemo(() => {
    return hasData && !isLoading;
  }, [hasData, isLoading]);

  // Performance tracking for widgets
  const trackWidgetPerformance = useCallback((action: string, duration?: number) => {
    if (typeof window !== 'undefined' && window.performance) {
      console.log(`Widget ${widgetId} - ${action}${duration ? ` (${duration}ms)` : ''}`);
    }
  }, [widgetId]);

  return {
    shouldShowSkeleton,
    isVisible,
    trackWidgetPerformance,
  };
}
