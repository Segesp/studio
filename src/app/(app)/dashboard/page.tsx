'use client';

import { Suspense, memo, lazy } from 'react';
import { LazyWidget } from '@/components/ui/lazy-widget';
import { AnimatedSkeleton } from '@/components/ui/animated-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart3, Activity, TrendingUp } from 'lucide-react';
import { PageTransition, StaggerContainer, FadeInUp } from '@/components/ui/page-transition';

// Direct lazy imports to avoid typing issues
const StatsWidget = lazy(() => import('@/components/dashboard/stats-widget').then(m => ({ default: m.StatsWidget })));
const QuickActionsWidget = lazy(() => import('@/components/dashboard/quick-actions-widget').then(m => ({ default: m.QuickActionsWidget })));
const ProductivityChartsWidget = lazy(() => import('@/components/dashboard/productivity-charts-widget-optimized').then(m => ({ default: m.ProductivityChartsWidget })));
const RecentTasksWidget = lazy(() => import('@/components/dashboard/recent-tasks-widget').then(m => ({ default: m.RecentTasksWidget })));
const UpcomingEventsWidget = lazy(() => import('@/components/dashboard/upcoming-events-widget').then(m => ({ default: m.UpcomingEventsWidget })));
const RecentActivityWidget = lazy(() => import('@/components/dashboard/recent-activity-widget').then(m => ({ default: m.RecentActivityWidget })));

// Memoized skeleton component for better performance
const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <AnimatedSkeleton key={i} variant="card" className="h-32" />
        ))}
      </div>
      
      {/* Quick actions skeleton */}
      <AnimatedSkeleton variant="card" className="h-48" />
      
      {/* Charts skeleton */}
      <AnimatedSkeleton variant="chart" className="h-96" />
      
      {/* Tasks and events skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AnimatedSkeleton variant="card" className="h-64" />
        <AnimatedSkeleton variant="card" className="h-64" />
      </div>
      
      {/* Activity skeleton */}
      <AnimatedSkeleton variant="card" className="h-56" />
    </div>
  );
});

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <FadeInUp>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Bienvenido a tu panel de control de Synergy Suite
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>Tiempo real</span>
              </div>
            </div>
          </div>
        </FadeInUp>

        <Suspense fallback={<DashboardSkeleton />}>
          <StaggerContainer className="space-y-6">
            {/* Estadísticas principales */}
            <FadeInUp delay={100}>
              <section>
                <LazyWidget skeletonVariant="card">
                  <StatsWidget />
                </LazyWidget>
              </section>
            </FadeInUp>

            {/* Acciones rápidas */}
            <FadeInUp delay={200}>
              <section>
                <LazyWidget skeletonVariant="card">
                  <QuickActionsWidget />
                </LazyWidget>
              </section>
            </FadeInUp>

            {/* Gráficos de productividad */}
            <FadeInUp delay={300}>
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Análisis de Productividad</h2>
                </div>
                <LazyWidget skeletonVariant="chart">
                  <ProductivityChartsWidget />
                </LazyWidget>
              </section>
            </FadeInUp>

            {/* Contenido principal - Tareas y Eventos */}
            <FadeInUp delay={400}>
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <LazyWidget skeletonVariant="card">
                  <RecentTasksWidget />
                </LazyWidget>
                <LazyWidget skeletonVariant="card">
                  <UpcomingEventsWidget />
                </LazyWidget>
              </section>
            </FadeInUp>

            {/* Actividad reciente */}
            <FadeInUp delay={500}>
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Actividad Reciente</h2>
                </div>
                <LazyWidget skeletonVariant="card">
                  <RecentActivityWidget />
                </LazyWidget>
              </section>
            </FadeInUp>
          </StaggerContainer>
        </Suspense>
      </div>
    </PageTransition>
  );
}
