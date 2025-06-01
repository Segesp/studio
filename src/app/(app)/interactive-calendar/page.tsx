'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // Corrected import path
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { EventForm } from '@/components/calendar/EventForm'; // Import EventForm
import type { CalendarEventForm } from '@/components/calendar/EventForm';

import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Assuming these are in your ui directory
import { Loader } from '@/components/ui/loader';

// Define the Event interface basado en la API (fechas string)
interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string; // Hacemos description obligatoria para evitar incompatibilidad
  color?: string;
  isPublic?: boolean;
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
  }));
};

export default function InteractiveCalendarPage() {
  // Get query client
  const queryClient = useQueryClient(); // Get query client
  const { data: events, isLoading, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });

  // Placeholder state for managing the event form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventForm | null>(null); // For editing

  // Placeholder function to close the form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null); // Reset editing event
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] } as InvalidateQueryFilters);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] } as InvalidateQueryFilters);
      handleCloseForm();
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
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Interactive Calendar</CardTitle> 
          </div>
          <CardDescription className="text-lg">
            Manage your schedule with day, week, and month views.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-12 text-center">
            {isLoading && <Loader />}
            {error && <div className="text-red-500">Error loading events: {error.message}</div>}
            {!isLoading && !error && (
              <div className="w-full">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  events={events || []}
                  editable={true}
                  selectable={true}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                />
              </div>
            )}
            {isFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <EventForm
                  isOpen={isFormOpen}
                  onClose={handleCloseForm}
                  onSubmit={handleFormSubmit}
                  initialData={editingEvent}
                  isLoading={formMutation.isPending}
                  error={formMutation.error}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
