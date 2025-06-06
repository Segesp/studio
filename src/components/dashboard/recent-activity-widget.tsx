'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  Calendar, 
  FileText,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-data';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const iconMap = {
  task: CheckCircle,
  event: Calendar,
  doc: FileText,
};

const actionMap = {
  created: { icon: Plus, color: 'text-green-600', label: 'Creado' },
  updated: { icon: Edit, color: 'text-blue-600', label: 'Actualizado' },
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completado' },
  deleted: { icon: Trash2, color: 'text-red-600', label: 'Eliminado' },
};

const typeLabels = {
  task: 'Tarea',
  event: 'Evento',
  doc: 'Documento',
};

export function RecentActivityWidget() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Error loading recent activity
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="region" aria-labelledby="recent-activity-title">
      <CardHeader>
        <CardTitle id="recent-activity-title" className="text-lg font-semibold">
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.recentActivity.length === 0 ? (
          <div 
            className="text-center text-muted-foreground py-8"
            role="status"
            aria-label="No recent activity available"
          >
            <div className="mb-2">No hay actividad reciente</div>
            <div className="text-sm">¡Comienza creando tareas o eventos!</div>
          </div>
        ) : (
          <div 
            className="space-y-4" 
            role="feed" 
            aria-label="Recent activity feed"
            aria-describedby="recent-activity-title"
          >
            {stats.recentActivity.map((activity, index) => {
              const TypeIcon = iconMap[activity.type];
              const actionConfig = actionMap[activity.action];
              const ActionIcon = actionConfig.icon;
              
              return (
                <div 
                  key={`${activity.type}-${activity.id}-${activity.timestamp}`} 
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  role="article"
                  tabIndex={0}
                  aria-labelledby={`activity-title-${index}`}
                  aria-describedby={`activity-meta-${index}`}
                >
                  <div className="relative" aria-hidden="true">
                    <TypeIcon className="h-6 w-6 text-muted-foreground" />
                    <ActionIcon className={`h-3 w-3 absolute -bottom-1 -right-1 ${actionConfig.color} bg-background rounded-full`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span 
                        id={`activity-title-${index}`}
                        className="font-medium text-sm truncate"
                      >
                        {activity.title}
                      </span>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        aria-label={`Content type: ${typeLabels[activity.type]}`}
                      >
                        {typeLabels[activity.type]}
                      </Badge>
                    </div>
                    <div 
                      id={`activity-meta-${index}`}
                      className="flex items-center space-x-2 text-xs text-muted-foreground"
                    >
                      <span 
                        className={actionConfig.color}
                        aria-label={`Action: ${actionConfig.label}`}
                      >
                        {actionConfig.label}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span aria-label={`Time: ${formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: es })}`}>
                        {formatDistanceToNow(new Date(activity.timestamp), { 
                          addSuffix: true,
                          locale: es 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
