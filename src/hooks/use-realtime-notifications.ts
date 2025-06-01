'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from './use-websocket';

export interface RealtimeNotification {
  id: string;
  type: 'task-updated' | 'task-created' | 'task-deleted' | 'event-updated' | 'event-created' | 'event-deleted' | 'document-updated';
  title: string;
  message: string;
  timestamp: number;
  data?: any;
}

export function useRealtimeNotifications() {
  const { socket, connected } = useWebSocket();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for various real-time updates and convert them to notifications
    const handleTaskUpdated = (data: any) => {
      addNotification({
        type: 'task-updated',
        title: 'Task Updated',
        message: `Task "${data.title}" was updated by another user`,
        data,
      });
    };

    const handleTaskCreated = (data: any) => {
      addNotification({
        type: 'task-created',
        title: 'New Task',
        message: `Task "${data.title}" was created by another user`,
        data,
      });
    };

    const handleTaskDeleted = (taskId: string) => {
      addNotification({
        type: 'task-deleted',
        title: 'Task Deleted',
        message: 'A task was deleted by another user',
        data: { taskId },
      });
    };

    const handleEventUpdated = (data: any) => {
      addNotification({
        type: 'event-updated',
        title: 'Event Updated',
        message: `Event "${data.title}" was updated by another user`,
        data,
      });
    };

    const handleEventCreated = (data: any) => {
      addNotification({
        type: 'event-created',
        title: 'New Event',
        message: `Event "${data.title}" was created by another user`,
        data,
      });
    };

    const handleEventDeleted = (eventId: string) => {
      addNotification({
        type: 'event-deleted',
        title: 'Event Deleted',
        message: 'An event was deleted by another user',
        data: { eventId },
      });
    };

    const handleDocumentUpdated = (data: any) => {
      addNotification({
        type: 'document-updated',
        title: 'Document Updated',
        message: `Document "${data.docId}" was updated by another user`,
        data,
      });
    };

    socket.on('task-updated', handleTaskUpdated);
    socket.on('task-created', handleTaskCreated);
    socket.on('task-deleted', handleTaskDeleted);
    socket.on('event-updated', handleEventUpdated);
    socket.on('event-created', handleEventCreated);
    socket.on('event-deleted', handleEventDeleted);
    socket.on('document-update', handleDocumentUpdated);

    return () => {
      socket.off('task-updated', handleTaskUpdated);
      socket.off('task-created', handleTaskCreated);
      socket.off('task-deleted', handleTaskDeleted);
      socket.off('event-updated', handleEventUpdated);
      socket.off('event-created', handleEventCreated);
      socket.off('event-deleted', handleEventDeleted);
      socket.off('document-update', handleDocumentUpdated);
    };
  }, [socket, connected]);

  const addNotification = (notification: Omit<RealtimeNotification, 'id' | 'timestamp'>) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    setNotifications(prev => [...prev.slice(-9), newNotification]); // Keep last 10 notifications
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    dismissNotification,
    clearAllNotifications,
    hasNotifications: notifications.length > 0,
    unreadCount: notifications.length,
  };
}
