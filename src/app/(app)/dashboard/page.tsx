'use client';

import { Suspense } from 'react';
import { StatsWidget } from '@/components/dashboard/stats-widget';
import { RecentActivityWidget } from '@/components/dashboard/recent-activity-widget';
import { RecentTasksWidget } from '@/components/dashboard/recent-tasks-widget';
import { UpcomingEventsWidget } from '@/components/dashboard/upcoming-events-widget';
import { ProductivityChartsWidget } from '@/components/dashboard/productivity-charts-widget';
import { QuickActionsWidget } from '@/components/dashboard/quick-actions-widget';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart3, Activity, TrendingUp } from 'lucide-react';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
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
      
      {/* Charts skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
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

      <Suspense fallback={<DashboardSkeleton />}>
        {/* Estadísticas principales */}
        <section>
          <StatsWidget />
        </section>

        {/* Acciones rápidas */}
        <section>
          <QuickActionsWidget />
        </section>

        {/* Gráficos de productividad */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Análisis de Productividad</h2>
          </div>
          <ProductivityChartsWidget />
        </section>

        {/* Contenido principal - Tareas y Eventos */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentTasksWidget />
          <UpcomingEventsWidget />
        </section>

        {/* Actividad reciente */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Actividad Reciente</h2>
          </div>
          <RecentActivityWidget />
        </section>
      </Suspense>
    </div>
  );
}
