'use client';

import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useProductivityMetrics } from '@/hooks/use-dashboard-data';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatedChart, AnimatedCounter, AnimatedProgressRing } from '@/components/ui/chart-animations';
import { MicroInteraction } from '@/components/ui/micro-interactions';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Memoized loading skeleton
const ChartsLoadingSkeleton = memo(function ChartsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
});

// Main component
function ProductivityChartsWidget() {
  const { data: metrics, isLoading, error } = useProductivityMetrics();

  if (isLoading) {
    return <ChartsLoadingSkeleton />;
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Análisis de Productividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Error al cargar las métricas de productividad
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar datos para gráficos
  const weeklyData = metrics.weeklyActivity?.map((day: any) => ({
    date: format(new Date(day.date), 'EEE', { locale: es }),
    fullDate: day.date,
    tareas: day.tasksCompleted || 0,
    eventos: day.eventsCreated || 0,
    documentos: day.docsCreated || 0,
    total: (day.tasksCompleted || 0) + (day.eventsCreated || 0) + (day.docsCreated || 0)
  })) || [];

  const completionData = [
    { name: 'Completadas', value: metrics.completionRate || 0, color: '#10b981' },
    { name: 'Pendientes', value: 100 - (metrics.completionRate || 0), color: '#e5e7eb' }
  ];

  const activityBreakdown = [
    { name: 'Tareas', value: metrics.totalTasksCompleted || 0, color: '#3b82f6' },
    { name: 'Eventos', value: metrics.totalEventsCreated || 0, color: '#10b981' },
    { name: 'Documentos', value: metrics.totalDocsCreated || 0, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  const productivityTrend = metrics.productivityTrend || 0;
  const isTrendingUp = productivityTrend > 0;

  return (
    <div 
      className="grid grid-cols-1 gap-4 lg:grid-cols-2" 
      role="region" 
      aria-label="Productivity charts and analytics"
    >
      {/* Actividad Semanal */}
      <Card className="lg:col-span-2" role="region" aria-labelledby="weekly-activity-title">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle id="weekly-activity-title" className="text-lg font-semibold">
              Actividad de la Semana
            </CardTitle>
            <p 
              className="text-sm text-muted-foreground mt-1"
              id="weekly-activity-desc"
              aria-describedby="weekly-activity-title"
            >
              Últimos 7 días de actividad
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isTrendingUp ? (
              <TrendingUp className="h-4 w-4 text-green-600" aria-label="Trending up" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" aria-label="Trending down" />
            )}
            <Badge 
              variant={isTrendingUp ? 'default' : 'destructive'} 
              className="text-xs"
              aria-label={`Productivity trend: ${isTrendingUp ? 'increasing' : 'decreasing'} by ${Math.abs(productivityTrend).toFixed(1)} percent`}
            >
              {isTrendingUp ? '+' : ''}{productivityTrend.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            role="img" 
            aria-labelledby="weekly-activity-title" 
            aria-describedby="weekly-activity-desc chart-summary"
          >
            <div 
              id="chart-summary" 
              className="sr-only"
              aria-live="polite"
            >
              Weekly activity chart showing tasks, events, and documents created over the last 7 days. 
              {weeklyData.length > 0 && `Total items this week: ${weeklyData.reduce((sum: number, day: any) => sum + day.total, 0)}.`}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return format(new Date(payload[0].payload.fullDate), 'EEEE, dd MMM', { locale: es });
                    }
                    return label;
                  }}
                />
                <Bar dataKey="tareas" fill="#3b82f6" name="Tareas" radius={[2, 2, 0, 0]} />
                <Bar dataKey="eventos" fill="#10b981" name="Eventos" radius={[2, 2, 0, 0]} />
                <Bar dataKey="documentos" fill="#f59e0b" name="Documentos" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tasa de Completitud */}
      <Card role="region" aria-labelledby="completion-rate-title">
        <CardHeader>
          <CardTitle id="completion-rate-title" className="text-lg font-semibold">
            Tasa de Completitud
          </CardTitle>
          <p 
            className="text-sm text-muted-foreground"
            id="completion-rate-desc"
            aria-describedby="completion-rate-title"
          >
            Porcentaje de tareas completadas
          </p>
        </CardHeader>
        <CardContent>
          <div 
            className="flex items-center justify-center"
            role="img" 
            aria-labelledby="completion-rate-title" 
            aria-describedby="completion-rate-desc completion-summary"
          >
            <div 
              id="completion-summary" 
              className="sr-only"
              aria-live="polite"
            >
              Task completion rate pie chart showing {(metrics.completionRate || 0).toFixed(1)}% of tasks completed.
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <div 
              className="text-2xl font-bold"
              aria-label={`Completion rate: ${(metrics.completionRate || 0).toFixed(1)} percent`}
            >
              {(metrics.completionRate || 0).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Tareas completadas</p>
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Actividades */}
      <Card role="region" aria-labelledby="activity-distribution-title">
        <CardHeader>
          <CardTitle id="activity-distribution-title" className="text-lg font-semibold">
            Distribución de Actividades
          </CardTitle>
          <p 
            className="text-sm text-muted-foreground"
            id="activity-distribution-desc"
            aria-describedby="activity-distribution-title"
          >
            Actividades de los últimos 7 días
          </p>
        </CardHeader>
        <CardContent>
          {activityBreakdown.length > 0 ? (
            <>
              <div 
                role="img" 
                aria-labelledby="activity-distribution-title" 
                aria-describedby="activity-distribution-desc distribution-summary"
              >
                <div 
                  id="distribution-summary" 
                  className="sr-only"
                  aria-live="polite"
                >
                  Activity distribution pie chart showing breakdown of tasks, events, and documents. 
                  {activityBreakdown.map(item => `${item.name}: ${item.value}`).join(', ')}.
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={activityBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {activityBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div 
                className="space-y-2 mt-4" 
                role="list" 
                aria-label="Activity breakdown details"
              >
                {activityBreakdown.map((item, index) => (
                  <div 
                    key={item.name} 
                    className="flex items-center justify-between"
                    role="listitem"
                    aria-label={`${item.name}: ${item.value} items`}
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div 
              className="text-center py-8"
              role="status"
              aria-label="No activity data available"
            >
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
              <p className="text-muted-foreground">No hay actividad registrada</p>
            </div>
                    )}
        </CardContent>
      </Card>
    </div>
  );
}

// Export memoized version
export default memo(ProductivityChartsWidget);
