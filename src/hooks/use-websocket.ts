'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  path?: string;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  socket: Socket | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): WebSocketState {
  const { autoConnect = true, path = '/api/socket' } = options;
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    socket: null,
  });

  useEffect(() => {
    if (!autoConnect || !session?.user) return;

    const connect = () => {
      if (socketRef.current?.connected) return;

      setState(prev => ({ ...prev, connecting: true, error: null }));

      const socket = io({
        path,
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
      });

      socket.on('connect', () => {
        console.log('WebSocket connected:', socket.id);
        setState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          error: null,
          socket,
        }));
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          socket: null,
        }));
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setState(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          error: error.message || 'Connection failed',
          socket: null,
        }));
      });

      socketRef.current = socket;
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [autoConnect, session?.user, path]);

  return state;
}

// Hook específico para colaboración en documentos
export function useDocumentCollaboration(docId: string | null) {
  const { socket, connected } = useWebSocket();
  const [collaborators, setCollaborators] = useState<Array<{ socketId: string; user: any; cursor?: any }>>([]);
  const [documentState, setDocumentState] = useState<Uint8Array | null>(null);

  useEffect(() => {
    if (!socket || !connected || !docId) return;

    // Join document room
    socket.emit('join-document', docId);

    // Listen for document state
    const handleDocumentState = ({ docId: receivedDocId, state }: { docId: string; state: number[] }) => {
      if (receivedDocId === docId) {
        setDocumentState(new Uint8Array(state));
      }
    };

    // Listen for document updates
    const handleDocumentUpdate = ({ docId: receivedDocId, update }: { docId: string; update: number[] }) => {
      if (receivedDocId === docId) {
        // This will be handled by the Yjs document directly
        console.log('Document update received for:', receivedDocId);
      }
    };

    // Listen for user presence
    const handleUserPresence = (data: { socketId: string; user: any; cursor?: any }) => {
      setCollaborators(prev => {
        const existing = prev.find(c => c.socketId === data.socketId);
        if (existing) {
          return prev.map(c => c.socketId === data.socketId ? data : c);
        }
        return [...prev, data];
      });
    };

    // Listen for user going offline
    const handleUserOffline = ({ socketId }: { socketId: string }) => {
      setCollaborators(prev => prev.filter(c => c.socketId !== socketId));
    };

    socket.on('document-state', handleDocumentState);
    socket.on('document-update', handleDocumentUpdate);
    socket.on('user-presence', handleUserPresence);
    socket.on('user-offline', handleUserOffline);

    return () => {
      socket.emit('leave-document', docId);
      socket.off('document-state', handleDocumentState);
      socket.off('document-update', handleDocumentUpdate);
      socket.off('user-presence', handleUserPresence);
      socket.off('user-offline', handleUserOffline);
      setCollaborators([]);
      setDocumentState(null);
    };
  }, [socket, connected, docId]);

  const sendUpdate = (update: Uint8Array) => {
    if (socket && connected && docId) {
      socket.emit('document-update', {
        docId,
        update: Array.from(update),
      });
    }
  };

  const sendPresence = (user: any, cursor?: any) => {
    if (socket && connected && docId) {
      socket.emit('user-presence', { docId, user, cursor });
    }
  };

  return {
    collaborators,
    documentState,
    sendUpdate,
    sendPresence,
    connected,
  };
}

// Hook para sincronización de tareas
export function useTaskSync(userId: string | null) {
  const { socket, connected } = useWebSocket();
  const [taskUpdates, setTaskUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !connected || !userId) return;

    socket.emit('join-tasks', userId);

    // Listen for real-time task updates
    const handleTaskUpdated = (task: any) => {
      setTaskUpdates(prev => [...prev, { type: 'updated', task, timestamp: Date.now() }]);
    };

    const handleTaskCreated = (task: any) => {
      setTaskUpdates(prev => [...prev, { type: 'created', task, timestamp: Date.now() }]);
    };

    const handleTaskDeleted = (taskId: string) => {
      setTaskUpdates(prev => [...prev, { type: 'deleted', taskId, timestamp: Date.now() }]);
    };

    socket.on('task-updated', handleTaskUpdated);
    socket.on('task-created', handleTaskCreated);
    socket.on('task-deleted', handleTaskDeleted);

    return () => {
      socket.off('task-updated', handleTaskUpdated);
      socket.off('task-created', handleTaskCreated);
      socket.off('task-deleted', handleTaskDeleted);
    };
  }, [socket, connected, userId]);

  const syncTaskUpdate = (task: any) => {
    if (socket && connected && userId) {
      socket.emit('task-updated', { userId, task });
    }
  };

  const syncTaskCreation = (task: any) => {
    if (socket && connected && userId) {
      socket.emit('task-created', { userId, task });
    }
  };

  const syncTaskDeletion = (taskId: string) => {
    if (socket && connected && userId) {
      socket.emit('task-deleted', { userId, taskId });
    }
  };

  return {
    syncTaskUpdate,
    syncTaskCreation,
    syncTaskDeletion,
    taskUpdates,
    connected,
  };
}

// Hook para sincronización de calendario
export function useCalendarSync(userId: string | null) {
  const { socket, connected } = useWebSocket();
  const [eventUpdates, setEventUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !connected || !userId) return;

    socket.emit('join-calendar', userId);

    // Listen for real-time event updates
    const handleEventUpdated = (event: any) => {
      setEventUpdates(prev => [...prev, { type: 'updated', event, timestamp: Date.now() }]);
    };

    const handleEventCreated = (event: any) => {
      setEventUpdates(prev => [...prev, { type: 'created', event, timestamp: Date.now() }]);
    };

    const handleEventDeleted = (eventId: string) => {
      setEventUpdates(prev => [...prev, { type: 'deleted', eventId, timestamp: Date.now() }]);
    };

    socket.on('event-updated', handleEventUpdated);
    socket.on('event-created', handleEventCreated);
    socket.on('event-deleted', handleEventDeleted);

    return () => {
      socket.off('event-updated', handleEventUpdated);
      socket.off('event-created', handleEventCreated);
      socket.off('event-deleted', handleEventDeleted);
    };
  }, [socket, connected, userId]);

  const syncEventUpdate = (event: any) => {
    if (socket && connected && userId) {
      socket.emit('event-updated', { userId, event });
    }
  };

  const syncEventCreation = (event: any) => {
    if (socket && connected && userId) {
      socket.emit('event-created', { userId, event });
    }
  };

  const syncEventDeletion = (eventId: string) => {
    if (socket && connected && userId) {
      socket.emit('event-deleted', { userId, eventId });
    }
  };

  return {
    syncEventUpdate,
    syncEventCreation,
    syncEventDeletion,
    eventUpdates,
    connected,
  };
}
