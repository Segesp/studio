'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Plus,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { useUpcomingEvents } from '@/hooks/use-dashboard-data';
import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

function getDateLabel(date: Date) {
  if (isToday(date)) {
    return 'Hoy';
  } else if (isTomorrow(date)) {
    return 'Mañana';
  } else {
    return format(date, 'dd MMM', { locale: es });
  }
}

function getTimeUntil(date: Date) {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) {
    return 'En curso';
  } else if (diff < 60 * 60 * 1000) { // Menos de 1 hora
    const minutes = Math.floor(diff / (60 * 1000));
    return `En ${minutes}m`;
  } else if (diff < 24 * 60 * 60 * 1000) { // Menos de 1 día
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `En ${hours}h`;
  } else {
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  }
}

export function UpcomingEventsWidget() {
  const { data: events, isLoading, error } = useUpcomingEvents(8);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Skeleton className="h-3 w-3 rounded-full" />
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

  if (error || !events) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Error al cargar los eventos próximos
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="region" aria-labelledby="upcoming-events-title">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle id="upcoming-events-title" className="text-lg font-semibold">
          Próximos Eventos
        </CardTitle>
        <Link href="/interactive-calendar" aria-label="Go to interactive calendar">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
            <p className="text-muted-foreground mb-4">No hay eventos próximos</p>
            <Link href="/interactive-calendar">
              <Button size="sm" aria-label="Create new event">
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Crear evento
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Upcoming events list">
            {events.slice(0, 6).map((event) => {
              const startDate = new Date(event.startDate);
              const endDate = new Date(event.endDate);
              const isOngoing = new Date() >= startDate && new Date() <= endDate;

              return (
                <div 
                  key={event.id} 
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  role="listitem"
                  tabIndex={0}
                  aria-labelledby={`event-title-${event.id}`}
                  aria-describedby={`event-time-${event.id}`}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color || '#3b82f6' }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p 
                      id={`event-title-${event.id}`}
                      className="text-sm font-medium truncate"
                    >
                      {event.title}
                    </p>
                    <div 
                      id={`event-time-${event.id}`}
                      className="flex items-center space-x-2 mt-1"
                    >
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                        {getDateLabel(startDate)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                        {format(startDate, 'HH:mm', { locale: es })}
                        {!isOngoing && format(endDate, 'HH:mm', { locale: es }) !== format(startDate, 'HH:mm', { locale: es }) && 
                          ` - ${format(endDate, 'HH:mm', { locale: es })}`
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {isOngoing ? (
                      <Badge 
                        variant="default" 
                        className="text-xs bg-green-100 text-green-700"
                        aria-label="Event status: In progress"
                      >
                        En curso
                      </Badge>
                    ) : (
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        aria-label={`Time until event: ${getTimeUntil(startDate)}`}
                      >
                        {getTimeUntil(startDate)}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {events.length > 6 && (
              <div className="pt-2 border-t">
                <Link href="/interactive-calendar">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    aria-label={`View all ${events.length} events in calendar`}
                  >
                    Ver todos los eventos ({events.length})
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
