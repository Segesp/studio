import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { createWebSocketServer } from '@/lib/websocket-server';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  if (res.socket.server.io) {
    console.log('Socket.IO server already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.IO server...');
  
  const { io } = createWebSocketServer(res.socket.server);
  res.socket.server.io = io;

  console.log('Socket.IO server initialized');
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
