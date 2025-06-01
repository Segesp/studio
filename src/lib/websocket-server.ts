import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as Y from 'yjs';

export interface WebSocketServer {
  io: SocketIOServer;
  docs: Map<string, Y.Doc>;
}

export function createWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : ['http://localhost:9002', 'http://localhost:3000'],
      credentials: true,
    },
    path: '/api/socket',
  });

  // Map to store Yjs documents for real-time collaboration
  const docs = new Map<string, Y.Doc>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle document collaboration
    socket.on('join-document', (docId: string) => {
      if (!docId) return;
      
      console.log(`Client ${socket.id} joining document: ${docId}`);
      socket.join(`doc:${docId}`);
      
      // Initialize Yjs document if it doesn't exist
      if (!docs.has(docId)) {
        const ydoc = new Y.Doc();
        docs.set(docId, ydoc);
        
        // Set up awareness and persistence
        ydoc.on('update', (update: Uint8Array) => {
          // Broadcast updates to all clients in the document room
          socket.to(`doc:${docId}`).emit('document-update', {
            docId,
            update: Array.from(update),
          });
        });
      }
      
      // Send current document state to the joining client
      const ydoc = docs.get(docId);
      if (ydoc) {
        const state = Y.encodeStateAsUpdate(ydoc);
        socket.emit('document-state', {
          docId,
          state: Array.from(state),
        });
      }
    });

    // Handle document updates from clients
    socket.on('document-update', ({ docId, update }: { docId: string; update: number[] }) => {
      if (!docId || !update) return;
      
      const ydoc = docs.get(docId);
      if (ydoc) {
        const updateArray = new Uint8Array(update);
        Y.applyUpdate(ydoc, updateArray);
        
        // Broadcast to other clients in the room
        socket.to(`doc:${docId}`).emit('document-update', { docId, update });
      }
    });

    // Handle leaving document
    socket.on('leave-document', (docId: string) => {
      if (!docId) return;
      
      console.log(`Client ${socket.id} leaving document: ${docId}`);
      socket.leave(`doc:${docId}`);
    });

    // Handle task updates for real-time task synchronization
    socket.on('join-tasks', (userId: string) => {
      if (!userId) return;
      
      console.log(`Client ${socket.id} joining tasks for user: ${userId}`);
      socket.join(`tasks:${userId}`);
    });

    socket.on('task-updated', (data: { userId: string; task: any }) => {
      socket.to(`tasks:${data.userId}`).emit('task-updated', data.task);
    });

    socket.on('task-created', (data: { userId: string; task: any }) => {
      socket.to(`tasks:${data.userId}`).emit('task-created', data.task);
    });

    socket.on('task-deleted', (data: { userId: string; taskId: string }) => {
      socket.to(`tasks:${data.userId}`).emit('task-deleted', data.taskId);
    });

    // Handle calendar event updates
    socket.on('join-calendar', (userId: string) => {
      if (!userId) return;
      
      console.log(`Client ${socket.id} joining calendar for user: ${userId}`);
      socket.join(`calendar:${userId}`);
    });

    socket.on('event-updated', (data: { userId: string; event: any }) => {
      socket.to(`calendar:${data.userId}`).emit('event-updated', data.event);
    });

    socket.on('event-created', (data: { userId: string; event: any }) => {
      socket.to(`calendar:${data.userId}`).emit('event-created', data.event);
    });

    socket.on('event-deleted', (data: { userId: string; eventId: string }) => {
      socket.to(`calendar:${data.userId}`).emit('event-deleted', data.eventId);
    });

    // Handle user presence and awareness
    socket.on('user-presence', (data: { docId: string; user: any; cursor?: any }) => {
      socket.to(`doc:${data.docId}`).emit('user-presence', {
        socketId: socket.id,
        user: data.user,
        cursor: data.cursor,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Notify all rooms about user going offline
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('doc:')) {
          socket.to(room).emit('user-offline', { socketId: socket.id });
        }
      });
    });
  });

  return { io, docs };
}
