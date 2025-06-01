'use client';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function ProductivityChartsWidget() {
  const { data: metrics, isLoading, error } = useProductivityMetrics();

  if (isLoading) {
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Actividad Semanal */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Actividad de la Semana</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Últimos 7 días de actividad
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isTrendingUp ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <Badge variant={isTrendingUp ? 'default' : 'destructive'} className="text-xs">
              {isTrendingUp ? '+' : ''}{productivityTrend.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Tasa de Completitud */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Tasa de Completitud</CardTitle>
          <p className="text-sm text-muted-foreground">
            Porcentaje de tareas completadas
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
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
            <div className="text-2xl font-bold">{(metrics.completionRate || 0).toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Tareas completadas</p>
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Actividades */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribución de Actividades</CardTitle>
          <p className="text-sm text-muted-foreground">
            Actividades de los últimos 7 días
          </p>
        </CardHeader>
        <CardContent>
          {activityBreakdown.length > 0 ? (
            <>
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
              <div className="space-y-2 mt-4">
                {activityBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
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
    </div>
  );
}
