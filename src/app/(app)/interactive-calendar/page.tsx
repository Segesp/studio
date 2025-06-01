'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // Corrected import path
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { EventForm } from '@/components/calendar/EventForm'; // Import EventForm

import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Assuming these are in your ui directory
import { Loader } from '@/components/ui/loader';

// Define the Event interface based on your API response structure
interface Event {
  id: string;
  title: string;
  startDate: string; // Your API might return these names
  endDate: string;
  description?: string; // Added description
  color?: string;
  isPublic?: boolean;
  // Add other properties based on your Event type
}

interface EventResizeEvent {
  event: {
    id: string;
  };
  // Include other event properties as needed
}

// Function to fetch events from the API
const fetchEvents = async (): Promise<Event[]> => {
  const res = await fetch('/api/events');
  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }
  const events: Event[] = await res.json();

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
  const [editingEvent, setEditingEvent] = useState<Event | null>(null); // For editing

  // Placeholder function to close the form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null); // Reset editing event
  };

  // Placeholder callback functions for FullCalendar interactions
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    console.log('Date selected:', selectInfo);
    // Open event form for creation with pre-filled dates
    setEditingEvent({ id: '', title: '', startDate: selectInfo.startStr, endDate: selectInfo.endStr, color: 'blue', isPublic: false }); // Default values
    setIsFormOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log('Event clicked:', clickInfo.event);
    // Open event form for editing
    // FullCalendar event object is slightly different, map it back if needed or pass directly
    setEditingEvent(clickInfo.event as any); // Cast for now, proper mapping might be needed
    setIsFormOpen(true);
  };

  // Mutation for updating an event via drag/resize
  const { mutate: updateEventMutate, isLoading: isUpdatingEvent, error: updateError } = useMutation({
    mutationFn: async (updatedEvent: Pick<Event, 'id' | 'startDate' | 'endDate'>) => {
      const res = await fetch(`/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ message: 'Failed to update event' }));
        throw new Error(errorBody.message || 'Failed to update event');
      }

      return res.json();
    },
    onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['events'] } as InvalidateQueryFilters); // Refetch events after successful update
    },
    onError: (err: Error) => {
      console.error('Error updating event:', err.message);
      // Optionally, add logic here to show a notification to the user
      // Reverting the event position if the mutation fails
      // FullCalendar's internal state might need to be manually reverted here if revert() was not called earlier
      // or if you want to revert only on server-side failure.
    },
  });

  const handleEventDrop = (dropInfo: EventDropArg) => {
    console.log('Event dropped:', dropInfo.event);
    updateEventMutate({ id: dropInfo.event.id, startDate: dropInfo.event.startStr, endDate: dropInfo.event.endStr });
  };

  const handleEventResize = (resizeInfo: EventResizeEvent) => { // Use 'any' or more specific type from FullCalendar v6+
    console.log('Event resized:', resizeInfo.event);
    updateEventMutate({ id: resizeInfo.event.id, startDate: resizeInfo.event.startStr, endDate: resizeInfo.event.endStr });
  };

  // Mutation for creating or editing an event
  const onFormSubmit = useMutation({
    mutationFn: async (formData: Partial<Event>) => {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id ? `/api/events/${formData.id}` : '/api/events';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // Attempt to read the error message from the response body
        const errorBody = await res.json().catch(() => ({ message: 'Failed to process request' }));
        throw new Error(errorBody.message || 'Failed to process request');
      }

      return res.json(); // Or return response body if needed
    },
    onSuccess: () => {
      // Invalidate the events query to refetch events after a successful mutation
 queryClient.invalidateQueries({ queryKey: ['events'] } as InvalidateQueryFilters);
      handleCloseForm(); // Close the form after successful submission
    },
  });

  const { mutate: submitForm, isLoading: isSubmittingForm, error: formError } = onFormSubmit;

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
              <div className="w-full"> {/* Container to give FullCalendar context */}
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek" // Changed default view to timeGridWeek for better date selection demo
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  events={events || []}
                  editable={true} // Allow dragging and resizing
                  selectable={true} // Allow selecting dates
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                />
              </div> {/* Close the container div here */}
            )}
             {/* Placeholder for Event Form Modal */}
            {isFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <EventForm isOpen={isFormOpen} onClose={handleCloseForm} onSubmit={submitForm} initialData={editingEvent} isLoading={isSubmittingForm} error={formError} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
