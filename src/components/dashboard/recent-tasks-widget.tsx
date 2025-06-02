'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useRecentTasks } from '@/hooks/use-dashboard-data';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

const priorityConfig = {
  1: { label: 'Baja', color: 'text-green-600', bg: 'bg-green-100' },
  2: { label: 'Media', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  3: { label: 'Alta', color: 'text-red-600', bg: 'bg-red-100' },
};

const statusConfig = {
  pending: { icon: Circle, label: 'Pendiente', color: 'text-gray-500' },
  in_progress: { icon: Clock, label: 'En progreso', color: 'text-blue-500' },
  completed: { icon: CheckCircle, label: 'Completada', color: 'text-green-500' },
  overdue: { icon: AlertTriangle, label: 'Vencida', color: 'text-red-500' },
};

export function RecentTasksWidget() {
  const { data: tasks, isLoading, error } = useRecentTasks(8);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Tareas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !tasks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Tareas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Error al cargar las tareas recientes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="region" aria-labelledby="recent-tasks-title">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle id="recent-tasks-title" className="text-lg font-semibold">
          Tareas Recientes
        </CardTitle>
        <Link href="/task-list" aria-label="Go to all tasks">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Circle className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-muted-foreground mb-4">No hay tareas recientes</p>
            <Link href="/task-list">
              <Button size="sm" aria-label="Create new task">
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Crear tarea
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Recent tasks list">
            {tasks.slice(0, 6).map((task) => {
              const statusInfo = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;
              const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig[1];
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

              return (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  role="listitem"
                  tabIndex={0}
                  aria-labelledby={`task-title-${task.id}`}
                  aria-describedby={`task-meta-${task.id}`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <statusInfo.icon 
                      className={`h-5 w-5 flex-shrink-0 ${isOverdue ? 'text-red-500' : statusInfo.color}`} 
                      aria-label={`Task status: ${isOverdue ? 'Overdue' : statusInfo.label}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p 
                        id={`task-title-${task.id}`}
                        className="text-sm font-medium truncate"
                      >
                        {task.title}
                      </p>
                      <div 
                        id={`task-meta-${task.id}`}
                        className="flex items-center space-x-2 mt-1"
                      >
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(task.createdAt), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                        {task.dueDate && (
                          <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                            • Vence {formatDistanceToNow(new Date(task.dueDate), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${priorityInfo.color} ${priorityInfo.bg}`}
                      aria-label={`Priority: ${priorityInfo.label}`}
                    >
                      {priorityInfo.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {tasks.length > 6 && (
              <div className="pt-2 border-t">
                <Link href="/task-list">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    aria-label={`View all ${tasks.length} tasks`}
                  >
                    Ver todas las tareas ({tasks.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
