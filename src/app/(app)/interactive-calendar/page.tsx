'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { EventForm } from '@/components/calendar/EventForm';
import type { CalendarEventForm } from '@/components/calendar/EventForm';
import { useCalendarSync } from '@/hooks/use-websocket';
import { useSession } from 'next-auth/react';
import { ConnectionStatus } from '@/components/sync/connection-status';

import { CalendarDays, Plus, Filter, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader } from '@/components/ui/loader';

// Define the Event interface basado en la API (fechas string)
interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  color?: string;
  isPublic?: boolean;
  start?: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    description: string;
    isPublic?: boolean;
  };
}

// Function to fetch events from the API
const fetchEvents = async (): Promise<CalendarEvent[]> => {
  const res = await fetch('/api/events');
  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }
  const events: CalendarEvent[] = await res.json();

  // Map your API's startDate/endDate to FullCalendar's 'start'/'end'
  return events.map(event => ({
    ...event,
    start: event.startDate,
    end: event.endDate,
    backgroundColor: event.color || '#3b82f6',
    borderColor: event.color || '#3b82f6',
    extendedProps: {
      description: event.description,
      isPublic: event.isPublic,
    },
  }));
};

export default function InteractiveCalendarPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data: events, isLoading, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });

  // State management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventForm | null>(null);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [currentView, setCurrentView] = useState('timeGridWeek');

  // Real-time calendar synchronization
  const { syncEventUpdate, syncEventCreation, syncEventDeletion, eventUpdates, connected } = useCalendarSync(session?.user?.id || null);

  // Listen for real-time event updates from other clients
  useEffect(() => {
    if (!connected || eventUpdates.length === 0) return;

    // Invalidate queries when receiving real-time updates from other clients
    const latestUpdate = eventUpdates[eventUpdates.length - 1];
    console.log('Received real-time event update:', latestUpdate);
    
    // Refresh events when we receive updates from other clients
    queryClient.invalidateQueries({ queryKey: ['events'] } as InvalidateQueryFilters);
    
  }, [eventUpdates, connected, queryClient]);

    // Filter events based on public filter
  const filteredEvents = events?.filter(event => 
    showPublicOnly ? event.extendedProps?.isPublic : true
  ) || [];

  // Placeholder function to close the form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  // Create new event
  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  // Placeholder callback functions for FullCalendar interactions
  const handleDateSelect = (selectInfo: any) => {
    setEditingEvent({
      id: '',
      title: '',
      startDate: selectInfo.start ? new Date(selectInfo.start) : new Date(),
      endDate: selectInfo.end ? new Date(selectInfo.end) : new Date(),
      description: '',
      color: 'blue',
      isPublic: false,
    });
    setIsFormOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    setEditingEvent({
      id: event.id,
      title: event.title,
      startDate: event.start ? new Date(event.start) : new Date(),
      endDate: event.end ? new Date(event.end) : new Date(),
      description: event.extendedProps?.description || '',
      color: event.backgroundColor || 'blue',
      isPublic: event.extendedProps?.isPublic ?? false,
    });
    setIsFormOpen(true);
  };

  // Mutation for updating an event via drag/resize
  const updateEventMutation = useMutation({
    mutationFn: async (updatedEvent: Pick<CalendarEvent, 'id' | 'startDate' | 'endDate'>) => {
      const res = await fetch(`/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ message: 'Failed to update event' }));
        throw new Error(errorBody.message || 'Failed to update event');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] } as InvalidateQueryFilters);
      
      // Sync event update to other clients
      syncEventUpdate(data);
    },
  });

  const handleEventDrop = (dropInfo: any) => {
    updateEventMutation.mutate({
      id: dropInfo.event.id,
      startDate: dropInfo.event.start ? dropInfo.event.start.toISOString() : '',
      endDate: dropInfo.event.end ? dropInfo.event.end.toISOString() : '',
    });
  };

  const handleEventResize = (resizeInfo: any) => {
    updateEventMutation.mutate({
      id: resizeInfo.event.id,
      startDate: resizeInfo.event.start ? resizeInfo.event.start.toISOString() : '',
      endDate: resizeInfo.event.end ? resizeInfo.event.end.toISOString() : '',
    });
  };

  // Mutation for creating or editing an event
  const formMutation = useMutation({
    mutationFn: async (formData: Partial<CalendarEvent>) => {
      // El formulario siempre envía fechas como string ISO, no es necesario typeof/instanceof
      const payload = {
        ...formData,
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
      };
      const method = payload.id ? 'PUT' : 'POST';
      const url = payload.id ? `/api/events/${payload.id}` : '/api/events';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ message: 'Failed to process request' }));
        throw new Error(errorBody.message || 'Failed to process request');
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] } as InvalidateQueryFilters);
      handleCloseForm();
      
      // Sync event to other clients
      if (variables.id) {
        syncEventUpdate(data);
      } else {
        syncEventCreation(data);
      }
    },
  });

  // Adaptador para convertir el formData del formulario (Date) a string antes de mutar
  const handleFormSubmit = (formData: Partial<CalendarEventForm>) => {
    formMutation.mutate({
      ...formData,
      startDate: formData.startDate ? (formData.startDate as Date).toISOString() : '',
      endDate: formData.endDate ? (formData.endDate as Date).toISOString() : '',
      description: formData.description || '',
    } as CalendarEvent);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CalendarDays className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl font-headline">Interactive Calendar</CardTitle>
                <CardDescription className="text-lg">
                  Schedule and manage your events with real-time synchronization.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ConnectionStatus />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPublicOnly(!showPublicOnly)}
                className="flex items-center space-x-2"
              >
                {showPublicOnly ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showPublicOnly ? 'Show All' : 'Public Only'}</span>
              </Button>
              <Button
                onClick={handleAddEvent}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Event</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <Loader />
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive font-medium">Error loading events</p>
              <p className="text-destructive/80 text-sm">{error.message}</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span>{filteredEvents.length} events</span>
                  </Badge>
                  {showPublicOnly && (
                    <Badge variant="outline">Showing public events only</Badge>
                  )}
                </div>
              </div>

              <div className="w-full bg-background rounded-lg border overflow-hidden">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView={currentView}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  events={filteredEvents}
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  height="auto"
                  contentHeight="500px"
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                  viewDidMount={(info) => setCurrentView(info.view.type)}
                  eventDisplay="block"
                  eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent?.id ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>
          <EventForm
            isOpen={isFormOpen}
            onClose={handleCloseForm}
            onSubmit={handleFormSubmit}
            initialData={editingEvent}
            isLoading={formMutation.isPending}
            error={formMutation.error}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
