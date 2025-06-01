import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalEvents: number;
  upcomingEvents: number;
  totalDocs: number;
  recentActivity: Array<{
    id: string;
    type: 'task' | 'event' | 'doc';
    action: 'created' | 'updated' | 'completed' | 'deleted';
    title: string;
    timestamp: string;
  }>;
}

export interface RecentTasks {
  id: string;
  title: string;
  status: string;
  priority: number;
  dueDate?: string;
  createdAt: string;
}

export interface UpcomingEvents {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
}

export interface RecentDocs {
  id: string;
  title: string;
  updatedAt: string;
  owner: {
    name?: string;
    email?: string;
  };
}

// Hook para obtener estadísticas del dashboard
export function useDashboardStats() {
  const { data: session } = useSession();
  
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
}

// Hook para obtener tareas recientes
export function useRecentTasks(limit = 5) {
  const { data: session } = useSession();
  
  return useQuery<RecentTasks[]>({
    queryKey: ['recent-tasks', session?.user?.id, limit],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?limit=${limit}&sort=recent`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent tasks');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });
}

// Hook para obtener eventos próximos
export function useUpcomingEvents(limit = 5) {
  const { data: session } = useSession();
  
  return useQuery<UpcomingEvents[]>({
    queryKey: ['upcoming-events', session?.user?.id, limit],
    queryFn: async () => {
      const response = await fetch(`/api/events?limit=${limit}&upcoming=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming events');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });
}

// Hook para obtener documentos recientes
export function useRecentDocs(limit = 5) {
  const { data: session } = useSession();
  
  return useQuery<RecentDocs[]>({
    queryKey: ['recent-docs', session?.user?.id, limit],
    queryFn: async () => {
      const response = await fetch(`/api/docs?limit=${limit}&sort=recent`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent docs');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });
}

// Hook para obtener métricas de productividad (últimos 7 días)
export function useProductivityMetrics() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['productivity-metrics', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/productivity');
      if (!response.ok) {
        throw new Error('Failed to fetch productivity metrics');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 60000, // Refrescar cada minuto
  });
}
