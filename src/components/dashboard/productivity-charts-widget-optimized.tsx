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
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

// Memoized chart components
const WeeklyActivityChart = memo(function WeeklyActivityChart({ 
  data, 
  productivityTrend 
}: { 
  data: any[]; 
  productivityTrend: number; 
}) {
  const isTrendingUp = productivityTrend > 0;

  return (
    <MicroInteraction type="hover">
      <Card className="lg:col-span-2" role="region" aria-labelledby="weekly-activity-title">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle id="weekly-activity-title" className="text-lg font-semibold">
              Actividad de la Semana
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
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
            >
              <AnimatedCounter 
                value={productivityTrend} 
                formatValue={(val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
              />
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatedChart delay={100} className="w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
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
                <Bar dataKey="horas" fill="#f59e0b" name="Horas" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </AnimatedChart>
        </CardContent>
      </Card>
    </MicroInteraction>
  );
});

const TaskStatusChart = memo(function TaskStatusChart({ 
  data, 
  completionRate 
}: { 
  data: any[]; 
  completionRate: number; 
}) {
  return (
    <MicroInteraction type="hover">
      <Card role="region" aria-labelledby="task-status-title">
        <CardHeader>
          <CardTitle id="task-status-title" className="text-lg font-semibold">
            Estado de Tareas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribución actual de tareas
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <AnimatedProgressRing 
                progress={completionRate} 
                size={120} 
                strokeWidth={8}
                delay={200}
              />
            </div>
          </div>
          <AnimatedChart delay={300} className="w-full">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
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
          </AnimatedChart>
          <div className="space-y-2 mt-4">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">
                  <AnimatedCounter value={item.value} delay={400 + (index * 100)} />
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MicroInteraction>
  );
});

const ActivityBreakdownChart = memo(function ActivityBreakdownChart({ 
  data 
}: { 
  data: any[]; 
}) {
  return (
    <MicroInteraction type="hover">
      <Card role="region" aria-labelledby="activity-breakdown-title">
        <CardHeader>
          <CardTitle id="activity-breakdown-title" className="text-lg font-semibold">
            Distribución de Actividades
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Actividades de los últimos 7 días
          </p>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <>
              <AnimatedChart delay={400} className="w-full">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
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
              </AnimatedChart>
              <div className="space-y-2 mt-4">
                {data.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      <AnimatedCounter value={item.value} delay={500 + (index * 100)} />
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay actividad registrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </MicroInteraction>
  );
});

export const ProductivityChartsWidget = memo(function ProductivityChartsWidget() {
  const { data: metrics, isLoading, error } = useProductivityMetrics();

  // Memoize expensive data transformations
  const chartData = useMemo(() => {
    if (!metrics) return null;

    const weeklyData = metrics.weeklyActivity?.map((day: any) => ({
      date: format(new Date(day.date), 'EEE', { locale: es }),
      fullDate: day.date,
      tareas: day.tasksCompleted || 0,
      eventos: day.eventsAttended || 0,
      horas: day.hoursWorked || 0,
    })) || [];

    const taskStatusData = [
      { name: 'Completadas', value: metrics.completedTasks || 0, color: COLORS[1] },
      { name: 'En Progreso', value: metrics.inProgressTasks || 0, color: COLORS[0] },
      { name: 'Pendientes', value: metrics.pendingTasks || 0, color: COLORS[2] },
      { name: 'Vencidas', value: metrics.overdueTasks || 0, color: COLORS[3] },
    ];

    const activityBreakdown = metrics.activityBreakdown?.map((item: any, index: number) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    })) || [];

    const completionRate = metrics.totalTasks > 0 
      ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) 
      : 0;

    const productivityTrend = metrics.productivityTrend || 0;

    return {
      weeklyData,
      taskStatusData,
      activityBreakdown,
      completionRate,
      productivityTrend
    };
  }, [metrics]);

  if (isLoading) {
    return <ChartsLoadingSkeleton />;
  }

  if (error || !metrics || !chartData) {
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

  const { weeklyData, taskStatusData, activityBreakdown, completionRate, productivityTrend } = chartData;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <WeeklyActivityChart 
        data={weeklyData} 
        productivityTrend={productivityTrend}
      />
      <TaskStatusChart 
        data={taskStatusData} 
        completionRate={completionRate}
      />
      <ActivityBreakdownChart 
        data={activityBreakdown}
      />
    </div>
  );
});
